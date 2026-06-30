import prisma from '../utils/prisma';
import { OrganizationStatus } from '@prisma/client';

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

  static async updateOrganization(id: string, data: any) {
    return prisma.organization.update({
      where: { id },
      data,
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
