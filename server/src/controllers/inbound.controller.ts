import { Request, Response, NextFunction } from 'express';
import prisma from '../utils/prisma';
import { InvoiceService } from '../services/invoice.service';

export class InboundController {
  static async handleInboundEmail(req: Request, res: Response, next: NextFunction) {
    try {
      // SendGrid Inbound Parse payload
      // Sender is usually in the "from" field: "John Doe <john@example.com>"
      const fromField = req.body.from || '';
      const emailMatch = fromField.match(/<([^>]+)>/) || [null, fromField];
      const senderEmail = emailMatch[1]?.trim().toLowerCase();

      if (!senderEmail) {
        return res.status(200).send('No sender email found');
      }

      // Lookup user and organization by sender email
      const user = await prisma.user.findUnique({
        where: { email: senderEmail },
        include: { organization: true }
      });

      if (!user) {
        console.log(`Inbound email rejected: Unrecognized sender ${senderEmail}`);
        return res.status(200).send('Unrecognized sender');
      }

      const files = req.files as Express.Multer.File[];
      
      if (!files || files.length === 0) {
        return res.status(200).send('No attachments found');
      }

      // Process each attachment as a separate invoice
      for (const file of files) {
        await InvoiceService.createFromFile(user.organizationId, user.id, file);
      }

      res.status(200).send('OK');
    } catch (error) {
      console.error('Inbound Email Error:', error);
      // Always return 200 to SendGrid so they don't retry unnecessarily for non-transient errors
      res.status(200).send('Error processed');
    }
  }
}
