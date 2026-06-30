import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { StripeService } from '../services/stripe.service';

export class SubscriptionController {
  static async getSubscription(req: Request, res: Response, next: NextFunction) {
    try {
      const orgId = (req as any).user.organizationId;
      const sub = await prisma.subscription.findUnique({
        where: { organizationId: orgId }
      });
      res.status(200).json(sub);
    } catch (error) {
      next(error);
    }
  }

  static async checkout(req: Request, res: Response, next: NextFunction) {
    try {
      const orgId = (req as any).user.organizationId;
      const { plan } = req.body;
      const session = await StripeService.createCheckoutSession(orgId, plan || 'STARTER');
      res.status(200).json(session);
    } catch (error) {
      next(error);
    }
  }

  static async portal(req: Request, res: Response, next: NextFunction) {
    try {
      const orgId = (req as any).user.organizationId;
      const session = await StripeService.createPortalSession(orgId);
      res.status(200).json(session);
    } catch (error) {
      next(error);
    }
  }

  static async webhook(req: Request, res: Response, next: NextFunction) {
    try {
      const signature = req.headers['stripe-signature'] as string;
      // Stripe requires the raw body for signature verification
      // Make sure the route in express is configured to pass raw body (e.g. express.raw)
      await StripeService.handleWebhook(signature, req.body);
      res.status(200).send({ received: true });
    } catch (error) {
      console.error('Webhook error:', error);
      res.status(400).send(`Webhook Error`);
    }
  }
}
