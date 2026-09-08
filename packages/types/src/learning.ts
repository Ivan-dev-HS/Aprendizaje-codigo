import type { Goal } from "./auth.js";

/**
 * Bloques estructurados de una lección (sección 14 de SPEC.md): cada concepto
 * importante se enseña con explicación sencilla, explicación técnica, ejemplo,
 * error típico, reto y aplicación práctica — nunca solo una definición.
 */
export type LessonBlock =
  | { type: "theory"; title?: string; body: string }
  | { type: "technical"; title?: string; body: string }
  | { type: "example"; title?: string; body?: string; code: string; language: string }
  | {
      type: "common_mistake";
      title?: string;
      body: string;
      code?: string;
      language?: string;
    }
  | { type: "challenge"; title?: string; body: string }
  | { type: "real_application"; title?: string; body: string };

export interface SkillSummary {
  id: string;
  slug: string;
  name: string;
  category: string;
}

export interface UserSkillSummary extends SkillSummary {
  masteryScore: number;
  isWeak: boolean;
  masteryBand: "NOVATO" | "BASICO" | "EN_DESARROLLO" | "COMPETENTE" | "DOMINADO";
}

export interface LessonSummary {
  id: string;
  slug: string;
  title: string;
  summary: string;
  order: number;
  estimatedMinutes: number;
  isCompleted: boolean;
}

export interface LessonDetail extends LessonSummary {
  content: LessonBlock[];
  skill: SkillSummary | null;
  moduleId: string;
  moduleTitle: string;
  courseSlug: string;
  courseTitle: string;
  previousLessonId: string | null;
  nextLessonId: string | null;
}

export interface ModuleSummary {
  id: string;
  slug: string;
  title: string;
  description: string;
  order: number;
  isLocked: boolean;
  lessons: LessonSummary[];
}

export interface CourseSummary {
  id: string;
  slug: string;
  title: string;
  description: string;
  order: number;
  icon: string | null;
  estimatedHours: number | null;
  lessonCount: number;
  completedLessonCount: number;
}

export interface CourseDetail extends CourseSummary {
  modules: ModuleSummary[];
}

export interface LearningPathItemSummary {
  courseSlug: string;
  courseTitle: string;
  order: number;
  isRequired: boolean;
  isUnlocked: boolean;
  isCompleted: boolean;
  lessonCount: number;
  completedLessonCount: number;
}

export interface LearningPathSummary {
  goal: Goal;
  items: LearningPathItemSummary[];
}
