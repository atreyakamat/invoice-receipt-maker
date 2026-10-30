export type InvoiceStatus = 'QUEUED' | 'OCR' | 'AI' | 'VALIDATION' | 'COMPLETED' | 'REJECTED' | 'FAILED';

type ChipColor = 'default' | 'info' | 'warning' | 'success' | 'error';

export const STATUS: Record<InvoiceStatus, { label: string; color: ChipColor }> = {
  QUEUED: { label: 'Queued', color: 'info' },
  OCR: { label: 'Reading', color: 'info' },
  AI: { label: 'Extracting', color: 'info' },
  VALIDATION: { label: 'Needs review', color: 'warning' },
  COMPLETED: { label: 'Approved', color: 'success' },
  REJECTED: { label: 'Rejected', color: 'default' },
  FAILED: { label: 'Failed', color: 'error' },
};

export const PROCESSING_STATUSES: InvoiceStatus[] = ['QUEUED', 'OCR', 'AI'];
export const isProcessing = (status: InvoiceStatus) => PROCESSING_STATUSES.includes(status);

const formatters = new Map<string, Intl.NumberFormat>();

export const money = (value: number | string | null | undefined, currency = 'USD', compact = false) => {
  const key = `${currency}:${compact}`;
  let fmt = formatters.get(key);
  if (!fmt) {
    try {
      fmt = new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency,
        ...(compact ? { notation: 'compact', maximumFractionDigits: 1 } : {}),
      });
    } catch {
      fmt = new Intl.NumberFormat(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    formatters.set(key, fmt);
  }
  return fmt.format(Number(value) || 0);
};

export const date = (value: string | Date | null | undefined) =>
  value ? new Date(value).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }) : '—';

export const relativeTime = (value: string | Date) => {
  const seconds = (Date.now() - new Date(value).getTime()) / 1000;
  const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' });
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return rtf.format(-Math.floor(seconds / 60), 'minute');
  if (seconds < 86400) return rtf.format(-Math.floor(seconds / 3600), 'hour');
  if (seconds < 86400 * 30) return rtf.format(-Math.floor(seconds / 86400), 'day');
  return date(value);
};

export const toInputDate = (value: string | Date | null | undefined) => (value ? new Date(value).toISOString().slice(0, 10) : '');

export const fileSize = (bytes: number) =>
  bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`;

export const isPlaceholderNumber = (n: string) => n.startsWith('PENDING-');

export const CURRENCIES = ['USD', 'EUR', 'GBP', 'INR', 'AUD', 'CAD', 'SGD', 'AED', 'JPY', 'CHF', 'NZD', 'ZAR'];
