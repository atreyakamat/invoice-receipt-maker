import { config } from './config';
import fs from 'fs';
import path from 'path';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import multer from 'multer';
import { ZodError } from 'zod';
import authRoutes from './routes/auth.routes';
import orgRoutes from './routes/organization.routes';
import vendorRoutes from './routes/vendor.routes';
import invoiceRoutes from './routes/invoice.routes';
import exportRoutes from './routes/export.routes';
import categoryRoutes from './routes/category.routes';
import tagRoutes from './routes/tag.routes';
import subscriptionRoutes from './routes/subscription.routes';
import auditLogRoutes from './routes/auditlog.routes';
import dashboardRoutes from './routes/dashboard.routes';
import integrationRoutes from './routes/integration.routes';
import inboundRoutes from './routes/inbound.routes';
import adminRoutes from './routes/admin.routes';
import { startWorkers } from './workers';
import { globalLimiter } from './middleware/rateLimiter';
import { requireAuth } from './middleware/auth.middleware';
import { HttpError } from './utils/httpError';
import { aiEnabled, CATEGORIES } from './services/extraction.service';
import { queueStats } from './jobs/upload.queue';

const app = express();

app.set('trust proxy', 1);
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        'default-src': ["'self'"],
        'img-src': ["'self'", 'data:', 'blob:'],
        'style-src': ["'self'", "'unsafe-inline'"],
        'font-src': ["'self'", 'data:'],
        'frame-src': ["'self'", 'blob:'],
        'object-src': ["'self'", 'blob:'],
        'connect-src': ["'self'"],
      },
    },
  }),
);
app.use(cors({ origin: config.isProduction ? false : true }));

app.use('/api', globalLimiter);
app.use('/api/v1/subscription/webhook', express.raw({ type: 'application/json' }));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(config.isProduction ? 'combined' : 'dev'));

const health = (_req: express.Request, res: express.Response) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
};
app.get('/health', health);
app.get('/api/health', health);

app.get('/api/v1/meta', requireAuth, (_req, res) => {
  res.json({ aiEnabled: aiEnabled(), aiModel: aiEnabled() ? config.ai.model : null, categories: CATEGORIES, queue: queueStats() });
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/organization', orgRoutes);
app.use('/api/v1/vendors', vendorRoutes);
app.use('/api/v1/invoices', invoiceRoutes);
app.use('/api/v1/exports', exportRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/tags', tagRoutes);
app.use('/api/v1/subscription', subscriptionRoutes);
app.use('/api/v1/audit-logs', auditLogRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/integrations', integrationRoutes);
app.use('/api/v1/inbound', inboundRoutes);
app.use('/api/v1/admin', adminRoutes);

app.use('/api', (_req, res) => {
  res.status(404).json({ message: 'Not found' });
});

// Built client (production image): static assets plus SPA fallback.
if (fs.existsSync(path.join(config.publicDir, 'index.html'))) {
  app.use(express.static(config.publicDir, { index: false, maxAge: '1y', immutable: true }));
  app.use((req, res, next) => {
    if (req.method !== 'GET') return next();
    res.setHeader('Cache-Control', 'no-cache');
    res.sendFile(path.join(config.publicDir, 'index.html'));
  });
}

app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (err instanceof ZodError) {
    const first = err.errors[0];
    return res.status(400).json({
      message: first ? `${first.path.join('.') || 'Input'}: ${first.message}` : 'Invalid input',
      errors: err.errors,
    });
  }
  if (err instanceof multer.MulterError) {
    const message = err.code === 'LIMIT_FILE_SIZE' ? 'File is larger than 25 MB' : err.message;
    return res.status(400).json({ message });
  }
  const status = err instanceof HttpError ? err.status : err.status || 500;
  if (status >= 500) console.error(err.stack || err);
  res.status(status).json({
    message: status >= 500 && config.isProduction ? 'Something went wrong' : err.message || 'Internal Server Error',
  });
});

export default app;

if (require.main === module) {
  app.listen(config.port, () => {
    console.log(`Server is running on port ${config.port}`);
    startWorkers().catch(error => console.error('Failed to resume processing:', error));
  });
}
