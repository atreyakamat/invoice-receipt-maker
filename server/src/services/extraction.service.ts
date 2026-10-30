import OpenAI from 'openai';
import { config } from '../config';

export interface ExtractedItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface ExtractedInvoice {
  vendorName: string | null;
  invoiceNumber: string | null;
  invoiceDate: string | null;
  dueDate: string | null;
  currency: string | null;
  subtotal: number | null;
  tax: number | null;
  discount: number | null;
  shipping: number | null;
  total: number | null;
  paymentTerms: string | null;
  category: string | null;
  items: ExtractedItem[];
  confidence: number;
}

export const CATEGORIES = [
  'Software', 'Hardware', 'Office Supplies', 'Travel', 'Meals', 'Utilities', 'Rent',
  'Professional Services', 'Marketing', 'Shipping', 'Telecom', 'Other',
];

const CATEGORY_KEYWORDS: Record<string, RegExp> = {
  Software: /\b(software|saas|subscription|license|cloud|hosting|aws|azure|github|slack|adobe|google workspace)\b/i,
  'Office Supplies': /\b(stationery|paper|office supplies|toner|ink|pens?)\b/i,
  Hardware: /\b(laptop|monitor|keyboard|hardware|computer|printer|device)\b/i,
  Travel: /\b(flight|airline|hotel|taxi|uber|lyft|train|travel|booking)\b/i,
  Meals: /\b(restaurant|cafe|coffee|meal|food|dining|catering)\b/i,
  Utilities: /\b(electricity|water|gas bill|utility|power)\b/i,
  Rent: /\b(rent|lease|premises)\b/i,
  'Professional Services': /\b(consulting|legal|accounting|audit|advisory|services rendered|retainer)\b/i,
  Marketing: /\b(advertising|ads|marketing|campaign|promotion|seo)\b/i,
  Shipping: /\b(shipping|courier|freight|delivery|fedex|ups|dhl)\b/i,
  Telecom: /\b(internet|broadband|mobile|telecom|phone plan)\b/i,
};

const CURRENCY_SYMBOLS: [RegExp, string][] = [
  [/₹|\bRs\.?|\bINR\b/i, 'INR'],
  [/€|\bEUR\b/, 'EUR'],
  [/£|\bGBP\b/, 'GBP'],
  [/\bAUD\b|A\$/, 'AUD'],
  [/\bCAD\b|C\$/, 'CAD'],
  [/\bSGD\b|S\$/, 'SGD'],
  [/\bAED\b/, 'AED'],
  [/¥|\bJPY\b/, 'JPY'],
  [/\$|\bUSD\b/, 'USD'],
];

const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

export const parseAmount = (raw: string): number | null => {
  let s = raw.replace(/[^\d.,-]/g, '');
  if (!s || !/\d/.test(s)) return null;
  const lastComma = s.lastIndexOf(',');
  const lastDot = s.lastIndexOf('.');
  if (lastComma > -1 && lastDot > -1) {
    // Whichever separator comes last is the decimal separator.
    s = lastComma > lastDot ? s.replace(/\./g, '').replace(',', '.') : s.replace(/,/g, '');
  } else if (lastComma > -1) {
    s = /,\d{2}$/.test(s) && (s.match(/,/g) || []).length === 1 ? s.replace(',', '.') : s.replace(/,/g, '');
  }
  const n = parseFloat(s);
  return Number.isFinite(n) ? Math.round(n * 100) / 100 : null;
};

const AMOUNT_RE = /-?(?:\d{1,3}(?:[,.\s]\d{3})+|\d+)(?:[.,]\d{2})?/g;

const lastAmountOnLine = (line: string): number | null => {
  const matches = line.match(AMOUNT_RE);
  if (!matches) return null;
  for (let i = matches.length - 1; i >= 0; i--) {
    const value = parseAmount(matches[i]);
    if (value !== null) return value;
  }
  return null;
};

const toIso = (y: number, m: number, d: number): string | null => {
  if (y < 100) y += 2000;
  if (m < 1 || m > 12 || d < 1 || d > 31 || y < 1990 || y > 2100) return null;
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
};

