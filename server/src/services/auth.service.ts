import prisma from '../utils/prisma';
import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import { EmailService } from './email.service';
import { v4 as uuidv4 } from 'uuid';
import { UserRole } from '@prisma/client';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-jwt-key';
const REFRESH_SECRET = process.env.REFRESH_SECRET || 'super-secret-refresh-key';
const ACCESS_TOKEN_EXPIRES_IN = '15m'; // 15 minutes
const REFRESH_TOKEN_EXPIRES_IN = '7d'; // 7 days

export class AuthService {
  static async register(data: any) {
    const { firstName, lastName, email, password, companyName } = data;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new Error('Email already in use');
    }

    const passwordHash = await argon2.hash(password);

    // Create organization and user in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const org = await tx.organization.create({
        data: {
          companyName,
          email,
          currency: 'USD',
          timezone: 'UTC',
          status: 'ACTIVE',
        }
      });

      // Create free subscription
      await tx.subscription.create({
        data: {
          organizationId: org.id,
          plan: 'FREE',
          status: 'ACTIVE',
          billingCycle: 'MONTHLY',
          documentLimit: 100,
          storageLimit: 1000,
        }
      });

      const user = await tx.user.create({
        data: {
          firstName,
          lastName,
          email,
          passwordHash,
          role: UserRole.OWNER,
          organizationId: org.id,
          emailVerified: true, // Auto-verify for pilot run
        },
      });

      await tx.organizationMember.create({
        data: {
          organizationId: org.id,
          userId: user.id,
          role: UserRole.OWNER,
          status: 'ACTIVE',
        },
      });

      return { user, org };
    });

    // Generate verification token and send email
    const verificationToken = jwt.sign(
      { email: result.user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    await EmailService.sendVerificationEmail(result.user.email, verificationToken);

    return {
      message: 'Registration successful. Please verify your email.',
      user: {
        id: result.user.id,
        email: result.user.email,
        firstName: result.user.firstName,
        lastName: result.user.lastName,
      },
      organization: {
        id: result.org.id,
        companyName: result.org.companyName,
      }
    };
  }

  static async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isValid = await argon2.verify(user.passwordHash, password);
    if (!isValid) {
      throw new Error('Invalid credentials');
    }

    // if (!user.emailVerified) {
    //   throw { status: 403, message: 'Please verify your email address before logging in' };
    // }

    const accessToken = this.generateAccessToken(user.id, user.role, user.organizationId);
    const refreshToken = this.generateRefreshToken(user.id);

    // Store refresh token
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        organizationId: user.organizationId,
      },
    };
  }

  static async refreshToken(token: string) {
    try {
      const decoded = jwt.verify(token, REFRESH_SECRET) as { userId: string };
      
      const storedToken = await prisma.refreshToken.findUnique({
        where: { token },
      });

      if (!storedToken || storedToken.revoked || storedToken.expiresAt < new Date()) {
        throw new Error('Invalid or expired refresh token');
      }

      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Invalidate the old refresh token
      await prisma.refreshToken.update({
        where: { id: storedToken.id },
        data: { revoked: true, revokedAt: new Date() },
      });

      // Generate new tokens
      const newAccessToken = this.generateAccessToken(user.id, user.role, user.organizationId);
      const newRefreshToken = this.generateRefreshToken(user.id);

      await prisma.refreshToken.create({
        data: {
          token: newRefreshToken,
          userId: user.id,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  static async verifyEmail(token: string) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { email: string };
      const user = await prisma.user.findUnique({ where: { email: decoded.email } });
      if (!user) throw new Error('User not found');
      
      await prisma.user.update({
        where: { id: user.id },
        data: { emailVerified: true },
      });
      return true;
    } catch (err) {
      throw { status: 400, message: 'Invalid or expired verification token' };
    }
  }

  static async resendVerification(email: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error('User not found');
    if (user.emailVerified) throw { status: 400, message: 'Email already verified' };

    const verificationToken = jwt.sign(
      { email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    await EmailService.sendVerificationEmail(user.email, verificationToken);
  }

  private static generateAccessToken(userId: string, role: string, organizationId: string) {
    return jwt.sign(
      { userId, role, organizationId },
      JWT_SECRET,
      { expiresIn: ACCESS_TOKEN_EXPIRES_IN }
    );
  }

  private static generateRefreshToken(userId: string) {
    return jwt.sign(
      { userId, jti: uuidv4() },
      REFRESH_SECRET,
      { expiresIn: REFRESH_TOKEN_EXPIRES_IN }
    );
  }
}
