import { processUploadJob } from '../workers/upload.worker';
import { processOcrJob } from '../workers/ocr.worker';
import { processAiJob } from '../workers/ai.worker';
import { EventEmitter } from 'events';

export const queueEvents = new EventEmitter();

// Mock BullMQ queues for synchronous/local processing without Redis
export const uploadQueue = {
  add: async (name: string, data: { invoiceId: string }) => {
    // Run in background without blocking the request
    setTimeout(() => {
      processUploadJob(data).catch(console.error);
    }, 0);
  }
};

export const ocrQueue = {
  add: async (name: string, data: { invoiceId: string }) => {
    setTimeout(() => {
      processOcrJob(data).catch(console.error);
    }, 0);
  }
};

export const aiQueue = {
  add: async (name: string, data: { invoiceId: string }) => {
    setTimeout(() => {
      processAiJob(data).catch(console.error);
    }, 0);
  }
};

export const addInvoiceToQueue = async (invoiceId: string) => {
  await uploadQueue.add('process-invoice', { invoiceId });
};
