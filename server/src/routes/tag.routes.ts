import { Router } from 'express';
import { TagController, createTagSchema } from '../controllers/tag.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validate.middleware';

const router = Router();

router.use(requireAuth);

router.get('/', TagController.getTags);
router.post('/', validateRequest(createTagSchema), TagController.createTag);
router.delete('/:id', TagController.deleteTag);

export default router;
