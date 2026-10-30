import { processInvoice } from '../workers/pipeline';
import { config } from '../config';

// In-process queue: OCR is CPU-heavy, so only a few documents are processed at once.
const pending: string[] = [];
const queued = new Set<string>();
let running = 0;

const drain = () => {
  while (running < config.ocrConcurrency && pending.length) {
    const invoiceId = pending.shift()!;
    running++;
    processInvoice(invoiceId)
      .catch(error => console.error(`Pipeline crashed for ${invoiceId}:`, error))
      .finally(() => {
        running--;
        queued.delete(invoiceId);
        drain();
      });
  }
};

export const addInvoiceToQueue = async (invoiceId: string) => {
  if (queued.has(invoiceId)) return;
  queued.add(invoiceId);
  pending.push(invoiceId);
  setImmediate(drain);
};

export const queueStats = () => ({ running, waiting: pending.length });
