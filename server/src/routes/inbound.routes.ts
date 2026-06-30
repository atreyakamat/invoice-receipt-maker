import { Router } from 'express';
import { InboundController } from '../controllers/inbound.controller';
import { upload } from '../utils/multer';

const router = Router();

// SendGrid posts to this webhook
router.post('/email', upload.any(), InboundController.handleInboundEmail);

export default router;
