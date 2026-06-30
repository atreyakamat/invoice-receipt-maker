import prisma from '../utils/prisma';
import { SubscriptionPlan, SubscriptionStatus, BillingCycle } from '@prisma/client';

export class SubscriptionService {
  static async getSubscription(organizationId: string) {
    return prisma.subscription.findUnique({
      where: { organizationId },
    });
  }

  static async setupFreeTier(organizationId: string) {
    return prisma.subscription.create({
      data: {
        organizationId,
        plan: SubscriptionPlan.FREE,
        status: SubscriptionStatus.ACTIVE,
        billingCycle: BillingCycle.MONTHLY,
        documentLimit: 50,
        storageLimit: 100 * 1024 * 1024, // 100 MB
      }
    });
  }
}
