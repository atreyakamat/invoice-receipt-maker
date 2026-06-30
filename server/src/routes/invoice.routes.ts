import { Router } from 'express';
import { InvoiceController } from '../controllers/invoice.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { uploadMiddleware } from '../utils/multer';

const router = Router();

router.use(requireAuth);

router.post('/upload', uploadMiddleware.single('invoice'), InvoiceController.uploadInvoice);
router.get('/', InvoiceController.getInvoices);
router.get('/:id', InvoiceController.getInvoiceById);

export default router;
