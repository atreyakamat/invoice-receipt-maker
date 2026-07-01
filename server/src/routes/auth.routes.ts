import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { authLimiter } from '../middleware/rateLimiter';

const router = Router();

router.post('/register', authLimiter, AuthController.register);
router.post('/login', authLimiter, AuthController.login);
router.post('/refresh', AuthController.refreshToken);
router.post('/verify-email', AuthController.verifyEmail);
router.post('/resend-verification', AuthController.resendVerification);
router.get('/me', requireAuth, AuthController.getMe);
router.put('/me', requireAuth, AuthController.updateMe);

export default router;
