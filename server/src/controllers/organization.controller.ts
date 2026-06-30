import { Request, Response, NextFunction } from 'express';
import { OrganizationService } from '../services/organization.service';

export class OrganizationController {
  static async getOrganization(req: Request, res: Response, next: NextFunction) {
    try {
      // Assuming auth middleware attaches user to req
      const orgId = (req as any).user.organizationId;
      const org = await OrganizationService.getOrganizationById(orgId);
      if (!org) {
        return res.status(404).json({ message: 'Organization not found' });
      }
      res.status(200).json(org);
    } catch (error) {
      next(error);
    }
  }

  static async updateOrganization(req: Request, res: Response, next: NextFunction) {
    try {
      const orgId = (req as any).user.organizationId;
      const data = req.body;
      const updated = await OrganizationService.updateOrganization(orgId, data);
      res.status(200).json(updated);
    } catch (error) {
      next(error);
    }
  }

  static async deleteOrganization(req: Request, res: Response, next: NextFunction) {
    try {
      const orgId = (req as any).user.organizationId;
      await OrganizationService.deleteOrganization(orgId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}
