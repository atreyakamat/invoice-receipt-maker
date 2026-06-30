import { Parser } from 'json2csv';
import * as xlsx from 'xlsx';
import prisma from '../utils/prisma';

export class ExportService {
  static async exportToCsv(organizationId: string) {
    const invoices = await prisma.invoice.findMany({
      where: { organizationId },
      include: { vendor: true },
    });

    const data = invoices.map(inv => ({
      'Invoice Number': inv.invoiceNumber,
      'Date': inv.invoiceDate.toISOString().split('T')[0],
      'Vendor': inv.vendor?.name || 'Unknown',
      'Subtotal': inv.subtotal.toString(),
      'Tax': inv.tax.toString(),
      'Total': inv.total.toString(),
      'Currency': inv.currency,
      'Status': inv.status,
    }));

    const parser = new Parser();
    return parser.parse(data);
  }

  static async exportToExcel(organizationId: string) {
    const invoices = await prisma.invoice.findMany({
      where: { organizationId },
      include: { vendor: true },
    });

    const data = invoices.map(inv => ({
      InvoiceNumber: inv.invoiceNumber,
      Date: inv.invoiceDate.toISOString().split('T')[0],
      Vendor: inv.vendor?.name || 'Unknown',
      Subtotal: Number(inv.subtotal),
      Tax: Number(inv.tax),
      Total: Number(inv.total),
      Currency: inv.currency,
      Status: inv.status,
    }));

    const worksheet = xlsx.utils.json_to_sheet(data);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Invoices');

    return xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }
}
