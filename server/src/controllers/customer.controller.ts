import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { z } from 'zod';
import prisma from '../utils/prisma';
import { HttpError } from '../utils/httpError';

const optional = z.string().trim().max(200).nullish().transform(v => v || null);

const customerSchema = z.object({
  name: z.string().trim().min(1, 'Customer name is required').max(120),
  email: z.union([z.string().trim().email('Enter a valid email'), z.literal('')]).nullish().transform(v => v || null),
  phone: optional,
  taxId: optional,
  addressLine1: optional,
  addressLine2: optional,
  city: optional,
  state: optional,
  postalCode: optional,
  country: optional,
  notes: z.string().max(2000).nullish().transform(v => v || null),
});

const ctx = (req: Request) => ({ orgId: (req as any).user.organizationId as string });

const uniqueName = async <T>(fn: () => Promise<T>) => {
  try {
    return await fn();
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new HttpError(409, 'A customer with this name already exists');
    }
    throw error;
  }
};

export class CustomerController {
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { orgId } = ctx(req);
      const customers = await prisma.customer.findMany({
        where: { organizationId: orgId, deletedAt: null },
        orderBy: { name: 'asc' },
        include: {
          issuedInvoices: {
            where: { deletedAt: null },
            select: { total: true, status: true, issueDate: true },
          },
        },
      });
      res.json(
        customers.map(({ issuedInvoices, ...customer }) => ({
          ...customer,
          invoiceCount: issuedInvoices.length,
          totalBilled: issuedInvoices.reduce((sum, i) => sum + Number(i.total), 0),
          outstanding: issuedInvoices
            .filter(i => i.status === 'SENT')
            .reduce((sum, i) => sum + Number(i.total), 0),
        })),
      );
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { orgId } = ctx(req);
      const data = customerSchema.parse(req.body);
      const archived = await prisma.customer.findFirst({
        where: { organizationId: orgId, name: data.name, deletedAt: { not: null } },
      });
      const customer = archived
        ? await prisma.customer.update({ where: { id: archived.id }, data: { ...data, deletedAt: null } })
        : await uniqueName(() => prisma.customer.create({ data: { ...data, organizationId: orgId } }));
      res.status(201).json(customer);
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { orgId } = ctx(req);
      const data = customerSchema.parse(req.body);
      const result = await uniqueName(() =>
        prisma.customer.updateMany({
          where: { id: req.params.id as string, organizationId: orgId, deletedAt: null },
          data,
        }),
      );
      if (!result.count) throw new HttpError(404, 'Customer not found');
      res.json({ message: 'Saved' });
    } catch (error) {
      next(error);
    }
  }

  static async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const { orgId } = ctx(req);
      await prisma.customer.updateMany({
        where: { id: req.params.id as string, organizationId: orgId },
        data: { deletedAt: new Date() },
      });
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}
