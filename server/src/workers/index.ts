import { uploadWorker } from './upload.worker';
import { ocrWorker } from './ocr.worker';
import { aiWorker } from './ai.worker';

export const startWorkers = () => {
  console.log('Workers started:');
  console.log(`- ${uploadWorker.name}`);
  console.log(`- ${ocrWorker.name}`);
  console.log(`- ${aiWorker.name}`);
};

// Handle graceful shutdown
const shutdown = async () => {
  console.log('Shutting down workers...');
  await uploadWorker.close();
  await ocrWorker.close();
  await aiWorker.close();
  process.exit(0);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
