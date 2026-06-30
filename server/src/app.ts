import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
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
import { startWorkers } from './workers';

const app = express();

app.use(helmet());
app.use(cors());
app.use('/api/v1/subscription/webhook', express.raw({ type: 'application/json' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
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

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

export default app;

if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    startWorkers();
  });
}
