import { Request, Response, NextFunction } from 'express';
import { TagService } from '../services/tag.service';
import { z } from 'zod';

export const createTagSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required'),
    color: z.string().optional(),
  }),
});

export class TagController {
  static async getTags(req: Request, res: Response, next: NextFunction) {
    try {
      const orgId = (req as any).user.organizationId;
      const tags = await TagService.getTags(orgId);
      res.json(tags);
    } catch (error) {
      next(error);
    }
  }

  static async createTag(req: Request, res: Response, next: NextFunction) {
    try {
      const orgId = (req as any).user.organizationId;
      const tag = await TagService.createTag(orgId, req.body);
      res.status(201).json(tag);
    } catch (error) {
      next(error);
    }
  }

  static async deleteTag(req: Request, res: Response, next: NextFunction) {
    try {
      const orgId = (req as any).user.organizationId;
      await TagService.deleteTag(orgId, req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}
