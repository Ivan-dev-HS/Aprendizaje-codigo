import { prisma } from "@codeforge/database";
import type { LearningPathSummary } from "@codeforge/types";
import { HttpError } from "../../lib/http-error.js";

export const learningPathsService = {
  async getForUser(userId: string): Promise<LearningPathSummary> {
    const learningPath = await prisma.learningPath.findUnique({
      where: { userId },
      include: {
        items: {
          orderBy: { order: "asc" },
          include: {
            course: {
              include: { modules: { include: { lessons: { select: { id: true } } } } },
            },
          },
        },
      },
    });
    if (!learningPath) {
      throw HttpError.notFound("Todavía no has completado el onboarding.");
    }

    const completed = await prisma.lessonProgress
      .findMany({
        where: { userId, completedAt: { not: null } },
        select: { lessonId: true },
      })
      .then((rows) => new Set(rows.map((r) => r.lessonId)));

    let previousRequiredCompleted = true;

    const items = learningPath.items.map((item) => {
      const lessonIds = item.course.modules.flatMap((m) => m.lessons.map((l) => l.id));
      const completedLessonCount = lessonIds.filter((id) => completed.has(id)).length;
      const isCompleted =
        lessonIds.length > 0 && completedLessonCount === lessonIds.length;
      const isUnlocked = !item.isRequired || previousRequiredCompleted;

      if (item.isRequired) previousRequiredCompleted = isCompleted;

      return {
        courseSlug: item.course.slug,
        courseTitle: item.course.title,
        order: item.order,
        isRequired: item.isRequired,
        isUnlocked,
        isCompleted,
        lessonCount: lessonIds.length,
        completedLessonCount,
      };
    });

    return { goal: learningPath.goal, items };
  },
};
