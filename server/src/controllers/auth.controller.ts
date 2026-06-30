import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';

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
}
