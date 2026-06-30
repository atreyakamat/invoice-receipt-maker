import { Request, Response, NextFunction } from 'express';
import { VendorService } from '../services/vendor.service';

export class VendorController {
  static async listVendors(req: Request, res: Response, next: NextFunction) {
    try {
      const orgId = (req as any).user.organizationId;
      const vendors = await VendorService.listVendors(orgId);
      res.status(200).json(vendors);
    } catch (error) {
      next(error);
    }
  }

  static async getVendor(req: Request, res: Response, next: NextFunction) {
    try {
      const orgId = (req as any).user.organizationId;
      const { id } = req.params;
      const vendor = await VendorService.getVendorById(id, orgId);
      if (!vendor) return res.status(404).json({ message: 'Vendor not found' });
      res.status(200).json(vendor);
    } catch (error) {
      next(error);
    }
  }

  static async createVendor(req: Request, res: Response, next: NextFunction) {
    try {
      const orgId = (req as any).user.organizationId;
      const vendor = await VendorService.createVendor(orgId, req.body);
      res.status(201).json(vendor);
    } catch (error) {
      next(error);
    }
  }

  static async updateVendor(req: Request, res: Response, next: NextFunction) {
    try {
      const orgId = (req as any).user.organizationId;
      const { id } = req.params;
      await VendorService.updateVendor(id, orgId, req.body);
      res.status(200).json({ message: 'Vendor updated' });
    } catch (error) {
      next(error);
    }
  }

  static async deleteVendor(req: Request, res: Response, next: NextFunction) {
    try {
      const orgId = (req as any).user.organizationId;
      const { id } = req.params;
      await VendorService.deleteVendor(id, orgId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}
