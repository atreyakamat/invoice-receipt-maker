import { InvoiceStatus } from '@prisma/client';
import prisma from '../utils/prisma';
import { addInvoiceToQueue } from '../jobs/upload.queue';
import { aiEnabled } from '../services/extraction.service';
import { config } from '../config';

/** Re-queues documents that were mid-processing when the server last stopped. */
export const startWorkers = async () => {
  console.log(`Extraction: ${aiEnabled() ? `AI (${config.ai.model})` : 'rule-based (set AI_API_KEY to enable AI)'}`);
  const stuck = await prisma.invoice.findMany({
    where: { deletedAt: null, status: { in: [InvoiceStatus.QUEUED, InvoiceStatus.OCR, InvoiceStatus.AI] } },
    select: { id: true },
  });
  if (stuck.length) console.log(`Resuming ${stuck.length} document(s)`);
  for (const { id } of stuck) await addInvoiceToQueue(id);
};
