import crypto from 'crypto';
import { InvoiceStatus, OCRProvider, OCRStatus } from '@prisma/client';
import prisma from '../utils/prisma';
import { addInvoiceToQueue } from '../jobs/upload.queue';

export class InvoiceService {
  /** Stores an uploaded document as a QUEUED invoice and hands it to the processing pipeline. */
  static async createFromFile(organizationId: string, userId: string, file: Express.Multer.File) {
    const org = await prisma.organization.findUnique({ where: { id: organizationId }, select: { currency: true } });

    const invoice = await prisma.invoice.create({
      data: {
        organizationId,
        uploadedById: userId,
        // Placeholder until extraction finds the real number; unique per organization.
        invoiceNumber: `PENDING-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
        invoiceDate: new Date(),
        currency: org?.currency || 'USD',
        subtotal: 0,
        tax: 0,
        discount: 0,
        shipping: 0,
        total: 0,
        confidence: 0,
        status: InvoiceStatus.QUEUED,
        storageUrl: file.path,
        fileName: file.originalname,
        mimeType: file.mimetype,
        ocrJob: { create: { provider: OCRProvider.TESSERACT, status: OCRStatus.QUEUED } },
      },
    });

    await addInvoiceToQueue(invoice.id);
    return invoice;
  }

  /** Clears previous results and runs the pipeline again. */
  static async reprocess(invoiceId: string) {
    await prisma.$transaction([
      prisma.oCRResult.deleteMany({ where: { invoiceId } }),
      prisma.aIResult.deleteMany({ where: { invoiceId } }),
      prisma.aIJob.deleteMany({ where: { invoiceId } }),
      prisma.validationReport.deleteMany({ where: { invoiceId } }),
      prisma.oCRJob.upsert({
        where: { invoiceId },
        create: { invoiceId, provider: OCRProvider.TESSERACT, status: OCRStatus.QUEUED },
        update: { status: OCRStatus.QUEUED, errorMessage: null, startedAt: null, completedAt: null },
      }),
      prisma.invoice.update({ where: { id: invoiceId }, data: { status: InvoiceStatus.QUEUED, notes: null } }),
    ]);
    await addInvoiceToQueue(invoiceId);
  }
}
