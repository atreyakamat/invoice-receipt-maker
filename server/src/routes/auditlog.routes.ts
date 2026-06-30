import { Router, Request, Response, NextFunction } from 'express';
import { AuditLogService } from '../services/auditlog.service';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.use(requireAuth);

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = (req as any).user.organizationId;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
    const logs = await AuditLogService.getLogs(orgId, limit);
    res.json(logs);
  } catch (error) {
    next(error);
  }
});

export default router;
