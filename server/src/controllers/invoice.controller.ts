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

  static async deleteInvoice(req: Request, res: Response, next: NextFunction) {
    try {
      const orgId = (req as any).user.organizationId;
      const { id } = req.params;

      const invoice = await prisma.invoice.findFirst({
        where: { id, organizationId: orgId, deletedAt: null },
      });

      if (!invoice) {
        return res.status(404).json({ message: 'Invoice not found' });
      }

      await prisma.invoice.update({
        where: { id },
        data: { deletedAt: new Date() },
      });

      res.status(200).json({ message: 'Invoice deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  static async validateInvoice(req: Request, res: Response, next: NextFunction) {
    try {
      const orgId = (req as any).user.organizationId;
      const { id } = req.params;
      const { status, finalData, comments } = req.body;

      const invoice = await prisma.invoice.findFirst({
        where: { id, organizationId: orgId, deletedAt: null },
      });

      if (!invoice) {
        return res.status(404).json({ message: 'Invoice not found' });
      }

      await prisma.$transaction(async (tx) => {
        // Update validation report
        await tx.validationReport.update({
          where: { invoiceId: id },
          data: {
            status,
            comments,
            approvedBy: (req as any).user.userId,
            reviewedAt: new Date()
          }
        });

        // Update invoice status and final details
        await tx.invoice.update({
          where: { id },
          data: {
            status: status === 'APPROVED' ? 'COMPLETED' : 'REJECTED',
            ...finalData // vendorId, subtotal, tax, total, etc.
          }
        });
      });

      if (status === 'APPROVED') {
        const updatedInvoice = await prisma.invoice.findFirst({ where: { id }, include: { vendor: true } });
        if (updatedInvoice) {
          import('../services/google.service').then(({ GoogleService }) => {
            GoogleService.pushInvoiceToSheet(orgId, updatedInvoice).catch(err => {
              console.error('Failed to push to Google Sheets:', err);
            });
          });
        }
      }

      res.status(200).json({ message: `Invoice validation ${status}` });
    } catch (error) {
      next(error);
    }
  }
}
