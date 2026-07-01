import prisma from '../utils/prisma';
import { InvoiceStatus, AIJobStatus, ValidationStatus } from '@prisma/client';
import OpenAI from 'openai';

// Initialize OpenRouter Client
const openRouterApiKey = process.env.OPENROUTER_API_KEY || process.env.NVIDIA_API_KEY || 'fake-key';
const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: openRouterApiKey,
});

export const processAiJob = async (data: { invoiceId: string }) => {
  const { invoiceId } = data;
  console.log(`Processing AI extraction for invoice: ${invoiceId}`);

  try {
    await prisma.aIJob.update({
      where: { invoiceId },
      data: { status: AIJobStatus.RUNNING, startedAt: new Date() },
    });

    const ocrResult = await prisma.oCRResult.findUnique({ where: { invoiceId } });
    if (!ocrResult) throw new Error('OCR Result not found');

    let extractedData;
    if (openRouterApiKey === 'fake-key') {
      await new Promise(resolve => setTimeout(resolve, 2000));
      extractedData = {
        vendorName: 'Example Corp',
        invoiceNumber: 'INV-12345',
        invoiceDate: new Date('2026-06-30').toISOString(),
        currency: 'USD',
        subtotal: 1350.00,
        tax: 100.00,
        total: 1450.00,
        category: 'Software',
      };
    } else {
      const prompt = `Extract JSON from this invoice text: ${ocrResult.rawText}. Schema: { vendorName, invoiceNumber, invoiceDate, currency, subtotal, tax, total, category }. Return ONLY valid JSON, no markdown formatting or backticks.`;
      const response = await openai.chat.completions.create({
        model: 'google/gemini-1.5-pro', // Change this to any OpenRouter model
        messages: [{ role: 'user', content: prompt }],
      });
      const text = response.choices[0].message.content || '{}';
      
      try {
        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
        extractedData = JSON.parse(jsonStr);
      } catch (e) {
        console.error("Failed to parse JSON from AI:", text);
        throw new Error("Invalid JSON returned from AI");
      }
    }

    // Save AI Result
    await prisma.aIResult.create({
      data: {
        invoiceId,
        vendorName: extractedData.vendorName || 'Unknown',
        invoiceNumber: extractedData.invoiceNumber || 'Unknown',
        invoiceDate: new Date(extractedData.invoiceDate || Date.now()),
        currency: extractedData.currency || 'USD',
        subtotal: extractedData.subtotal || 0,
        tax: extractedData.tax || 0,
        discount: 0,
        total: extractedData.total || 0,
        confidence: 95.0,
        extractedJson: extractedData,
      },
    });

    await prisma.aIJob.update({
      where: { invoiceId },
      data: { status: AIJobStatus.COMPLETED, completedAt: new Date() },
    });

    // Create Validation Report
    await prisma.validationReport.create({
      data: {
        invoiceId,
        score: 95.0,
        status: ValidationStatus.MANUAL_REVIEW, // Required by accountant
      },
    });

    // Update invoice status to Validation
    await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        status: InvoiceStatus.VALIDATION,
        vendorId: null, // Should match vendor if exists
        subtotal: extractedData.subtotal || 0,
        tax: extractedData.tax || 0,
        total: extractedData.total || 0,
        invoiceDate: new Date(extractedData.invoiceDate || Date.now()),
        confidence: 95.0,
      },
    });

  } catch (error) {
    console.error(`AI worker failed for ${invoiceId}:`, error);
    await prisma.aIJob.update({
      where: { invoiceId },
      data: { status: AIJobStatus.FAILED, errorMessage: String(error) },
    });
    await prisma.invoice.update({
      where: { id: invoiceId },
      data: { status: InvoiceStatus.FAILED },
    });
    throw error;
  }
};

export const aiWorker = { name: 'AI (Sync Worker)', close: async () => {} };
