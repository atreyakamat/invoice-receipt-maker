import { Router, Request, Response, NextFunction } from 'express';
import { GoogleService } from '../services/google.service';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

// Used by the frontend to redirect user to Google Auth
router.get('/google/auth', requireAuth, (req: Request, res: Response) => {
  const orgId = (req as any).user.organizationId;
  const url = GoogleService.getAuthUrl(orgId);
  res.json({ url });
});

// The callback URL hit by Google
router.get('/google/callback', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const code = req.query.code as string;
    const orgId = req.query.state as string;
    
    if (code && orgId) {
      await GoogleService.handleCallback(code, orgId);
    }
    
    res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/settings?integration=success`);
  } catch (error) {
    next(error);
  }
});

export default router;
