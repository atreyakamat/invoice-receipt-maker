import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import prisma from '../utils/prisma';

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { firstName, lastName, email, password, companyName } = req.body;
      
      const result = await AuthService.register({
        firstName,
        lastName,
        email,
        password,
        companyName,
      });

      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      
      const result = await AuthService.login(email, password);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;
      
      const result = await AuthService.refreshToken(refreshToken);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.userId;
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          organizationId: true,
        },
      });

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  }

  static async updateMe(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.userId;
      const { firstName, lastName } = req.body;

      const user = await prisma.user.update({
        where: { id: userId },
        data: { firstName, lastName },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          organizationId: true,
        },
      });

      res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  }

  static async verifyEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const { token } = req.body;
      await AuthService.verifyEmail(token);
      res.status(200).json({ message: 'Email verified successfully' });
    } catch (error) {
      next(error);
    }
  }

  static async resendVerification(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;
      await AuthService.resendVerification(email);
      res.status(200).json({ message: 'Verification email sent' });
    } catch (error) {
      next(error);
    }
  }
}
