import prisma from '../utils/prisma';

export class CategoryService {
  static async getCategories(organizationId: string) {
    return prisma.category.findMany({
      where: { organizationId },
      orderBy: { name: 'asc' },
    });
  }

  static async createCategory(organizationId: string, data: { name: string, color?: string, description?: string }) {
    return prisma.category.create({
      data: {
        organizationId,
        name: data.name,
        color: data.color,
        description: data.description,
      },
    });
  }

  static async updateCategory(organizationId: string, categoryId: string, data: any) {
    return prisma.category.update({
      where: { id: categoryId, organizationId },
      data,
    });
  }

  static async deleteCategory(organizationId: string, categoryId: string) {
    return prisma.category.delete({
      where: { id: categoryId, organizationId },
    });
  }
}
