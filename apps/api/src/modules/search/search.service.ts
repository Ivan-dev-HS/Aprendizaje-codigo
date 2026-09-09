import { prisma } from "@codeforge/database";
import type { SearchResultItem } from "@codeforge/types";

const RESULTS_PER_TYPE = 5;

/**
 * Búsqueda global (sección 45/104 de SPEC.md). Coincidencia simple
 * case-insensitive por título sobre el catálogo publicado — sin motor de
 * búsqueda externo (no forma parte del alcance de este proyecto), pero
 * sobre datos 100% reales.
 */
export async function globalSearch(query: string): Promise<SearchResultItem[]> {
  const q = query.trim();
  if (q.length < 2) return [];

  const contains = { contains: q, mode: "insensitive" as const };

  const [courses, lessons, exercises, cases, projects, interviews] = await Promise.all([
    prisma.course.findMany({
      where: { isPublished: true, title: contains },
      take: RESULTS_PER_TYPE,
    }),
    prisma.lesson.findMany({
      where: { title: contains },
      take: RESULTS_PER_TYPE,
      include: { module: { include: { course: true } } },
    }),
    prisma.exercise.findMany({
      where: { isPublished: true, title: contains },
      take: RESULTS_PER_TYPE,
    }),
    prisma.case.findMany({
      where: { isPublished: true, title: contains },
      take: RESULTS_PER_TYPE,
    }),
    prisma.project.findMany({ where: { title: contains }, take: RESULTS_PER_TYPE }),
    prisma.interview.findMany({ where: { title: contains }, take: RESULTS_PER_TYPE }),
  ]);

  const results: SearchResultItem[] = [
    ...courses.map((c) => ({
      type: "COURSE" as const,
      id: c.id,
      title: c.title,
      subtitle: "Curso",
      link: `/courses/${c.slug}`,
    })),
    ...lessons.map((l) => ({
      type: "LESSON" as const,
      id: l.id,
      title: l.title,
      subtitle: `Lección · ${l.module.course.title}`,
      link: `/lessons/${l.id}`,
    })),
    ...exercises.map((e) => ({
      type: "EXERCISE" as const,
      id: e.id,
      title: e.title,
      subtitle: "Ejercicio",
      link: `/exercises/${e.id}`,
    })),
    ...cases.map((c) => ({
      type: "CASE" as const,
      id: c.id,
      title: c.title,
      subtitle: "Caso real",
      link: `/cases/${c.id}`,
    })),
    ...projects.map((p) => ({
      type: "PROJECT" as const,
      id: p.id,
      title: p.title,
      subtitle: "Proyecto",
      link: `/projects/${p.slug}`,
    })),
    ...interviews.map((i) => ({
      type: "INTERVIEW" as const,
      id: i.id,
      title: i.title,
      subtitle: "Entrevista",
      link: `/interviews/${i.slug}`,
    })),
  ];

  return results;
}
