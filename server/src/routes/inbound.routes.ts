import { Router } from 'express';
import { InboundController } from '../controllers/inbound.controller';
import { uploadMiddleware } from '../utils/multer';

const router = Router();

// SendGrid posts to this webhook
router.post('/email', uploadMiddleware.any(), InboundController.handleInboundEmail);

export default router;
