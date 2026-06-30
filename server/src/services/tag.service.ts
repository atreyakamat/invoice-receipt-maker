import prisma from '../utils/prisma';

export class TagService {
  static async getTags(organizationId: string) {
    return prisma.tag.findMany({
      where: { organizationId },
      orderBy: { name: 'asc' },
    });
  }

  static async createTag(organizationId: string, data: { name: string, color?: string }) {
    return prisma.tag.create({
      data: {
        organizationId,
        name: data.name,
        color: data.color,
      },
    });
  }

  static async deleteTag(organizationId: string, tagId: string) {
    return prisma.tag.delete({
      where: { id: tagId, organizationId },
    });
  }
}
