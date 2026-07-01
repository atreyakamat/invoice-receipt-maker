import prisma from '../utils/prisma';
import { InvoiceStatus, OCRStatus, AIProvider, AIJobStatus } from '@prisma/client';
import Tesseract from 'tesseract.js';
import path from 'path';
import { aiQueue } from '../jobs/upload.queue';

export const processOcrJob = async (data: { invoiceId: string }) => {
  const { invoiceId } = data;
  console.log(`Processing OCR for invoice: ${invoiceId}`);

  try {
    const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId } });
    if (!invoice) throw new Error('Invoice not found');

    let rawText = '';
    let confidence = 0;

    if (invoice.storageUrl.endsWith('.pdf')) {
      rawText = 'PDF extraction requires image conversion first. Assuming simulated text.';
      confidence = 90.0;
    } else {
      const imagePath = path.resolve(process.cwd(), invoice.storageUrl);
      const { data } = await Tesseract.recognize(imagePath, 'eng');
      rawText = data.text;
      confidence = data.confidence;
    }

    await prisma.oCRResult.create({
      data: {
        invoiceId,
        rawText: rawText || 'No text extracted',
        pageCount: 1,
        confidence: confidence || 0.0,
        detectedLanguage: 'en',
      },
    });

    await prisma.oCRJob.update({
      where: { invoiceId },
      data: { status: OCRStatus.COMPLETED, completedAt: new Date() },
    });

    // Move to AI status
    await prisma.invoice.update({
      where: { id: invoiceId },
      data: { status: InvoiceStatus.AI },
    });

    // Create AI Job
    await prisma.aIJob.create({
      data: {
        invoiceId,
        provider: AIProvider.GEMINI,
        model: 'gemini-1.5-pro',
        status: AIJobStatus.QUEUED,
      }
    });

    // Enqueue to AI
    await aiQueue.add('process-ai', { invoiceId });

  } catch (error) {
    console.error(`OCR worker failed for ${invoiceId}:`, error);
    await prisma.oCRJob.update({
      where: { invoiceId },
      data: { status: OCRStatus.FAILED, errorMessage: String(error) },
    });
    await prisma.invoice.update({
      where: { id: invoiceId },
      data: { status: InvoiceStatus.FAILED },
    });
    throw error;
  }
};

export const ocrWorker = { name: 'OCR (Sync Worker)', close: async () => {} };
