import type { UserSkillSummary } from "@codeforge/types";

/** Bandas de maestría (sección 71 de SPEC.md). */
export function masteryBand(score: number): UserSkillSummary["masteryBand"] {
  if (score <= 20) return "NOVATO";
  if (score <= 40) return "BASICO";
  if (score <= 60) return "EN_DESARROLLO";
  if (score <= 80) return "COMPETENTE";
  return "DOMINADO";
}
