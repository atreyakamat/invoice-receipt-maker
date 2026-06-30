import { Router } from 'express';
import { VendorController } from '../controllers/vendor.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.use(requireAuth);

router.get('/', VendorController.listVendors);
router.post('/', VendorController.createVendor);
router.get('/:id', VendorController.getVendor);
router.put('/:id', VendorController.updateVendor);
router.delete('/:id', VendorController.deleteVendor);

export default router;
