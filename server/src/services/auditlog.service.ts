import prisma from '../utils/prisma';

export class AuditLogService {
  static async logAction(
    organizationId: string,
    userId: string,
    action: string,
    entity: string,
    entityId?: string,
    metadata?: any
  ) {
    return prisma.auditLog.create({
      data: {
        organizationId,
        userId,
        action,
        entity,
        entityId,
        metadata,
      },
    });
  }

  static async getLogs(organizationId: string, limit = 50) {
    return prisma.auditLog.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        user: { select: { firstName: true, lastName: true, email: true } }
      }
    });
  }
}
