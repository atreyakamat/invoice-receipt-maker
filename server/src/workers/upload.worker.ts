import { Worker } from 'bullmq';
import IORedis from 'ioredis';
import prisma from '../utils/prisma';
import { InvoiceStatus, OCRStatus } from '@prisma/client';
import { ocrQueue } from '../jobs/upload.queue'; // Re-use the existing queue definition

const redisConnection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null
});

export const uploadWorker = new Worker('invoice-upload-queue', async (job) => {
  const { invoiceId } = job.data;
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
    await ocrQueue.add('process-ocr', { invoiceId }, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 2000 },
    });

  } catch (error) {
    console.error(`Upload worker failed for ${invoiceId}:`, error);
    await prisma.invoice.update({
      where: { id: invoiceId },
      data: { status: InvoiceStatus.FAILED },
    });
    throw error;
  }
}, { connection: redisConnection as any });
