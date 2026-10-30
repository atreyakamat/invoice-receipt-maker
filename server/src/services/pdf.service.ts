import PDFDocument from 'pdfkit';
import type { IssuedInvoice, IssuedInvoiceItem, Customer, Organization } from '@prisma/client';

interface InvoicePdfInput {
  invoice: IssuedInvoice & { items: IssuedInvoiceItem[]; customer: Customer };
  organization: Pick<Organization, 'companyName' | 'legalName' | 'email' | 'phone' | 'website' | 'taxId'>;
}

const money = (value: unknown, currency: string) => {
  const n = Number(value) || 0;
  try {
    return new Intl.NumberFormat('en', { style: 'currency', currency }).format(n);
  } catch {
    return `${currency} ${n.toFixed(2)}`;
  }
};

const date = (value: Date | null | undefined) =>
  value ? new Date(value).toLocaleDateString('en', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }) : '-';

/** Standard PDF fonts can't draw most Unicode punctuation; swap common ones for ASCII. */
const safe = (value: string | null | undefined) =>
  (value ?? '')
    .replace(/[‐-―]/g, '-')
    .replace(/[‘’‚‛]/g, "'")
    .replace(/[“”„‟]/g, '"')
    .replace(/…/g, '...')
    .replace(/ /g, ' ');

