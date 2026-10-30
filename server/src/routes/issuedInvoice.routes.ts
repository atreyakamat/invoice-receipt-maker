import { Router } from 'express';
import { IssuedInvoiceController } from '../controllers/issuedInvoice.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.use(requireAuth);

router.get('/', IssuedInvoiceController.list);
router.post('/', IssuedInvoiceController.create);
router.get('/:id', IssuedInvoiceController.get);
router.put('/:id', IssuedInvoiceController.update);
router.delete('/:id', IssuedInvoiceController.remove);
router.post('/:id/status', IssuedInvoiceController.setStatus);
router.get('/:id/pdf', IssuedInvoiceController.pdf);
router.get('/:id/send-email', IssuedInvoiceController.composeEmail);

export default router;
