import type { ProjectLevel } from "@codeforge/database";

/**
 * `ProjectTask` no tiene puntos propios (a diferencia de `Exercise`): un
 * proyecto se premia como un todo al completarlo, no tarea a tarea, con XP
 * creciente según la complejidad del nivel (sección 34 de SPEC.md).
 */
export const PROJECT_XP_BY_LEVEL: Record<ProjectLevel, number> = {
  L1_PORTFOLIO: 100,
  L2_LANDING: 150,
  L3_TODO: 200,
  L4_DASHBOARD: 300,
  L5_API_APP: 400,
  L6_ECOMMERCE: 500,
  L7_FULL_STACK: 700,
  L8_SAAS: 900,
};
