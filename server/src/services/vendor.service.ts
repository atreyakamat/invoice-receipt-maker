import prisma from '../utils/prisma';

export class VendorService {
  static async listVendors(organizationId: string) {
    return prisma.vendor.findMany({
      where: { organizationId, deletedAt: null },
      orderBy: { name: 'asc' },
    });
  }

  static async getVendorById(id: string, organizationId: string) {
    return prisma.vendor.findFirst({
      where: { id, organizationId, deletedAt: null },
    });
  }

  static async createVendor(organizationId: string, data: any) {
    return prisma.vendor.create({
      data: {
        ...data,
        organizationId,
      },
    });
  }

  static async updateVendor(id: string, organizationId: string, data: any) {
    return prisma.vendor.updateMany({
      where: { id, organizationId },
      data,
    });
  }

  static async deleteVendor(id: string, organizationId: string) {
    return prisma.vendor.updateMany({
      where: { id, organizationId },
      data: { deletedAt: new Date() },
    });
  }
}
