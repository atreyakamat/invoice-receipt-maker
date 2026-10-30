import type { InvoiceStatus } from './format';

export interface InvoiceSummary {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string | null;
  currency: string;
  subtotal: string;
  tax: string;
  total: string;
  confidence: string;
  status: InvoiceStatus;
  category: string | null;
  fileName: string | null;
  mimeType: string | null;
  vendorName: string | null;
  createdAt: string;
}

export interface InvoiceItem {
  id?: string;
  description: string;
  quantity: string | number;
  unitPrice: string | number;
  total: string | number;
}

export interface InvoiceDetail extends Omit<InvoiceSummary, 'vendorName'> {
  discount: string;
  shipping: string;
  notes: string | null;
  vendor: { id: string; name: string } | null;
  items: InvoiceItem[];
  ocrResult: { rawText: string; confidence: string; pageCount: number } | null;
  aiResult: { vendorName: string; invoiceNumber: string; reasoning: string | null } | null;
  aiJob: { model: string; status: string; errorMessage: string | null } | null;
  validation: { score: string; status: string; warnings: string[] | null; comments: string | null } | null;
}

export interface Vendor {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  website: string | null;
  gstNumber: string | null;
  addressLine1: string | null;
  city: string | null;
  country: string | null;
  notes: string | null;
  invoiceCount: number;
  totalSpend: number;
  lastInvoiceDate: string | null;
}

export interface Meta {
  aiEnabled: boolean;
  aiModel: string | null;
  categories: string[];
}