export const parseDate = (text: string): string | null => {
  let m = text.match(/\b(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})\b/);
  if (m) return toIso(+m[1], +m[2], +m[3]);

  m = text.match(/\b(\d{1,2})(?:st|nd|rd|th)?[\s-]+([A-Za-z]{3,9})\.?,?[\s-]+(\d{2,4})\b/);
  if (m && MONTHS.includes(m[2].slice(0, 3).toLowerCase())) {
    return toIso(+m[3], MONTHS.indexOf(m[2].slice(0, 3).toLowerCase()) + 1, +m[1]);
  }

  m = text.match(/\b([A-Za-z]{3,9})\.?\s+(\d{1,2})(?:st|nd|rd|th)?,?\s+(\d{4})\b/);
  if (m && MONTHS.includes(m[1].slice(0, 3).toLowerCase())) {
    return toIso(+m[3], MONTHS.indexOf(m[1].slice(0, 3).toLowerCase()) + 1, +m[2]);
  }

  m = text.match(/\b(\d{1,2})[/.-](\d{1,2})[/.-](\d{2,4})\b/);
  if (m) {
    const a = +m[1];
    const b = +m[2];
    // Ambiguous dd/mm vs mm/dd: assume day-first unless that is impossible.
    return b > 12 ? toIso(+m[3], a, b) : toIso(+m[3], b, a);
  }
  return null;
};

