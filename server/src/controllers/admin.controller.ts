import { Request, Response, NextFunction } from 'express';
import prisma from '../utils/prisma';

export class AdminController {
  static async getDashboardMetrics(req: Request, res: Response, next: NextFunction) {
    try {
      const totalUsers = await prisma.user.count();
      const totalOrganizations = await prisma.organization.count();
      const totalInvoices = await prisma.invoice.count();
      
      const metrics = {
        totalUsers,
        totalOrganizations,
        totalInvoices,
      };

      res.status(200).json(metrics);
    } catch (error) {
      next(error);
    }
  }

  static async getUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await prisma.user.findMany({
        include: { organization: true },
        orderBy: { createdAt: 'desc' }
      });
      res.status(200).json(users);
    } catch (error) {
      next(error);
    }
  }

  static async getOrganizations(req: Request, res: Response, next: NextFunction) {
    try {
      const orgs = await prisma.organization.findMany({
        include: { subscription: true },
        orderBy: { createdAt: 'desc' }
      });
      res.status(200).json(orgs);
    } catch (error) {
      next(error);
    }
  }

  static async getSystemStatus(req: Request, res: Response, next: NextFunction) {
    try {
      res.status(200).json({
        redis: 'OK',
        database: 'OK',
        workers: 'OK'
      });
    } catch (error) {
      next(error);
    }
  }
}
