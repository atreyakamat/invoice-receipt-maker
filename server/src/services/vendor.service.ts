import { InvoiceStatus, Prisma } from '@prisma/client';
import { z } from 'zod';
import prisma from '../utils/prisma';
import { HttpError } from '../utils/httpError';

const optional = z.string().trim().max(200).nullish().transform(v => v || null);

export const vendorSchema = z.object({
  name: z.string().trim().min(1, 'Vendor name is required').max(120),
  email: z.union([z.string().trim().email('Enter a valid email'), z.literal('')]).nullish().transform(v => v || null),
  phone: optional,
  website: optional,
  gstNumber: optional,
  addressLine1: optional,
  city: optional,
  country: optional,
  notes: z.string().max(2000).nullish().transform(v => v || null),
});

const uniqueName = async <T>(fn: () => Promise<T>) => {
  try {
    return await fn();
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new HttpError(409, 'A vendor with this name already exists');
    }
    throw error;
  }
};

export class VendorService {
  static async listVendors(organizationId: string) {
    const vendors = await prisma.vendor.findMany({
      where: { organizationId, deletedAt: null },
      orderBy: { name: 'asc' },
      include: {
        invoices: { where: { deletedAt: null, status: InvoiceStatus.COMPLETED }, select: { total: true, invoiceDate: true } },
      },
    });
    return vendors.map(({ invoices, ...vendor }) => ({
      ...vendor,
      invoiceCount: invoices.length,
      totalSpend: invoices.reduce((sum, i) => sum + Number(i.total), 0),
      lastInvoiceDate: invoices.reduce<Date | null>((latest, i) => (!latest || i.invoiceDate > latest ? i.invoiceDate : latest), null),
    }));
  }

  static async getVendorById(id: string, organizationId: string) {
    return prisma.vendor.findFirst({
      where: { id, organizationId, deletedAt: null },
    });
  }

  static async createVendor(organizationId: string, input: unknown) {
    const data = vendorSchema.parse(input);
    const archived = await prisma.vendor.findFirst({ where: { organizationId, name: data.name, deletedAt: { not: null } } });
    if (archived) return prisma.vendor.update({ where: { id: archived.id }, data: { ...data, deletedAt: null } });
    return uniqueName(() => prisma.vendor.create({ data: { ...data, organizationId } }));
  }

  static async updateVendor(id: string, organizationId: string, input: unknown) {
    const data = vendorSchema.parse(input);
    const result = await uniqueName(() => prisma.vendor.updateMany({ where: { id, organizationId, deletedAt: null }, data }));
    if (!result.count) throw new HttpError(404, 'Vendor not found');
  }

  static async deleteVendor(id: string, organizationId: string) {
    return prisma.vendor.updateMany({
      where: { id, organizationId },
      data: { deletedAt: new Date() },
    });
  }
}