/** Renders an invoice to a PDF Buffer. Single page for a few items; paginates automatically for many. */
export const renderInvoicePdf = ({ invoice, organization }: InvoicePdfInput): Promise<Buffer> =>
  new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 48, info: { Title: `Invoice ${invoice.number}`, Author: safe(organization.companyName) } });
    const chunks: Buffer[] = [];
    doc.on('data', c => chunks.push(c));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const left = 48;
    const right = 547;
    const brand = '#1976D2';

    // Header
    doc.fillColor('#111').font('Helvetica-Bold').fontSize(22).text(organization.companyName, left, 48);
    doc.font('Helvetica').fontSize(10).fillColor('#555');
    const headerLines = [organization.legalName, organization.email, organization.phone, organization.website].filter(Boolean).map(v => safe(v as string));
    if (headerLines.length) doc.text(safe(headerLines.join('  -  ')), left, 76);

    doc.fillColor(brand).font('Helvetica-Bold').fontSize(26).text('INVOICE', 0, 48, { align: 'right' });
    doc.fillColor('#555').font('Helvetica').fontSize(10).text(safe(`# ${invoice.number}`), 0, 80, { align: 'right' });

    // Bill-to and metadata
    const metaTop = 130;
    doc.fillColor('#777').font('Helvetica').fontSize(9).text('BILL TO', left, metaTop);
    doc.fillColor('#111').font('Helvetica-Bold').fontSize(12).text(safe(invoice.customer.name), left, metaTop + 14);
    doc.font('Helvetica').fontSize(10).fillColor('#333');
    const billLines = [
      invoice.customer.addressLine1,
      invoice.customer.addressLine2,
      [invoice.customer.city, invoice.customer.state, invoice.customer.postalCode].filter(Boolean).join(', ') || null,
      invoice.customer.country,
      invoice.customer.email,
      invoice.customer.taxId ? `Tax ID: ${invoice.customer.taxId}` : null,
    ].filter(Boolean) as string[];
    let y = metaTop + 30;
    for (const line of billLines) {
      doc.text(safe(line), left, y);
      y += 13;
    }

    // Right-side metadata
    const rightLabel = 380;
    const rightValue = 460;
    const kv = (row: number, label: string, value: string, bold = false) => {
      const ry = metaTop + row * 18;
      doc.font('Helvetica').fillColor('#777').fontSize(9).text(label, rightLabel, ry, { width: 70, align: 'right' });
      doc.font(bold ? 'Helvetica-Bold' : 'Helvetica').fillColor('#111').fontSize(10).text(value, rightValue, ry - 1, { width: right - rightValue, align: 'right' });
    };
    kv(0, 'Issued', date(invoice.issueDate));
    if (invoice.dueDate) kv(1, 'Due', date(invoice.dueDate));
    if (organization.taxId) kv(2, 'From tax ID', safe(organization.taxId));

    // Items table
    const tableTop = Math.max(y, metaTop + 90) + 20;
    const cols = { desc: left, qty: 340, price: 400, amount: right };
    doc.rect(left, tableTop, right - left, 24).fill('#F3F6FB');
    doc.fillColor('#444').font('Helvetica-Bold').fontSize(10);
    doc.text('Description', cols.desc + 10, tableTop + 8);
    doc.text('Qty', cols.qty, tableTop + 8, { width: 50, align: 'right' });
    doc.text('Price', cols.price, tableTop + 8, { width: 70, align: 'right' });
    doc.text('Amount', cols.amount - 90, tableTop + 8, { width: 80, align: 'right' });

    doc.font('Helvetica').fontSize(10).fillColor('#111');
    let rowY = tableTop + 32;
    for (const item of invoice.items) {
      const descHeight = doc.heightOfString(item.description, { width: cols.qty - cols.desc - 20 });
      const rowHeight = Math.max(descHeight + 10, 22);
      if (rowY + rowHeight > 720) {
        doc.addPage();
        rowY = 60;
      }
      doc.text(safe(item.description), cols.desc + 10, rowY, { width: cols.qty - cols.desc - 20 });
      doc.text(String(Number(item.quantity)), cols.qty, rowY, { width: 50, align: 'right' });
      doc.text(money(item.unitPrice, invoice.currency), cols.price, rowY, { width: 70, align: 'right' });
      doc.text(money(item.total, invoice.currency), cols.amount - 90, rowY, { width: 80, align: 'right' });
      rowY += rowHeight;
      doc.moveTo(left, rowY).lineTo(right, rowY).strokeColor('#EEE').lineWidth(0.5).stroke();
      rowY += 6;
    }

    // Totals
    const totalsTop = rowY + 16;
    const totalRow = (label: string, value: string, i: number, bold = false) => {
      const ty = totalsTop + i * 20;
      doc.font('Helvetica').fillColor('#555').fontSize(10).text(label, 340, ty, { width: 110, align: 'right' });
      doc.font(bold ? 'Helvetica-Bold' : 'Helvetica').fillColor('#111').fontSize(bold ? 12 : 10).text(value, 460, ty - (bold ? 1 : 0), { width: right - 460, align: 'right' });
    };
    const totals: [string, number][] = [
      ['Subtotal', Number(invoice.subtotal)],
      ...(Number(invoice.discount) > 0 ? ([['Discount', -Number(invoice.discount)]] as [string, number][]) : []),
      ...(Number(invoice.tax) > 0 ? ([['Tax', Number(invoice.tax)]] as [string, number][]) : []),
      ...(Number(invoice.shipping) > 0 ? ([['Shipping', Number(invoice.shipping)]] as [string, number][]) : []),
    ];
    totals.forEach(([label, value], i) => totalRow(label, money(value, invoice.currency), i));
    doc.moveTo(340, totalsTop + totals.length * 20 + 4).lineTo(right, totalsTop + totals.length * 20 + 4).strokeColor('#DDD').lineWidth(0.75).stroke();
    totalRow('Total', money(invoice.total, invoice.currency), totals.length + 0.4, true);

    // Notes / terms
    let footY = totalsTop + totals.length * 20 + 56;
    const block = (title: string, text: string | null) => {
      if (!text) return;
      doc.fillColor('#777').font('Helvetica').fontSize(9).text(title.toUpperCase(), left, footY);
      doc.fillColor('#333').font('Helvetica').fontSize(10).text(text, left, footY + 14, { width: right - left });
      footY += 20 + doc.heightOfString(text, { width: right - left });
    };
    block('Notes', safe(invoice.notes));
    block('Terms', safe(invoice.terms));

    doc.end();
  });
