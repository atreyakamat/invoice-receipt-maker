import prisma from '../utils/prisma';
import { InvoiceStatus, OCRStatus } from '@prisma/client';
import { ocrQueue } from '../jobs/upload.queue';

export const processUploadJob = async (data: { invoiceId: string }) => {
  const { invoiceId } = data;
  console.log(`Processing upload job for invoice: ${invoiceId}`);

  try {
    // 1. Update status to OCR
    await prisma.invoice.update({
      where: { id: invoiceId },
      data: { status: InvoiceStatus.OCR },
    });

    await prisma.oCRJob.update({
      where: { invoiceId },
      data: { status: OCRStatus.RUNNING, startedAt: new Date() },
    });

    // 2. Enqueue for actual OCR processing
    await ocrQueue.add('process-ocr', { invoiceId });

  } catch (error) {
    console.error(`Upload worker failed for ${invoiceId}:`, error);
    await prisma.invoice.update({
      where: { id: invoiceId },
      data: { status: InvoiceStatus.FAILED },
    });
    throw error;
  }
};

// Dummy export for backwards compatibility in index.ts
export const uploadWorker = { name: 'Upload (Sync Worker)', close: async () => {} };
