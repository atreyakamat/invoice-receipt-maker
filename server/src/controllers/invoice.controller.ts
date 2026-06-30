import { Request, Response, NextFunction } from 'express';
import prisma from '../utils/prisma';
import { addInvoiceToQueue } from '../jobs/upload.queue';
import { InvoiceStatus, OCRProvider, OCRStatus } from '@prisma/client';

export class InvoiceController {
  static async uploadInvoice(req: Request, res: Response, next: NextFunction) {
    try {
      const orgId = (req as any).user.organizationId;
      const userId = (req as any).user.userId;
      const file = req.file;

      if (!file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      // Create initial DB record for the invoice
      const invoice = await prisma.invoice.create({
        data: {
          organizationId: orgId,
          uploadedById: userId,
          invoiceNumber: `TEMP-${Date.now()}`,
          invoiceDate: new Date(),
          currency: 'USD',
          subtotal: 0,
          tax: 0,
          discount: 0,
          shipping: 0,
          total: 0,
          confidence: 0,
          status: InvoiceStatus.QUEUED,
          storageUrl: file.path, // Store local path temporarily
        },
      });

      // Also create an OCRJob record for tracking
      await prisma.oCRJob.create({
        data: {
          invoiceId: invoice.id,
          provider: OCRProvider.TESSERACT,
          status: OCRStatus.QUEUED,
        },
      });

      // Enqueue job for background processing
      await addInvoiceToQueue(invoice.id);

      res.status(202).json({
        message: 'Upload successful. Invoice is queued for processing.',
        invoiceId: invoice.id,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getInvoices(req: Request, res: Response, next: NextFunction) {
    try {
      const orgId = (req as any).user.organizationId;
      const invoices = await prisma.invoice.findMany({
        where: { organizationId: orgId, deletedAt: null },
        orderBy: { createdAt: 'desc' },
      });
      res.status(200).json(invoices);
    } catch (error) {
      next(error);
    }
  }

  static async getInvoiceById(req: Request, res: Response, next: NextFunction) {
    try {
      const orgId = (req as any).user.organizationId;
      const { id } = req.params;
      
      const invoice = await prisma.invoice.findFirst({
        where: { id, organizationId: orgId, deletedAt: null },
        include: {
          ocrResult: true,
          aiResult: true,
          validation: true,
          vendor: true,
        },
      });

      if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
      res.status(200).json(invoice);
    } catch (error) {
      next(error);
    }
  }
}
