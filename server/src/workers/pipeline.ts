import { Prisma, InvoiceStatus, OCRStatus, AIJobStatus, AIProvider, ValidationStatus } from '@prisma/client';
import prisma from '../utils/prisma';
import { config } from '../config';
import { extractText } from './ocr.worker';
import { aiEnabled, aiExtract, heuristicExtract, type ExtractedInvoice } from '../services/extraction.service';

const round = (n: number) => Math.round(n * 100) / 100;

const buildWarnings = (data: ExtractedInvoice, ocrText: string) => {
  const warnings: string[] = [];
  if (ocrText.length < 20) warnings.push('No readable text found. Enter the details manually.');
  if (!data.vendorName) warnings.push('Vendor not detected');
  if (!data.invoiceNumber) warnings.push('Invoice number not detected');
  if (!data.invoiceDate) warnings.push('Invoice date not detected');
  if (data.total === null) warnings.push('Total not detected');
  if (data.subtotal !== null && data.total !== null) {
    const expected = round(data.subtotal + (data.tax ?? 0) + (data.shipping ?? 0) - (data.discount ?? 0));
    if (Math.abs(expected - data.total) > 0.05) warnings.push(`Subtotal + tax does not match total (${expected} vs ${data.total})`);
  }
  return warnings;
};

export const processInvoice = async (invoiceId: string) => {
  const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId } });
  if (!invoice || invoice.deletedAt) return;

  try {
    // 1. OCR
    await prisma.invoice.update({ where: { id: invoiceId }, data: { status: InvoiceStatus.OCR } });
    await prisma.oCRJob.update({ where: { invoiceId }, data: { status: OCRStatus.RUNNING, startedAt: new Date() } });

    const started = Date.now();
    const ocr = await extractText(invoice.storageUrl, invoice.mimeType || '');
    const ocrResult = {
      rawText: ocr.text || '',
      pageCount: ocr.pageCount,
      confidence: ocr.confidence,
      detectedLanguage: 'en',
    };
    await prisma.oCRResult.upsert({ where: { invoiceId }, create: { invoiceId, ...ocrResult }, update: ocrResult });
    await prisma.oCRJob.update({
      where: { invoiceId },
      data: { status: OCRStatus.COMPLETED, completedAt: new Date(), processingTime: Date.now() - started, confidence: ocr.confidence },
    });

    // 2. Field extraction
    await prisma.invoice.update({ where: { id: invoiceId }, data: { status: InvoiceStatus.AI } });
    const useAi = aiEnabled() && ocr.text.length >= 20;
    const aiJob = {
      provider: AIProvider.GEMINI,
      model: useAi ? config.ai.model : 'rules',
      status: AIJobStatus.RUNNING,
      startedAt: new Date(),
      errorMessage: null,
    };
    await prisma.aIJob.upsert({ where: { invoiceId }, create: { invoiceId, ...aiJob }, update: aiJob });

    let data = heuristicExtract(ocr.text);
    let aiError: string | null = null;
    if (useAi) {
      try {
        data = await aiExtract(ocr.text);
      } catch (error) {
        aiError = String(error);
        console.error(`AI extraction failed for ${invoiceId}, using rules:`, error);
      }
    }
    // OCR quality caps how sure we can be about the fields.
    const confidence = round(Math.min(data.confidence, ocr.confidence || 0));

    const aiResult = {
      vendorName: data.vendorName || '',
      invoiceNumber: data.invoiceNumber || '',
      invoiceDate: data.invoiceDate ? new Date(data.invoiceDate) : invoice.createdAt,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      currency: data.currency || invoice.currency,
      subtotal: data.subtotal ?? 0,
      tax: data.tax ?? 0,
      discount: data.discount ?? 0,
      total: data.total ?? 0,
      paymentTerms: data.paymentTerms,
      category: data.category,
      confidence,
      reasoning: aiError ? `AI unavailable, rule-based extraction used: ${aiError}` : null,
      extractedJson: data as unknown as Prisma.InputJsonValue,
    };
    await prisma.aIResult.upsert({ where: { invoiceId }, create: { invoiceId, ...aiResult }, update: aiResult });
    await prisma.aIJob.update({
      where: { invoiceId },
      data: { status: AIJobStatus.COMPLETED, completedAt: new Date(), errorMessage: aiError },
    });

    // 3. Validation report + invoice fields
    const warnings = buildWarnings(data, ocr.text);
    const report = { score: confidence, status: ValidationStatus.MANUAL_REVIEW, warnings };
    await prisma.validationReport.upsert({ where: { invoiceId }, create: { invoiceId, ...report }, update: report });

    const vendor = data.vendorName
      ? await prisma.vendor.findFirst({
          where: { organizationId: invoice.organizationId, deletedAt: null, name: { equals: data.vendorName, mode: 'insensitive' } },
        })
      : null;

    const fields = {
      status: InvoiceStatus.VALIDATION,
      vendorId: vendor?.id ?? null,
      invoiceDate: aiResult.invoiceDate,
      dueDate: aiResult.dueDate,
      currency: aiResult.currency,
      subtotal: aiResult.subtotal,
      tax: aiResult.tax,
      discount: aiResult.discount,
      shipping: data.shipping ?? 0,
      total: aiResult.total,
      category: data.category,
      confidence,
    };

    await prisma.$transaction(async tx => {
      await tx.invoiceItem.deleteMany({ where: { invoiceId } });
      if (data.items.length) {
        await tx.invoiceItem.createMany({
          data: data.items.map((item, i) => ({
            invoiceId,
            lineNumber: i + 1,
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            tax: 0,
            discount: 0,
            total: item.total,
          })),
        });
      }
      await tx.invoice.update({ where: { id: invoiceId }, data: fields });
    });

    // The extracted number may already exist in this organization (BR-004 duplicate detection).
    if (data.invoiceNumber) {
      try {
        await prisma.invoice.update({ where: { id: invoiceId }, data: { invoiceNumber: data.invoiceNumber } });
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
          await prisma.validationReport.update({
            where: { invoiceId },
            data: { warnings: [`Possible duplicate: invoice number ${data.invoiceNumber} already exists`, ...warnings] },
          });
        } else {
          throw error;
        }
      }
    }
  } catch (error) {
    console.error(`Processing failed for ${invoiceId}:`, error);
    const message = error instanceof Error ? error.message : String(error);
    await prisma.oCRJob.updateMany({ where: { invoiceId, status: { not: OCRStatus.COMPLETED } }, data: { status: OCRStatus.FAILED, errorMessage: message } });
    await prisma.aIJob.updateMany({ where: { invoiceId, status: { not: AIJobStatus.COMPLETED } }, data: { status: AIJobStatus.FAILED, errorMessage: message } });
    await prisma.invoice.update({ where: { id: invoiceId }, data: { status: InvoiceStatus.FAILED, notes: message } });
  }
};
