import { seedCourseContent } from "./content/helpers.js";
import { FUNDAMENTOS_MODULES } from "./content/fundamentos.js";
import { HTML_MODULES } from "./content/html.js";
import { CSS_MODULES } from "./content/css.js";
import { JAVASCRIPT_MODULES } from "./content/javascript.js";
import { GIT_MODULES } from "./content/git.js";

/**
 * Contenido real de los cursos insignia (ver IMPLEMENTATION_PLAN.md §3 y
 * docs/CONTENT_BACKLOG.md para el alcance de contenido). El resto de cursos
 * del catálogo existen como registros reales (seedCourses) pero todavía sin
 * módulos/lecciones — backlog explícito, no oculto.
 */
export async function seedLessons() {
  let total = 0;
  total += await seedCourseContent("fundamentos-informatica", FUNDAMENTOS_MODULES);
  total += await seedCourseContent("html", HTML_MODULES);
  total += await seedCourseContent("css", CSS_MODULES);
  total += await seedCourseContent("javascript", JAVASCRIPT_MODULES);
  total += await seedCourseContent("git-github", GIT_MODULES);
  console.log(`  ✔ ${total} lecciones (5 cursos insignia)`);
}
