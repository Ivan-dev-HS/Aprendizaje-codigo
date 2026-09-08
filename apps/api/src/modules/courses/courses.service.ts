import type { CourseDetail, CourseSummary } from "@codeforge/types";
import { HttpError } from "../../lib/http-error.js";
import { coursesRepository } from "./courses.repository.js";
import { computeModuleLocks } from "./module-lock.js";

export const coursesService = {
  async list(userId?: string): Promise<CourseSummary[]> {
    const courses = await coursesRepository.listPublished();
    const completed = userId
      ? await coursesRepository.completedLessonIdsForUser(userId)
      : new Set<string>();

    return courses.map((course) => {
      const lessonIds = course.modules.flatMap((m) => m.lessons.map((l) => l.id));
      return {
        id: course.id,
        slug: course.slug,
        title: course.title,
        description: course.description,
        order: course.order,
        icon: course.icon,
        estimatedHours: course.estimatedHours,
        lessonCount: lessonIds.length,
        completedLessonCount: lessonIds.filter((id) => completed.has(id)).length,
      };
    });
  },

  async getDetail(slug: string, userId?: string): Promise<CourseDetail> {
    const course = await coursesRepository.findBySlugWithContent(slug);
    if (!course || !course.isPublished) throw HttpError.notFound("Curso no encontrado.");

    const completed = userId
      ? await coursesRepository.completedLessonIdsForUser(userId)
      : new Set<string>();
    const locks = userId
      ? computeModuleLocks(course.modules, completed)
      : new Map(course.modules.map((m) => [m.id, false]));

    const modules = course.modules.map((mod) => ({
      id: mod.id,
      slug: mod.slug,
      title: mod.title,
      description: mod.description,
      order: mod.order,
      isLocked: locks.get(mod.id) ?? false,
      lessons: mod.lessons.map((lesson) => ({
        id: lesson.id,
        slug: lesson.slug,
        title: lesson.title,
        summary: lesson.summary,
        order: lesson.order,
        estimatedMinutes: lesson.estimatedMinutes,
        isCompleted: completed.has(lesson.id),
      })),
    }));

    const lessonIds = modules.flatMap((m) => m.lessons.map((l) => l.id));

    return {
      id: course.id,
      slug: course.slug,
      title: course.title,
      description: course.description,
      order: course.order,
      icon: course.icon,
      estimatedHours: course.estimatedHours,
      lessonCount: lessonIds.length,
      completedLessonCount: lessonIds.filter((id) => completed.has(id)).length,
      modules,
    };
  },
};
