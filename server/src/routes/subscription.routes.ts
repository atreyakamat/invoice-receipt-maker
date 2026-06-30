import { Router } from 'express';
import { SubscriptionController } from '../controllers/subscription.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.post('/webhook', SubscriptionController.webhook); // No requireAuth for webhook

router.use(requireAuth);

router.get('/', SubscriptionController.getSubscription);
router.post('/checkout', SubscriptionController.checkout);
router.post('/portal', SubscriptionController.portal);

export default router;
