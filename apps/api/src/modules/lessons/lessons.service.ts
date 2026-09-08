import type { LessonBlock, LessonDetail } from "@codeforge/types";
import { HttpError } from "../../lib/http-error.js";
import { awardXp, recordProgressEvent } from "../gamification/xp.service.js";
import { computeModuleLocks } from "../courses/module-lock.js";
import { coursesRepository } from "../courses/courses.repository.js";
import { lessonsRepository } from "./lessons.repository.js";

const LESSON_XP = 10; // sección 42 de SPEC.md

async function assertUnlocked(
  lesson: NonNullable<Awaited<ReturnType<typeof lessonsRepository.findByIdWithContext>>>,
  userId: string,
) {
  const course = await coursesRepository.findBySlugWithContent(lesson.module.course.slug);
  if (!course) return; // no debería pasar; si pasa, no bloqueamos por un dato inconsistente.
  const completed = await coursesRepository.completedLessonIdsForUser(userId);
  const locks = computeModuleLocks(course.modules, completed);
  if (locks.get(lesson.moduleId)) {
    throw HttpError.forbidden(
      "Completa antes las lecciones del módulo anterior para desbloquear esta lección.",
    );
  }
}

export const lessonsService = {
  async getDetail(lessonId: string, userId?: string): Promise<LessonDetail> {
    const lesson = await lessonsRepository.findByIdWithContext(lessonId);
    if (!lesson) throw HttpError.notFound("Lección no encontrada.");

    if (userId) {
      await assertUnlocked(lesson, userId);
    }

    const completed = userId
      ? await coursesRepository.completedLessonIdsForUser(userId)
      : new Set<string>();
    const siblingIds = lesson.module.lessons.map((l) => l.id);
    const index = siblingIds.indexOf(lesson.id);

    return {
      id: lesson.id,
      slug: lesson.slug,
      title: lesson.title,
      summary: lesson.summary,
      order: lesson.order,
      estimatedMinutes: lesson.estimatedMinutes,
      isCompleted: completed.has(lesson.id),
      content: lesson.content as unknown as LessonBlock[],
      skill: lesson.skill
        ? {
            id: lesson.skill.id,
            slug: lesson.skill.slug,
            name: lesson.skill.name,
            category: lesson.skill.category,
          }
        : null,
      moduleId: lesson.moduleId,
      moduleTitle: lesson.module.title,
      courseSlug: lesson.module.course.slug,
      courseTitle: lesson.module.course.title,
      previousLessonId: index > 0 ? (siblingIds[index - 1] ?? null) : null,
      nextLessonId:
        index >= 0 && index < siblingIds.length - 1
          ? (siblingIds[index + 1] ?? null)
          : null,
    };
  },

  async complete(lessonId: string, userId: string) {
    const lesson = await lessonsRepository.findByIdWithContext(lessonId);
    if (!lesson) throw HttpError.notFound("Lección no encontrada.");
    await assertUnlocked(lesson, userId);

    await lessonsRepository.upsertProgress(userId, lessonId);
    const xpResult = await awardXp(userId, LESSON_XP, "LESSON", lessonId);
    await recordProgressEvent(userId, "lesson_completed", { lessonId });

    return {
      lessonId,
      xpAwarded: xpResult.awarded,
      alreadyCompleted: xpResult.alreadyAwarded,
      totalXp: xpResult.totalXp,
      level: xpResult.level,
      leveledUp: xpResult.leveledUp,
    };
  },
};
