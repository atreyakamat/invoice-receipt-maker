import { Router } from 'express';
import { CustomerController } from '../controllers/customer.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.use(requireAuth);

router.get('/', CustomerController.list);
router.post('/', CustomerController.create);
router.put('/:id', CustomerController.update);
router.delete('/:id', CustomerController.remove);

export default router;
