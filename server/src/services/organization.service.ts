import prisma from '../utils/prisma';
import { OrganizationStatus } from '@prisma/client';
import { z } from 'zod';

const optional = z.string().trim().max(200).nullish().transform(v => v || null);

export const organizationSchema = z.object({
  companyName: z.string().trim().min(1, 'Company name is required').max(120),
  legalName: optional,
  email: z.union([z.string().trim().email(), z.literal('')]).nullish().transform(v => v || null),
  phone: optional,
  website: optional,
  taxId: optional,
  currency: z.string().trim().length(3).toUpperCase(),
});

export class OrganizationService {
  static async getOrganizationById(id: string) {
    return prisma.organization.findUnique({
      where: { id },
      include: {
        subscription: true,
        users: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          },
        },
      },
    });
  }

  static async updateOrganization(id: string, input: unknown) {
    return prisma.organization.update({
      where: { id },
      data: organizationSchema.parse(input),
    });
  }

  static async deleteOrganization(id: string) {
    return prisma.organization.update({
      where: { id },
      data: {
        status: OrganizationStatus.ARCHIVED,
        deletedAt: new Date(),
      },
    });
  }
}
