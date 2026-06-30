import { Router } from 'express';
import { ExportController } from '../controllers/export.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.use(requireAuth);

router.get('/csv', ExportController.exportCsv);
router.get('/excel', ExportController.exportExcel);

export default router;