/** Rule-based extraction used when no AI provider is configured (or the AI call fails). */
export const heuristicExtract = (text: string): ExtractedInvoice => {
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

  const findLine = (re: RegExp, exclude?: RegExp) => lines.find(l => re.test(l) && !(exclude && exclude.test(l)));
  const amountFor = (re: RegExp, exclude?: RegExp) => {
    const matching = lines.filter(l => re.test(l) && !(exclude && exclude.test(l)));
    for (let i = matching.length - 1; i >= 0; i--) {
      const value = lastAmountOnLine(matching[i]);
      if (value !== null) return value;
    }
    return null;
  };

  const numberRe = /(?:invoice|inv|bill|receipt)[ \t]*(?:no\.?|number|num|#|id)?[ \t]*[:#.]?[ \t]*([A-Z0-9][A-Z0-9\-/]{2,})/gi;
  const invoiceNumber = [...text.matchAll(numberRe)].map(m => m[1]).find(n => /\d/.test(n)) ?? null;

  const dateLine = findLine(/(invoice|issue|bill|receipt)?\s*date/i, /due/i);
  const invoiceDate = (dateLine && parseDate(dateLine)) || parseDate(text);
  const dueLine = findLine(/due\s*(date|on|by)?/i);
  const dueDate = dueLine ? parseDate(dueLine) : null;

  let total = amountFor(/(grand\s*total|amount\s*due|balance\s*due|total\s*due|total\s*amount)/i);
  if (total === null) total = amountFor(/\btotal\b/i, /sub\s*-?\s*total/i);
  const subtotal = amountFor(/sub\s*-?\s*total|net\s*amount|taxable/i);
  const tax = amountFor(/\b(tax|vat|gst|igst|cgst|sgst|hst)\b/i, /(total|invoice|number|id|no\.)/i);
  const discount = amountFor(/\bdiscount\b/i);
  const shipping = amountFor(/\b(shipping|delivery|freight)\b/i);

  if (total === null) {
    const all = (text.match(AMOUNT_RE) || []).map(parseAmount).filter((n): n is number => n !== null && n < 1e9);
    const decimals = all.filter(n => !Number.isInteger(n));
    if (decimals.length) total = Math.max(...decimals);
  }

  const currency = CURRENCY_SYMBOLS.find(([re]) => re.test(text))?.[1] ?? null;

  const vendorName =
    lines
      .slice(0, 8)
      .find(l => /[A-Za-z]{3,}/.test(l) && !/^(tax\s*)?(invoice|receipt|bill|statement|page)\b/i.test(l) && l.length <= 60)
      ?.replace(/[^\p{L}\p{N}&.,'\- ]/gu, '')
      .trim() || null;

  const category = Object.entries(CATEGORY_KEYWORDS).find(([, re]) => re.test(text))?.[0] ?? null;
  const termsMatch = text.match(/\b(net\s*\d{1,3}|due on receipt)\b/i);

  const fields = [vendorName, invoiceNumber, invoiceDate, total, currency];
  const found = fields.filter(f => f !== null).length;

  return {
    vendorName,
    invoiceNumber,
    invoiceDate,
    dueDate,
    currency,
    subtotal,
    tax,
    discount,
    shipping,
    total,
    paymentTerms: termsMatch ? termsMatch[1] : null,
    category,
    items: [],
    confidence: Math.round((found / fields.length) * 70),
  };
};

const AI_PROMPT = `You extract structured data from invoice or receipt text produced by OCR.
Return ONLY a JSON object with these keys:
vendorName (string), invoiceNumber (string), invoiceDate (YYYY-MM-DD), dueDate (YYYY-MM-DD or null),
currency (ISO 4217 code), subtotal (number), tax (number, sum of all taxes), discount (number), shipping (number),
total (number), paymentTerms (string or null), category (one of: ${CATEGORIES.join(', ')}),
items (array of {description, quantity, unitPrice, total}), confidence (0-100, your confidence in the extraction).
Use null for anything not present. Numbers must be plain numbers without symbols or thousands separators.`;

const num = (v: unknown): number | null => {
  if (v === null || v === undefined || v === '') return null;
  const n = typeof v === 'number' ? v : parseAmount(String(v));
  return n !== null && Number.isFinite(n) ? Math.round(n * 100) / 100 : null;
};
const str = (v: unknown): string | null => (typeof v === 'string' && v.trim() ? v.trim() : null);

export const normalizeExtraction = (raw: any, fallback: ExtractedInvoice): ExtractedInvoice => {
  const date = (v: unknown) => (str(v) ? parseDate(String(v)) : null);
  const items: ExtractedItem[] = Array.isArray(raw.items)
    ? raw.items
        .map((i: any) => ({
          description: str(i?.description) || '',
          quantity: num(i?.quantity) ?? 1,
          unitPrice: num(i?.unitPrice) ?? 0,
          total: num(i?.total) ?? (num(i?.quantity) ?? 1) * (num(i?.unitPrice) ?? 0),
        }))
        .filter((i: ExtractedItem) => i.description)
    : [];

  const currency = str(raw.currency)?.toUpperCase();
  const category = CATEGORIES.find(c => c.toLowerCase() === str(raw.category)?.toLowerCase());

  return {
    vendorName: str(raw.vendorName) ?? fallback.vendorName,
    invoiceNumber: str(raw.invoiceNumber) ?? fallback.invoiceNumber,
    invoiceDate: date(raw.invoiceDate) ?? fallback.invoiceDate,
    dueDate: date(raw.dueDate) ?? fallback.dueDate,
    currency: currency && /^[A-Z]{3}$/.test(currency) ? currency : fallback.currency,
    subtotal: num(raw.subtotal) ?? fallback.subtotal,
    tax: num(raw.tax) ?? fallback.tax,
    discount: num(raw.discount) ?? fallback.discount,
    shipping: num(raw.shipping) ?? fallback.shipping,
    total: num(raw.total) ?? fallback.total,
    paymentTerms: str(raw.paymentTerms) ?? fallback.paymentTerms,
    category: category ?? fallback.category,
    items,
    confidence: Math.max(0, Math.min(100, num(raw.confidence) ?? 85)),
  };
};

let client: OpenAI | null = null;

export const aiEnabled = () => Boolean(config.ai.apiKey);

export const aiExtract = async (text: string): Promise<ExtractedInvoice> => {
  client ??= new OpenAI({ apiKey: config.ai.apiKey, baseURL: config.ai.baseUrl });
  const response = await client.chat.completions.create({
    model: config.ai.model,
    temperature: 0,
    messages: [
      { role: 'system', content: AI_PROMPT },
      { role: 'user', content: text.slice(0, 30000) },
    ],
  });
  const content = response.choices[0]?.message?.content || '';
  const json = content.match(/\{[\s\S]*\}/);
  if (!json) throw new Error('AI response did not contain JSON');
  return normalizeExtraction(JSON.parse(json[0]), heuristicExtract(text));
};
