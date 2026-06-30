import Stripe from 'stripe';
import prisma from '../utils/prisma';
import { SubscriptionPlan, SubscriptionStatus, BillingCycle } from '@prisma/client';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock_123', {
  apiVersion: '2026-06-24.dahlia',
});

export class StripeService {
  static async createCustomer(email: string, name: string) {
    if (process.env.STRIPE_SECRET_KEY) {
      const customer = await stripe.customers.create({ email, name });
      return customer.id;
    }
    return `cus_mock_${Date.now()}`;
  }

  static async createCheckoutSession(orgId: string, plan: string) {
    const subscription = await prisma.subscription.findUnique({
      where: { organizationId: orgId }
    });

    if (!subscription || !subscription.stripeCustomerId) {
      throw new Error('No stripe customer ID found for this organization');
    }

    if (process.env.STRIPE_SECRET_KEY) {
      const session = await stripe.checkout.sessions.create({
        customer: subscription.stripeCustomerId,
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: { name: `${plan} Plan` },
              unit_amount: plan === 'STARTER' ? 2900 : 9900,
              recurring: { interval: 'month' }
            },
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/settings?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/settings`,
      });
      return { url: session.url };
    }

    return { url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/settings?mock_checkout=true` };
  }

  static async createPortalSession(orgId: string) {
    const subscription = await prisma.subscription.findUnique({
      where: { organizationId: orgId }
    });

    if (!subscription || !subscription.stripeCustomerId) {
      throw new Error('No stripe customer ID found');
    }

    if (process.env.STRIPE_SECRET_KEY) {
      const session = await stripe.billingPortal.sessions.create({
        customer: subscription.stripeCustomerId,
        return_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/settings`,
      });
      return { url: session.url };
    }

    return { url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/settings?mock_portal=true` };
  }

  static async handleWebhook(signature: string, body: Buffer) {
    let event;
    if (process.env.STRIPE_WEBHOOK_SECRET) {
      event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
    } else {
      event = JSON.parse(body.toString()); // Mock fallback
    }

    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription;
        await prisma.subscription.updateMany({
          where: { stripeCustomerId: sub.customer as string },
          data: {
            stripeSubscriptionId: sub.id,
            status: SubscriptionStatus.ACTIVE,
            plan: SubscriptionPlan.STARTER, // Real implementation would map Stripe Price ID to Plan enum
          }
        });
        break;
      }
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        await prisma.subscription.updateMany({
          where: { stripeCustomerId: sub.customer as string },
          data: {
            status: SubscriptionStatus.CANCELLED,
          }
        });
        break;
      }
    }
  }
}
