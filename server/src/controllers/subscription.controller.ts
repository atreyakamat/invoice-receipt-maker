import { Request, Response, NextFunction } from 'express';
import { SubscriptionService } from '../services/subscription.service';

export class SubscriptionController {
  static async getSubscription(req: Request, res: Response, next: NextFunction) {
    try {
      const orgId = (req as any).user.organizationId;
      const sub = await SubscriptionService.getSubscription(orgId);
      if (!sub) {
        // Auto setup free tier if none exists
        const newSub = await SubscriptionService.setupFreeTier(orgId);
        return res.json(newSub);
      }
      res.json(sub);
    } catch (error) {
      next(error);
    }
  }
}
