import { Request, Response, NextFunction } from 'express';
import { InvoiceStatus } from '@prisma/client';
import prisma from '../utils/prisma';

const monthKey = (d: Date) => `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;

export class DashboardController {
  static async getAnalytics(req: Request, res: Response, next: NextFunction) {
    try {
      const orgId = (req as any).user.organizationId;

      const [org, invoices] = await Promise.all([
        prisma.organization.findUnique({ where: { id: orgId }, select: { currency: true } }),
        prisma.invoice.findMany({
          where: { organizationId: orgId, deletedAt: null },
          select: {
            id: true, invoiceNumber: true, invoiceDate: true, total: true, currency: true, status: true,
            confidence: true, category: true, fileName: true, createdAt: true,
            vendor: { select: { name: true } },
          },
          orderBy: { createdAt: 'desc' },
        }),
      ]);

      const approved = invoices.filter(i => i.status === InvoiceStatus.COMPLETED);
      const reviewed = invoices.filter(i => !['QUEUED', 'OCR', 'AI', 'FAILED'].includes(i.status));
      const now = new Date();
      const thisMonth = monthKey(now);

      // Last 12 months, oldest first, including empty months.
      const months: { key: string; label: string; spend: number }[] = [];
      for (let i = 11; i >= 0; i--) {
        const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
        months.push({ key: monthKey(d), label: d.toLocaleString('en', { month: 'short', timeZone: 'UTC' }), spend: 0 });
      }
      const vendors: Record<string, number> = {};
      const categories: Record<string, number> = {};
      for (const inv of approved) {
        const total = Number(inv.total);
        const month = months.find(m => m.key === monthKey(inv.invoiceDate));
        if (month) month.spend += total;
        const vendor = inv.vendor?.name || 'Unknown';
        vendors[vendor] = (vendors[vendor] || 0) + total;
        const category = inv.category || 'Uncategorized';
        categories[category] = (categories[category] || 0) + total;
      }

      const top = (rec: Record<string, number>, n: number) =>
        Object.entries(rec).sort((a, b) => b[1] - a[1]).slice(0, n).map(([name, total]) => ({ name, total: Math.round(total * 100) / 100 }));

      res.json({
        currency: org?.currency || 'USD',
        totals: {
          documents: invoices.length,
          processing: invoices.filter(i => ['QUEUED', 'OCR', 'AI'].includes(i.status)).length,
          needsReview: invoices.filter(i => i.status === InvoiceStatus.VALIDATION).length,
          approved: approved.length,
          failed: invoices.filter(i => i.status === InvoiceStatus.FAILED).length,
          spend: approved.reduce((sum, i) => sum + Number(i.total), 0),
          spendThisMonth: approved.filter(i => monthKey(i.invoiceDate) === thisMonth).reduce((sum, i) => sum + Number(i.total), 0),
          avgConfidence: reviewed.length ? reviewed.reduce((sum, i) => sum + Number(i.confidence), 0) / reviewed.length : null,
        },
        monthly: months.map(({ label, spend, key }) => ({ month: label, key, spend: Math.round(spend * 100) / 100 })),
        topVendors: top(vendors, 5),
        categories: top(categories, 6),
        recent: invoices.slice(0, 6).map(i => ({
          id: i.id, invoiceNumber: i.invoiceNumber, vendorName: i.vendor?.name || null, fileName: i.fileName,
          total: Number(i.total), currency: i.currency, status: i.status, createdAt: i.createdAt,
        })),
      });
    } catch (error) {
      next(error);
    }
  }
}
