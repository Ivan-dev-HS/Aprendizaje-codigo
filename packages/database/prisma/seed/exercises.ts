import { seedExercises } from "./content/exercise-helpers.js";
import { HTML_EXERCISES } from "./content/exercises-html.js";
import { CSS_EXERCISES } from "./content/exercises-css.js";
import { JAVASCRIPT_EXERCISES } from "./content/exercises-javascript.js";
import { GIT_EXERCISES } from "./content/exercises-git.js";

/**
 * Ejercicios reales (sección 15/69 de SPEC.md) para los tipos cuyo motor de
 * corrección no depende del exec-service (Fase 5): MCQ, TRUE_FALSE, ORDERING,
 * MATCHING, OUTPUT_PREDICTION, CODE_COMPLETION y DEBUGGING. Ver
 * docs/CONTENT_BACKLOG.md para el resto de tipos (CODE_WRITING, SQL,
 * TERMINAL, REAL_CASE, PROJECT_TASK) y su fase de activación.
 */
export async function seedExerciseContent() {
  const count = await seedExercises([
    ...HTML_EXERCISES,
    ...CSS_EXERCISES,
    ...JAVASCRIPT_EXERCISES,
    ...GIT_EXERCISES,
  ]);
  console.log(`  ✔ ${count} ejercicios`);
}
