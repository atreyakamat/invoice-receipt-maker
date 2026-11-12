import { Router, Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { InboundController } from '../controllers/inbound.controller';
import { uploadMiddleware } from '../utils/multer';

const router = Router();

/**
 * The inbound-email webhook trusts the "from" field to pick whose account the
 * attachments land in, and "from" is trivially forged. So the webhook only works
 * with a shared secret in its URL (set the same INBOUND_TOKEN in SendGrid's
 * Inbound Parse URL: .../api/v1/inbound/email?token=...). No token = off.
 */
function requireInboundToken(req: Request, res: Response, next: NextFunction) {
  const want = process.env.INBOUND_TOKEN ?? '';
  if (want.length < 32) return res.status(404).json({ message: 'Not found' });
  const got = String(req.query.token ?? req.get('x-inbound-token') ?? '');
  const a = crypto.createHash('sha256').update(got).digest();
  const b = crypto.createHash('sha256').update(want).digest();
  if (!crypto.timingSafeEqual(a, b)) return res.status(401).json({ message: 'Unauthorized' });
  next();
}

// SendGrid posts to this webhook
router.post('/email', requireInboundToken, uploadMiddleware.any(), InboundController.handleInboundEmail);

export default router;
