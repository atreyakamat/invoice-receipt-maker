import { Router } from 'express';
import { SubscriptionController } from '../controllers/subscription.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.use(requireAuth);

router.get('/', SubscriptionController.getSubscription);

export default router;
