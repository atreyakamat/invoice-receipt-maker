import { Prisma, IssuedInvoiceStatus } from '@prisma/client';
import prisma from '../utils/prisma';
import { HttpError } from '../utils/httpError';

const r2 = (n: number) => Math.round(n * 100) / 100;

export interface IssuedItemInput {
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate?: number;
}

export interface IssuedInvoiceInput {
  customerId: string;
  number?: string;
  issueDate: string;
  dueDate?: string | null;
  currency: string;
  notes?: string | null;
  terms?: string | null;
  discount?: number;
  shipping?: number;
  items: IssuedItemInput[];
}

const computeTotals = (items: IssuedItemInput[], discount = 0, shipping = 0) => {
  const rows = items.map((item, i) => {
    const quantity = Number(item.quantity) || 0;
    const unitPrice = Number(item.unitPrice) || 0;
    const taxRate = Number(item.taxRate) || 0;
    const lineTotal = r2(quantity * unitPrice);
    return {
      lineNumber: i + 1,
      description: item.description,
      quantity,
      unitPrice: r2(unitPrice),
      taxRate: r2(taxRate),
      total: lineTotal,
      _tax: r2(lineTotal * (taxRate / 100)),
    };
  });

  const subtotal = r2(rows.reduce((s, r) => s + r.total, 0));
  const tax = r2(rows.reduce((s, r) => s + r._tax, 0));
  return {
    rows: rows.map(({ _tax, ...row }) => row),
    subtotal,
    tax,
    discount: r2(discount || 0),
    shipping: r2(shipping || 0),
    total: r2(subtotal + tax + (shipping || 0) - (discount || 0)),
  };
};

/** Next number of the form INV-YYYY-NNNN for the organization. */
const nextNumber = async (organizationId: string) => {
  const year = new Date().getUTCFullYear();
  const prefix = `INV-${year}-`;
  const last = await prisma.issuedInvoice.findFirst({
    where: { organizationId, number: { startsWith: prefix } },
    orderBy: { number: 'desc' },
    select: { number: true },
  });
  const seq = last ? parseInt(last.number.slice(prefix.length), 10) + 1 : 1;
  return `${prefix}${String(seq).padStart(4, '0')}`;
};

export class IssuedInvoiceService {
  static async create(organizationId: string, userId: string, input: IssuedInvoiceInput) {
    if (!input.items.length) throw new HttpError(400, 'Add at least one line item');

    const customer = await prisma.customer.findFirst({
      where: { id: input.customerId, organizationId, deletedAt: null },
    });
    if (!customer) throw new HttpError(400, 'Customer not found');

    const totals = computeTotals(input.items, input.discount, input.shipping);
    const number = input.number?.trim() || (await nextNumber(organizationId));

    try {
      return await prisma.issuedInvoice.create({
        data: {
          organizationId,
          customerId: customer.id,
          createdById: userId,
          number,
          issueDate: new Date(input.issueDate),
          dueDate: input.dueDate ? new Date(input.dueDate) : null,
          currency: input.currency.toUpperCase(),
          notes: input.notes?.trim() || null,
          terms: input.terms?.trim() || null,
          subtotal: totals.subtotal,
          tax: totals.tax,
          discount: totals.discount,
          shipping: totals.shipping,
          total: totals.total,
          items: { createMany: { data: totals.rows } },
        },
        include: { items: { orderBy: { lineNumber: 'asc' } }, customer: true },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new HttpError(409, `Invoice number ${number} already exists`);
      }
      throw error;
    }
  }

  static async update(organizationId: string, invoiceId: string, input: IssuedInvoiceInput) {
    const existing = await prisma.issuedInvoice.findFirst({
      where: { id: invoiceId, organizationId, deletedAt: null },
    });
    if (!existing) throw new HttpError(404, 'Invoice not found');
    if (existing.status === IssuedInvoiceStatus.PAID) throw new HttpError(409, 'Paid invoices cannot be edited');

    const customer = await prisma.customer.findFirst({
      where: { id: input.customerId, organizationId, deletedAt: null },
    });
    if (!customer) throw new HttpError(400, 'Customer not found');

    const totals = computeTotals(input.items, input.discount, input.shipping);
    const number = input.number?.trim() || existing.number;

    try {
      return await prisma.$transaction(async tx => {
        await tx.issuedInvoiceItem.deleteMany({ where: { invoiceId } });
        return tx.issuedInvoice.update({
          where: { id: invoiceId },
          data: {
            customerId: customer.id,
            number,
            issueDate: new Date(input.issueDate),
            dueDate: input.dueDate ? new Date(input.dueDate) : null,
            currency: input.currency.toUpperCase(),
            notes: input.notes?.trim() || null,
            terms: input.terms?.trim() || null,
            subtotal: totals.subtotal,
            tax: totals.tax,
            discount: totals.discount,
            shipping: totals.shipping,
            total: totals.total,
            items: { createMany: { data: totals.rows } },
          },
          include: { items: { orderBy: { lineNumber: 'asc' } }, customer: true },
        });
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new HttpError(409, `Invoice number ${number} already exists`);
      }
      throw error;
    }
  }

  static async markStatus(organizationId: string, invoiceId: string, status: IssuedInvoiceStatus) {
    const invoice = await prisma.issuedInvoice.findFirst({
      where: { id: invoiceId, organizationId, deletedAt: null },
    });
    if (!invoice) throw new HttpError(404, 'Invoice not found');

    const now = new Date();
    return prisma.issuedInvoice.update({
      where: { id: invoiceId },
      data: {
        status,
        ...(status === IssuedInvoiceStatus.SENT && !invoice.sentAt && { sentAt: now }),
        ...(status === IssuedInvoiceStatus.PAID && !invoice.paidAt && { paidAt: now }),
      },
    });
  }
}
