import { Request, Response, NextFunction } from 'express';
import { CategoryService } from '../services/category.service';
import { z } from 'zod';

export const createCategorySchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required'),
    color: z.string().optional(),
    description: z.string().optional(),
  }),
});

export class CategoryController {
  static async getCategories(req: Request, res: Response, next: NextFunction) {
    try {
      const orgId = (req as any).user.organizationId;
      const categories = await CategoryService.getCategories(orgId);
      res.json(categories);
    } catch (error) {
      next(error);
    }
  }

  static async createCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const orgId = (req as any).user.organizationId;
      const category = await CategoryService.createCategory(orgId, req.body);
      res.status(201).json(category);
    } catch (error) {
      next(error);
    }
  }

  static async updateCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const orgId = (req as any).user.organizationId;
      const category = await CategoryService.updateCategory(orgId, req.params.id, req.body);
      res.json(category);
    } catch (error) {
      next(error);
    }
  }

  static async deleteCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const orgId = (req as any).user.organizationId;
      await CategoryService.deleteCategory(orgId, req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}
