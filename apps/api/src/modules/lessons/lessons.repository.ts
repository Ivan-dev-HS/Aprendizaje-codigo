import { prisma } from "@codeforge/database";

export const lessonsRepository = {
  findByIdWithContext(id: string) {
    return prisma.lesson.findUnique({
      where: { id },
      include: {
        skill: true,
        module: {
          include: {
            course: true,
            lessons: { orderBy: { order: "asc" }, select: { id: true } },
          },
        },
      },
    });
  },

  findProgress(userId: string, lessonId: string) {
    return prisma.lessonProgress.findUnique({
      where: { userId_lessonId: { userId, lessonId } },
    });
  },

  startProgress(userId: string, lessonId: string) {
    return prisma.lessonProgress.upsert({
      where: { userId_lessonId: { userId, lessonId } },
      update: {},
      create: { userId, lessonId },
    });
  },

  upsertProgress(userId: string, lessonId: string) {
    return prisma.lessonProgress.upsert({
      where: { userId_lessonId: { userId, lessonId } },
      update: { completedAt: new Date() },
      create: { userId, lessonId, completedAt: new Date() },
    });
  },
};
