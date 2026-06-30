import { Request, Response, NextFunction } from 'express';
import prisma from '../utils/prisma';

export class DashboardController {
  static async getAnalytics(req: Request, res: Response, next: NextFunction) {
    try {
      const orgId = (req as any).user.organizationId;
      
      const invoices = await prisma.invoice.findMany({
        where: { organizationId: orgId, deletedAt: null },
      });

      const totalSpend = invoices.reduce((acc, inv) => acc + Number(inv.total), 0);
      const invoicesProcessed = invoices.length;
      
      const aiResults = await prisma.aIResult.findMany({
        where: { invoice: { organizationId: orgId } },
      });
      
      const avgConfidence = aiResults.length > 0 
        ? aiResults.reduce((acc, res) => acc + Number(res.confidence), 0) / aiResults.length
        : 0;

      // Group by month for chart
      const monthlySpend: Record<string, number> = {};
      invoices.forEach(inv => {
        const month = inv.invoiceDate.toLocaleString('default', { month: 'short' });
        monthlySpend[month] = (monthlySpend[month] || 0) + Number(inv.total);
      });

      const chartData = Object.keys(monthlySpend).map(month => ({
        name: month,
        spend: monthlySpend[month]
      }));

      res.status(200).json({
        totalSpend,
        invoicesProcessed,
        avgConfidence: avgConfidence.toFixed(1),
        chartData
      });
    } catch (error) {
      next(error);
    }
  }
}
