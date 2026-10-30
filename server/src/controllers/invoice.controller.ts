import fs from 'fs';
import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { InvoiceStatus, Prisma, ValidationStatus } from '@prisma/client';
import prisma from '../utils/prisma';
import { HttpError } from '../utils/httpError';
import { InvoiceService } from '../services/invoice.service';
import { AuditLogService } from '../services/auditlog.service';

const PROCESSING: InvoiceStatus[] = [InvoiceStatus.QUEUED, InvoiceStatus.OCR, InvoiceStatus.AI];

const money = z.coerce.number().min(0).max(1e10).transform(n => Math.round(n * 100) / 100);
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}/, 'Use YYYY-MM-DD');

const invoiceDataSchema = z.object({
  vendorName: z.string().trim().max(120).default(''),
  invoiceNumber: z.string().trim().min(1, 'Invoice number is required').max(64),
  invoiceDate: isoDate,
  dueDate: isoDate.nullish(),
  currency: z.string().trim().length(3).toUpperCase(),
  subtotal: money,
  tax: money,
  discount: money.default(0),
  shipping: money.default(0),
  total: money,
  category: z.string().trim().max(60).nullish(),
  notes: z.string().max(2000).nullish(),
  items: z
    .array(
      z.object({
        description: z.string().trim().min(1).max(500),
        quantity: z.coerce.number().min(0),
        unitPrice: money,
        total: money,
      }),
    )
    .max(200)
    .default([]),
});

const validateSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED']),
  data: invoiceDataSchema.optional(),
  comments: z.string().max(2000).optional(),
});

type InvoiceData = z.infer<typeof invoiceDataSchema>;

const ctx = (req: Request) => ({ orgId: (req as any).user.organizationId as string, userId: (req as any).user.userId as string });

const findInvoice = async (orgId: string, id: string) => {
  const invoice = await prisma.invoice.findFirst({ where: { id, organizationId: orgId, deletedAt: null } });
  if (!invoice) throw new HttpError(404, 'Invoice not found');
  return invoice;
};

