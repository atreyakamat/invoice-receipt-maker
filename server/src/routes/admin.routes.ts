import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';
import { requireAuth, requireRole } from '../middleware/auth.middleware';

const router = Router();

router.use(requireAuth);
router.use(requireRole(['SYSTEM_ADMIN']));

router.get('/dashboard', AdminController.getDashboardMetrics);
router.get('/users', AdminController.getUsers);
router.get('/organizations', AdminController.getOrganizations);
router.get('/system', AdminController.getSystemStatus);

export default router;
