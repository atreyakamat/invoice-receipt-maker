import { Router } from 'express';
import { InvoiceController } from '../controllers/invoice.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { uploadMiddleware } from '../utils/multer';

const router = Router();

router.use(requireAuth);

router.post('/upload', uploadMiddleware.array('files', 20), InvoiceController.uploadInvoices);
router.get('/', InvoiceController.getInvoices);
router.get('/:id', InvoiceController.getInvoiceById);
router.get('/:id/file', InvoiceController.getInvoiceFile);
router.put('/:id', InvoiceController.updateInvoice);
router.post('/:id/validate', InvoiceController.validateInvoice);
router.post('/:id/reprocess', InvoiceController.reprocessInvoice);
router.delete('/:id', InvoiceController.deleteInvoice);

export default router;
