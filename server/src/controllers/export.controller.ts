import { Request, Response, NextFunction } from 'express';
import { ExportService } from '../services/export.service';

export class ExportController {
  static async exportCsv(req: Request, res: Response, next: NextFunction) {
    try {
      const orgId = (req as any).user.organizationId;
      const csv = await ExportService.exportToCsv(orgId);
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=invoices.csv');
      res.status(200).send(csv);
    } catch (error) {
      next(error);
    }
  }

  static async exportExcel(req: Request, res: Response, next: NextFunction) {
    try {
      const orgId = (req as any).user.organizationId;
      const excelBuffer = await ExportService.exportToExcel(orgId);
      
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=invoices.xlsx');
      res.status(200).send(excelBuffer);
    } catch (error) {
      next(error);
    }
  }
}
