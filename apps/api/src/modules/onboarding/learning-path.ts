import type { ExperienceLevel, Goal } from "@codeforge/types";

export interface RoadmapItem {
  courseSlug: string;
  isRequired: boolean;
}

/**
 * Ruta de aprendizaje por objetivo (sección 8/10 de SPEC.md). El orden importa:
 * define la secuencia del roadmap visual. `isRequired: false` marca contenido
 * que el usuario puede saltar porque no es imprescindible para su objetivo
 * (no porque ya lo domine — eso lo ajusta `applyExperienceAdjustments`).
 */
const BASE_ROADMAPS: Record<Goal, RoadmapItem[]> = {
  FROM_SCRATCH: [
    { courseSlug: "fundamentos-informatica", isRequired: true },
    { courseSlug: "html", isRequired: true },
    { courseSlug: "css", isRequired: true },
    { courseSlug: "javascript", isRequired: true },
    { courseSlug: "git-github", isRequired: true },
    { courseSlug: "typescript", isRequired: true },
    { courseSlug: "react", isRequired: true },
    { courseSlug: "node", isRequired: true },
    { courseSlug: "apis-rest", isRequired: true },
    { courseSlug: "sql-postgresql", isRequired: true },
    { courseSlug: "linux", isRequired: true },
    { courseSlug: "testing", isRequired: true },
    { courseSlug: "docker", isRequired: true },
    { courseSlug: "debugging", isRequired: true },
    { courseSlug: "proyecto-full-stack", isRequired: true },
    { courseSlug: "trabajo-en-empresa", isRequired: true },
    { courseSlug: "entrevistas", isRequired: true },
    { courseSlug: "it-support", isRequired: false },
  ],
  FRONTEND: [
    { courseSlug: "fundamentos-informatica", isRequired: false },
    { courseSlug: "html", isRequired: true },
    { courseSlug: "css", isRequired: true },
    { courseSlug: "javascript", isRequired: true },
    { courseSlug: "git-github", isRequired: true },
    { courseSlug: "typescript", isRequired: true },
    { courseSlug: "react", isRequired: true },
    { courseSlug: "testing", isRequired: true },
    { courseSlug: "debugging", isRequired: true },
    { courseSlug: "proyecto-full-stack", isRequired: true },
    { courseSlug: "trabajo-en-empresa", isRequired: false },
    { courseSlug: "entrevistas", isRequired: true },
    { courseSlug: "node", isRequired: false },
    { courseSlug: "apis-rest", isRequired: false },
    { courseSlug: "sql-postgresql", isRequired: false },
    { courseSlug: "linux", isRequired: false },
    { courseSlug: "docker", isRequired: false },
    { courseSlug: "it-support", isRequired: false },
  ],
  BACKEND: [
    { courseSlug: "fundamentos-informatica", isRequired: false },
    { courseSlug: "javascript", isRequired: true },
    { courseSlug: "git-github", isRequired: true },
    { courseSlug: "typescript", isRequired: true },
    { courseSlug: "node", isRequired: true },
    { courseSlug: "apis-rest", isRequired: true },
    { courseSlug: "sql-postgresql", isRequired: true },
    { courseSlug: "linux", isRequired: true },
    { courseSlug: "testing", isRequired: true },
    { courseSlug: "docker", isRequired: true },
    { courseSlug: "debugging", isRequired: true },
    { courseSlug: "proyecto-full-stack", isRequired: true },
    { courseSlug: "trabajo-en-empresa", isRequired: true },
    { courseSlug: "entrevistas", isRequired: true },
    { courseSlug: "html", isRequired: false },
    { courseSlug: "css", isRequired: false },
    { courseSlug: "react", isRequired: false },
    { courseSlug: "it-support", isRequired: false },
  ],
  FULL_STACK: [
    { courseSlug: "fundamentos-informatica", isRequired: true },
    { courseSlug: "html", isRequired: true },
    { courseSlug: "css", isRequired: true },
    { courseSlug: "javascript", isRequired: true },
    { courseSlug: "git-github", isRequired: true },
    { courseSlug: "typescript", isRequired: true },
    { courseSlug: "react", isRequired: true },
    { courseSlug: "node", isRequired: true },
    { courseSlug: "apis-rest", isRequired: true },
    { courseSlug: "sql-postgresql", isRequired: true },
    { courseSlug: "linux", isRequired: true },
    { courseSlug: "testing", isRequired: true },
    { courseSlug: "docker", isRequired: true },
    { courseSlug: "debugging", isRequired: true },
    { courseSlug: "proyecto-full-stack", isRequired: true },
    { courseSlug: "trabajo-en-empresa", isRequired: true },
    { courseSlug: "entrevistas", isRequired: true },
    { courseSlug: "it-support", isRequired: false },
  ],
  IT_SUPPORT: [
    { courseSlug: "fundamentos-informatica", isRequired: true },
    { courseSlug: "linux", isRequired: true },
    { courseSlug: "it-support", isRequired: true },
    { courseSlug: "git-github", isRequired: true },
    { courseSlug: "debugging", isRequired: true },
    { courseSlug: "entrevistas", isRequired: true },
    { courseSlug: "html", isRequired: false },
    { courseSlug: "css", isRequired: false },
    { courseSlug: "javascript", isRequired: false },
    { courseSlug: "sql-postgresql", isRequired: false },
    { courseSlug: "trabajo-en-empresa", isRequired: false },
  ],
  INTERVIEW_PREP: [
    { courseSlug: "git-github", isRequired: true },
    { courseSlug: "javascript", isRequired: true },
    { courseSlug: "debugging", isRequired: true },
    { courseSlug: "entrevistas", isRequired: true },
    { courseSlug: "fundamentos-informatica", isRequired: false },
    { courseSlug: "html", isRequired: false },
    { courseSlug: "css", isRequired: false },
    { courseSlug: "typescript", isRequired: false },
    { courseSlug: "react", isRequired: false },
    { courseSlug: "node", isRequired: false },
    { courseSlug: "apis-rest", isRequired: false },
    { courseSlug: "sql-postgresql", isRequired: false },
    { courseSlug: "testing", isRequired: false },
    { courseSlug: "proyecto-full-stack", isRequired: false },
    { courseSlug: "trabajo-en-empresa", isRequired: false },
  ],
};

/**
 * Perfil B (autodidacta, sección 2/9): si declara experiencia previa, los
 * cursos más introductorios de su ruta se marcan como opcionales en vez de
 * obligatorios, para que pueda saltarlos sin perder acceso a ellos.
 */
export function applyExperienceAdjustments(
  items: RoadmapItem[],
  experienceLevel: ExperienceLevel,
): RoadmapItem[] {
  if (experienceLevel === "NONE") return items;

  const skippableBasic = new Set(["fundamentos-informatica"]);
  const skippableIntermediate = new Set(["html", "css", "git-github"]);
  const skippableAdvanced = new Set(["javascript", "typescript"]);

  return items.map((item) => {
    if (skippableBasic.has(item.courseSlug)) return { ...item, isRequired: false };
    if (
      (experienceLevel === "INTERMEDIATE" || experienceLevel === "ADVANCED") &&
      skippableIntermediate.has(item.courseSlug)
    ) {
      return { ...item, isRequired: false };
    }
    if (experienceLevel === "ADVANCED" && skippableAdvanced.has(item.courseSlug)) {
      return { ...item, isRequired: false };
    }
    return item;
  });
}

export function buildRoadmap(
  goal: Goal,
  experienceLevel: ExperienceLevel,
): RoadmapItem[] {
  return applyExperienceAdjustments(BASE_ROADMAPS[goal], experienceLevel);
}
