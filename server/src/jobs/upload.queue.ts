import { Queue, Worker, QueueEvents } from 'bullmq';
import IORedis from 'ioredis';

const redisConnection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null
});

export const uploadQueue = new Queue('invoice-upload-queue', {
  connection: redisConnection as any,
});

export const ocrQueue = new Queue('ocr-processing-queue', {
  connection: redisConnection as any,
});

export const addInvoiceToQueue = async (invoiceId: string) => {
  await uploadQueue.add('process-invoice', { invoiceId }, {
    attempts: 3,
    backoff: { type: 'exponential', delay: 1000 },
  });
};

export const queueEvents = new QueueEvents('invoice-upload-queue', {
  connection: redisConnection as any,
});

queueEvents.on('completed', ({ jobId, returnvalue }) => {
  console.log(`Job ${jobId} completed successfully`);
});

queueEvents.on('failed', ({ jobId, failedReason }) => {
  console.error(`Job ${jobId} failed with reason: ${failedReason}`);
});
