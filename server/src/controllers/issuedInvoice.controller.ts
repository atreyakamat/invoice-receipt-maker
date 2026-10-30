import { Request, Response, NextFunction } from 'express';
import { IssuedInvoiceStatus } from '@prisma/client';
import { z } from 'zod';
import prisma from '../utils/prisma';
import { HttpError } from '../utils/httpError';
import { IssuedInvoiceService } from '../services/issuedInvoice.service';
import { renderInvoicePdf } from '../services/pdf.service';
import { buildGmailComposeUrl } from '../services/gmail.service';

const money = z.coerce.number().min(0).max(1e10);
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}/, 'Use YYYY-MM-DD');

const invoiceSchema = z.object({
  customerId: z.string().uuid('Pick a customer'),
  number: z.string().trim().max(64).optional(),
  issueDate: isoDate,
  dueDate: isoDate.nullish(),
  currency: z.string().trim().length(3).toUpperCase(),
  notes: z.string().max(2000).nullish(),
  terms: z.string().max(500).nullish(),
  discount: money.default(0),
  shipping: money.default(0),
  items: z
    .array(
      z.object({
        description: z.string().trim().min(1).max(500),
        quantity: z.coerce.number().min(0),
        unitPrice: money,
        taxRate: z.coerce.number().min(0).max(100).default(0),
      }),
    )
    .min(1, 'Add at least one line item')
    .max(200),
});

const statusSchema = z.object({ status: z.enum(['DRAFT', 'SENT', 'PAID', 'CANCELLED']) });

const ctx = (req: Request) => ({
  orgId: (req as any).user.organizationId as string,
  userId: (req as any).user.userId as string,
});

const loadFull = (id: string, organizationId: string) =>
  prisma.issuedInvoice.findFirst({
    where: { id, organizationId, deletedAt: null },
    include: { items: { orderBy: { lineNumber: 'asc' } }, customer: true },
  });

export class IssuedInvoiceController {
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { orgId } = ctx(req);
      const invoices = await prisma.issuedInvoice.findMany({
        where: { organizationId: orgId, deletedAt: null },
        orderBy: { createdAt: 'desc' },
        include: { customer: { select: { id: true, name: true, email: true } } },
      });
      res.json(invoices);
    } catch (error) {
      next(error);
    }
  }

  static async get(req: Request, res: Response, next: NextFunction) {
    try {
      const { orgId } = ctx(req);
      const invoice = await loadFull(req.params.id as string, orgId);
      if (!invoice) throw new HttpError(404, 'Invoice not found');
      res.json(invoice);
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { orgId, userId } = ctx(req);
      const invoice = await IssuedInvoiceService.create(orgId, userId, invoiceSchema.parse(req.body));
      res.status(201).json(invoice);
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { orgId } = ctx(req);
      const invoice = await IssuedInvoiceService.update(orgId, req.params.id as string, invoiceSchema.parse(req.body));
      res.json(invoice);
    } catch (error) {
      next(error);
    }
  }

  static async setStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { orgId } = ctx(req);
      const { status } = statusSchema.parse(req.body);
      await IssuedInvoiceService.markStatus(orgId, req.params.id as string, status as IssuedInvoiceStatus);
      res.json({ message: 'Updated' });
    } catch (error) {
      next(error);
    }
  }

  static async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const { orgId } = ctx(req);
      const invoice = await loadFull(req.params.id as string, orgId);
      if (!invoice) throw new HttpError(404, 'Invoice not found');
      if (invoice.status === IssuedInvoiceStatus.PAID) throw new HttpError(409, 'Paid invoices cannot be deleted');
      await prisma.issuedInvoice.update({
        where: { id: invoice.id },
        data: { deletedAt: new Date(), number: `${invoice.number}~deleted~${invoice.id.slice(0, 8)}` },
      });
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  static async pdf(req: Request, res: Response, next: NextFunction) {
    try {
      const { orgId } = ctx(req);
      const invoice = await loadFull(req.params.id as string, orgId);
      if (!invoice) throw new HttpError(404, 'Invoice not found');
      const organization = await prisma.organization.findUnique({
        where: { id: orgId },
        select: { companyName: true, legalName: true, email: true, phone: true, website: true, taxId: true },
      });
      const buffer = await renderInvoicePdf({ invoice, organization: organization! });
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="${invoice.number}.pdf"`);
      res.setHeader('Content-Length', buffer.length);
      res.send(buffer);
    } catch (error) {
      next(error);
    }
  }

  /** Returns a Gmail compose URL plus a hint about attaching the just-downloaded PDF. */
  static async composeEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const { orgId } = ctx(req);
      const invoice = await loadFull(req.params.id as string, orgId);
      if (!invoice) throw new HttpError(404, 'Invoice not found');
      if (!invoice.customer.email) throw new HttpError(400, `Add an email address for ${invoice.customer.name} first`);

      const org = await prisma.organization.findUnique({ where: { id: orgId }, select: { companyName: true } });
      const money = (n: unknown) => {
        try {
          return new Intl.NumberFormat('en', { style: 'currency', currency: invoice.currency }).format(Number(n) || 0);
        } catch {
          return `${invoice.currency} ${Number(n).toFixed(2)}`;
        }
      };
      const dueLine = invoice.dueDate ? `due on ${new Date(invoice.dueDate).toLocaleDateString('en', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })}` : 'at your earliest convenience';
      const body = [
        `Hi ${invoice.customer.name.split(' ')[0] || invoice.customer.name},`,
        '',
        `Please find invoice ${invoice.number} attached, totalling ${money(invoice.total)}, ${dueLine}.`,
        '',
        `Thanks,`,
        org?.companyName || '',
      ].join('\n');

      res.json({
        url: buildGmailComposeUrl({
          to: invoice.customer.email,
          subject: `Invoice ${invoice.number} from ${org?.companyName || ''}`.trim(),
          body,
        }),
        pdfUrl: `/api/v1/issued-invoices/${invoice.id}/pdf`,
        pdfFileName: `${invoice.number}.pdf`,
      });
    } catch (error) {
      next(error);
    }
  }
}
