import express from 'express';
import fs from 'fs';
import path from 'path';
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
import integrationRoutes from './routes/integration.routes';
import inboundRoutes from './routes/inbound.routes';
import adminRoutes from './routes/admin.routes';
import { startWorkers } from './workers';
import { globalLimiter } from './middleware/rateLimiter';
import { parseOrigins } from './utils/secrets';

const app = express();

// The House of Stix control room (CONTROL_ROOM_ORIGIN) may show this app in a window; no other site may frame it.
const frameAncestors = parseOrigins(process.env.CONTROL_ROOM_ORIGIN);
app.disable('x-powered-by');
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        frameAncestors: ["'self'", ...frameAncestors],
        imgSrc: ["'self'", 'data:', 'blob:'],
        // Off so it also works over plain HTTP on the home network.
        upgradeInsecureRequests: null,
      },
    },
    xFrameOptions: frameAncestors.length ? false : { action: 'sameorigin' },
    // Plain HTTP on the LAN: HSTS would lock browsers out of http://<lab>:8302.
    strictTransportSecurity: false,
  }),
);
// The built web app is served from this same server, so cross-site API calls are only
// needed in development (Vite on CLIENT_URL). Other sites get no CORS headers.
app.use(cors({ origin: parseOrigins(process.env.CLIENT_URL || 'http://localhost:5173') }));

// Apply global rate limiting to all requests
app.use('/api', globalLimiter);
app.use('/api/v1/subscription/webhook', express.raw({ type: 'application/json' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Inbound-email URLs carry a secret token: keep them out of the request log.
app.use(morgan('dev', { skip: (req) => (req.originalUrl || '').startsWith('/api/v1/inbound') }));

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
app.use('/api/v1/integrations', integrationRoutes);
app.use('/api/v1/inbound', inboundRoutes);
app.use('/api/v1/admin', adminRoutes);

// The web app (built into ../public by the Dockerfile). Any non-API path gets index.html.
const PUBLIC_DIR = path.resolve(__dirname, '../public');
if (fs.existsSync(path.join(PUBLIC_DIR, 'index.html'))) {
  app.use(express.static(PUBLIC_DIR, { index: false, maxAge: '1h' }));
  app.get(/^(?!\/api\/|\/health$).*/, (req, res) => res.sendFile(path.join(PUBLIC_DIR, 'index.html')));
}

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  const status = err.status || 500;
  res.status(status).json({
    // Server faults can carry database or file details: only show them in development.
    message: status >= 500 && process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message || 'Internal Server Error',
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
