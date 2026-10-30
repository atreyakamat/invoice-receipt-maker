import { Request, Response, NextFunction } from 'express';
import { ExportService, type ExportFilter } from '../services/export.service';

const filterFrom = (req: Request): ExportFilter => ({
  status: req.query.status === 'all' ? 'all' : 'approved',
  from: typeof req.query.from === 'string' && req.query.from ? req.query.from : undefined,
  to: typeof req.query.to === 'string' && req.query.to ? req.query.to : undefined,
});

const stamp = () => new Date().toISOString().split('T')[0];

export class ExportController {
  static async exportCsv(req: Request, res: Response, next: NextFunction) {
    try {
      const orgId = (req as any).user.organizationId;
      const csv = await ExportService.exportToCsv(orgId, filterFrom(req));

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename=invoices-${stamp()}.csv`);
      res.status(200).send(csv);
    } catch (error) {
      next(error);
    }
  }

  static async exportExcel(req: Request, res: Response, next: NextFunction) {
    try {
      const orgId = (req as any).user.organizationId;
      const excelBuffer = await ExportService.exportToExcel(orgId, filterFrom(req));

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=invoices-${stamp()}.xlsx`);
      res.status(200).send(excelBuffer);
    } catch (error) {
      next(error);
    }
  }
}