/** Writes reviewed fields, matching or creating the vendor and replacing line items. */
const applyEdits = async (orgId: string, invoiceId: string, data: InvoiceData, extra: Prisma.InvoiceUpdateInput = {}) => {
  try {
    await prisma.$transaction(async tx => {
      let vendorId: string | null = null;
      if (data.vendorName) {
        const existing = await tx.vendor.findFirst({
          where: { organizationId: orgId, name: { equals: data.vendorName, mode: 'insensitive' } },
        });
        const vendor = existing
          ? existing.deletedAt
            ? await tx.vendor.update({ where: { id: existing.id }, data: { deletedAt: null } })
            : existing
          : await tx.vendor.create({ data: { organizationId: orgId, name: data.vendorName } });
        vendorId = vendor.id;
      }

      await tx.invoiceItem.deleteMany({ where: { invoiceId } });
      if (data.items.length) {
        await tx.invoiceItem.createMany({
          data: data.items.map((item, i) => ({ invoiceId, lineNumber: i + 1, tax: 0, discount: 0, ...item })),
        });
      }

      await tx.invoice.update({
        where: { id: invoiceId },
        data: {
          vendor: vendorId ? { connect: { id: vendorId } } : { disconnect: true },
          invoiceNumber: data.invoiceNumber,
          invoiceDate: new Date(data.invoiceDate),
          dueDate: data.dueDate ? new Date(data.dueDate) : null,
          currency: data.currency,
          subtotal: data.subtotal,
          tax: data.tax,
          discount: data.discount,
          shipping: data.shipping,
          total: data.total,
          category: data.category || null,
          notes: data.notes || null,
          ...extra,
        },
      });
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new HttpError(409, `Invoice number ${data.invoiceNumber} already exists`);
    }
    throw error;
  }
};

export class InvoiceController {
  static async uploadInvoices(req: Request, res: Response, next: NextFunction) {
    try {
      const { orgId, userId } = ctx(req);
      const files = (req.files as Express.Multer.File[]) || [];
      if (!files.length) throw new HttpError(400, 'No files uploaded');

      const invoices = [];
      for (const file of files) invoices.push(await InvoiceService.createFromFile(orgId, userId, file));

      res.status(202).json({ invoices: invoices.map(i => ({ id: i.id, fileName: i.fileName, status: i.status })) });
    } catch (error) {
      next(error);
    }
  }

  static async getInvoices(req: Request, res: Response, next: NextFunction) {
    try {
      const { orgId } = ctx(req);
      const invoices = await prisma.invoice.findMany({
        where: { organizationId: orgId, deletedAt: null },
        orderBy: { createdAt: 'desc' },
        include: { vendor: { select: { id: true, name: true } }, aiResult: { select: { vendorName: true } } },
      });
      res.json(
        invoices.map(({ aiResult, storageUrl, ...invoice }) => ({
          ...invoice,
          vendorName: invoice.vendor?.name || aiResult?.vendorName || null,
        })),
      );
    } catch (error) {
      next(error);
    }
  }

  static async getInvoiceById(req: Request, res: Response, next: NextFunction) {
    try {
      const { orgId } = ctx(req);
      const invoice = await prisma.invoice.findFirst({
        where: { id: req.params.id as string, organizationId: orgId, deletedAt: null },
        include: {
          ocrResult: { select: { rawText: true, confidence: true, pageCount: true } },
          aiResult: true,
          aiJob: { select: { model: true, status: true, errorMessage: true } },
          validation: true,
          vendor: true,
          items: { orderBy: { lineNumber: 'asc' } },
        },
      });
      if (!invoice) throw new HttpError(404, 'Invoice not found');
      const { storageUrl, ...rest } = invoice;
      res.json(rest);
    } catch (error) {
      next(error);
    }
  }

  static async getInvoiceFile(req: Request, res: Response, next: NextFunction) {
    try {
      const { orgId } = ctx(req);
      const invoice = await findInvoice(orgId, req.params.id as string);
      if (!fs.existsSync(invoice.storageUrl)) throw new HttpError(404, 'File not found');
      res.setHeader('Content-Type', invoice.mimeType || 'application/octet-stream');
      res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(invoice.fileName || 'document')}"`);
      res.setHeader('Cache-Control', 'private, max-age=3600');
      fs.createReadStream(invoice.storageUrl).pipe(res);
    } catch (error) {
      next(error);
    }
  }

  static async updateInvoice(req: Request, res: Response, next: NextFunction) {
    try {
      const { orgId } = ctx(req);
      const invoice = await findInvoice(orgId, req.params.id as string);
      if (PROCESSING.includes(invoice.status)) throw new HttpError(409, 'Still processing');
      await applyEdits(orgId, invoice.id, invoiceDataSchema.parse(req.body));
      res.json({ message: 'Saved' });
    } catch (error) {
      next(error);
    }
  }

  static async validateInvoice(req: Request, res: Response, next: NextFunction) {
    try {
      const { orgId, userId } = ctx(req);
      const invoice = await findInvoice(orgId, req.params.id as string);
      if (PROCESSING.includes(invoice.status)) throw new HttpError(409, 'Still processing');

      const { status, data, comments } = validateSchema.parse(req.body);
      const approved = status === 'APPROVED';
      if (approved && !data) throw new HttpError(400, 'Invoice details are required to approve');
      if (approved && !data!.vendorName) throw new HttpError(400, 'Vendor is required to approve');

      const newStatus = approved ? InvoiceStatus.COMPLETED : InvoiceStatus.REJECTED;
      if (data) await applyEdits(orgId, invoice.id, data, { status: newStatus });
      else await prisma.invoice.update({ where: { id: invoice.id }, data: { status: newStatus } });

      const review = {
        status: approved ? ValidationStatus.APPROVED : ValidationStatus.REJECTED,
        comments,
        approvedBy: userId,
        reviewedAt: new Date(),
      };
      await prisma.validationReport.upsert({
        where: { invoiceId: invoice.id },
        create: { invoiceId: invoice.id, score: invoice.confidence, ...review },
        update: review,
      });
      await AuditLogService.logAction(orgId, userId, approved ? 'INVOICE_APPROVED' : 'INVOICE_REJECTED', 'Invoice', invoice.id);

      res.json({ message: approved ? 'Approved' : 'Rejected' });
    } catch (error) {
      next(error);
    }
  }

  static async reprocessInvoice(req: Request, res: Response, next: NextFunction) {
    try {
      const { orgId } = ctx(req);
      const invoice = await findInvoice(orgId, req.params.id as string);
      if (PROCESSING.includes(invoice.status)) throw new HttpError(409, 'Already processing');
      await InvoiceService.reprocess(invoice.id);
      res.status(202).json({ message: 'Reprocessing' });
    } catch (error) {
      next(error);
    }
  }

  static async deleteInvoice(req: Request, res: Response, next: NextFunction) {
    try {
      const { orgId, userId } = ctx(req);
      const invoice = await findInvoice(orgId, req.params.id as string);
      // Free the invoice number so a corrected copy can be uploaded again.
      await prisma.invoice.update({
        where: { id: invoice.id },
        data: { deletedAt: new Date(), invoiceNumber: `${invoice.invoiceNumber}~deleted~${invoice.id.slice(0, 8)}` },
      });
      await AuditLogService.logAction(orgId, userId, 'INVOICE_DELETED', 'Invoice', invoice.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}
