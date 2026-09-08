import { prisma } from "../../../src/client.js";
import type { LessonBlock } from "@codeforge/types";

export interface LessonSeed {
  slug: string;
  title: string;
  summary: string;
  order: number;
  estimatedMinutes: number;
  skillSlug?: string;
  content: LessonBlock[];
}

export interface ModuleSeed {
  slug: string;
  title: string;
  description: string;
  order: number;
  lessons: LessonSeed[];
}

/** Crea/actualiza los módulos y lecciones de un curso a partir de su slug. Idempotente. */
export async function seedCourseContent(courseSlug: string, modules: ModuleSeed[]) {
  const course = await prisma.course.findUnique({ where: { slug: courseSlug } });
  if (!course) {
    throw new Error(
      `No existe el curso "${courseSlug}" — siembra los cursos antes que el contenido.`,
    );
  }

  let lessonCount = 0;

  for (const mod of modules) {
    const dbModule = await prisma.module.upsert({
      where: { courseId_slug: { courseId: course.id, slug: mod.slug } },
      update: { title: mod.title, description: mod.description, order: mod.order },
      create: {
        courseId: course.id,
        slug: mod.slug,
        title: mod.title,
        description: mod.description,
        order: mod.order,
      },
    });

    for (const lesson of mod.lessons) {
      const skill = lesson.skillSlug
        ? await prisma.skill.findUnique({ where: { slug: lesson.skillSlug } })
        : null;

      await prisma.lesson.upsert({
        where: { moduleId_slug: { moduleId: dbModule.id, slug: lesson.slug } },
        update: {
          title: lesson.title,
          summary: lesson.summary,
          order: lesson.order,
          estimatedMinutes: lesson.estimatedMinutes,
          skillId: skill?.id ?? null,
          content: lesson.content as unknown as object,
        },
        create: {
          moduleId: dbModule.id,
          slug: lesson.slug,
          title: lesson.title,
          summary: lesson.summary,
          order: lesson.order,
          estimatedMinutes: lesson.estimatedMinutes,
          skillId: skill?.id ?? null,
          content: lesson.content as unknown as object,
        },
      });
      lessonCount += 1;
    }
  }

  return lessonCount;
}
