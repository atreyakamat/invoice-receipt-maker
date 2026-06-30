import { Router } from 'express';
import { CategoryController, createCategorySchema } from '../controllers/category.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validate.middleware';

const router = Router();

router.use(requireAuth);

router.get('/', CategoryController.getCategories);
router.post('/', validateRequest(createCategorySchema), CategoryController.createCategory);
router.put('/:id', CategoryController.updateCategory);
router.delete('/:id', CategoryController.deleteCategory);

export default router;
