import { prisma } from '../config/database.js';

export class TaxonomyService {
  public static async getAllCategories() {
    return prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { skills: true },
        },
      },
    });
  }

  public static async getSkills(categoryId?: string, categorySlug?: string) {
    const whereClause: Record<string, unknown> = {};

    if (categoryId) {
      whereClause.categoryId = categoryId;
    } else if (categorySlug) {
      whereClause.category = { slug: categorySlug };
    }

    return prisma.skill.findMany({
      where: whereClause,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            themeKey: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });
  }
}
