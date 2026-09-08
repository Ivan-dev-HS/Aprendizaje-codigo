import { prisma } from "@codeforge/database";

export const coursesRepository = {
  listPublished() {
    return prisma.course.findMany({
      where: { isPublished: true },
      orderBy: { order: "asc" },
      include: { modules: { include: { lessons: { select: { id: true } } } } },
    });
  },

  findBySlugWithContent(slug: string) {
    return prisma.course.findUnique({
      where: { slug },
      include: {
        modules: {
          orderBy: { order: "asc" },
          include: {
            lessons: {
              orderBy: { order: "asc" },
            },
          },
        },
      },
    });
  },

  completedLessonIdsForUser(userId: string) {
    return prisma.lessonProgress
      .findMany({
        where: { userId, completedAt: { not: null } },
        select: { lessonId: true },
      })
      .then((rows) => new Set(rows.map((r) => r.lessonId)));
  },
};
