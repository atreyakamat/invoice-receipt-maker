import { Parser } from 'json2csv';
import * as xlsx from 'xlsx';
import { InvoiceStatus, Prisma } from '@prisma/client';
import prisma from '../utils/prisma';

export interface ExportFilter {
  status?: 'approved' | 'all';
  from?: string;
  to?: string;
}

const day = (d: Date | null) => (d ? d.toISOString().split('T')[0] : '');

export class ExportService {
  private static async rows(organizationId: string, filter: ExportFilter) {
    const where: Prisma.InvoiceWhereInput = { organizationId, deletedAt: null };
    where.status = filter.status === 'all'
      ? { in: [InvoiceStatus.COMPLETED, InvoiceStatus.VALIDATION, InvoiceStatus.REJECTED] }
      : InvoiceStatus.COMPLETED;
    if (filter.from || filter.to) {
      where.invoiceDate = {
        ...(filter.from && { gte: new Date(filter.from) }),
        ...(filter.to && { lte: new Date(`${filter.to}T23:59:59.999Z`) }),
      };
    }

    const invoices = await prisma.invoice.findMany({
      where,
      include: { vendor: true },
      orderBy: { invoiceDate: 'asc' },
    });

    return invoices.map(inv => ({
      'Invoice Number': inv.invoiceNumber,
      'Invoice Date': day(inv.invoiceDate),
      'Due Date': day(inv.dueDate),
      Vendor: inv.vendor?.name || '',
      'Vendor Tax ID': inv.vendor?.gstNumber || inv.vendor?.taxNumber || '',
      Category: inv.category || '',
      Currency: inv.currency,
      Subtotal: Number(inv.subtotal),
      Tax: Number(inv.tax),
      Discount: Number(inv.discount),
      Shipping: Number(inv.shipping),
      Total: Number(inv.total),
      Status: inv.status === InvoiceStatus.COMPLETED ? 'Approved' : inv.status === InvoiceStatus.REJECTED ? 'Rejected' : 'Needs review',
      Notes: inv.notes || '',
      'Source File': inv.fileName || '',
    }));
  }

  static async exportToCsv(organizationId: string, filter: ExportFilter) {
    const data = await this.rows(organizationId, filter);
    const fields = data.length ? undefined : ['Invoice Number', 'Invoice Date', 'Vendor', 'Total'];
    return new Parser({ fields }).parse(data);
  }

  static async exportToExcel(organizationId: string, filter: ExportFilter) {
    const worksheet = xlsx.utils.json_to_sheet(await this.rows(organizationId, filter));
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Invoices');
    return xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }
}
