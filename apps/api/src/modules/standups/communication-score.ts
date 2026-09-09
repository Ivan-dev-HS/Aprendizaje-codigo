/**
 * Heurística basada en reglas simples (sección 31 de SPEC.md: "evaluar
 * calidad de comunicación"). No es IA ni NLP real — no hay ningún modelo de
 * lenguaje integrado en el proyecto — así que se documenta explícitamente
 * como heurística basada en reglas verificables, nunca presentada como una
 * evaluación "inteligente". Cada regla suma puntos por señales concretas de
 * una actualización de standup útil: longitud mínima, especificidad
 * (menciona tickets/números/acciones concretas) y ausencia de relleno vago.
 */
const VAGUE_FILLERS = [
  "cosas",
  "algo",
  "trabajando en eso",
  "lo de siempre",
  "ya sabes",
  "nada en especial",
];

const TICKET_CODE_PATTERN = /\b[A-Z]{2,10}-\d+\b/;
const ACTION_VERBS = [
  "implementé",
  "arreglé",
  "revisé",
  "desplegué",
  "probé",
  "documenté",
  "refactoricé",
  "investigué",
  "terminé",
  "empecé",
  "voy a",
  "haré",
];

function scoreEntry(text: string): number {
  const normalized = text.toLowerCase().trim();
  if (!normalized) return 0;

  let score = 0;
  if (normalized.length >= 15) score += 20;
  if (normalized.length >= 40) score += 10;
  if (TICKET_CODE_PATTERN.test(text)) score += 25;
  if (ACTION_VERBS.some((verb) => normalized.includes(verb))) score += 20;
  if (!VAGUE_FILLERS.some((filler) => normalized.includes(filler))) score += 15;
  const sentenceCount = normalized
    .split(/[.!?]+/)
    .filter((s) => s.trim().length > 0).length;
  if (sentenceCount >= 2) score += 10;

  return Math.min(100, score);
}

export function calculateCommunicationScore(
  yesterday: string,
  today: string,
  blockers?: string,
): number {
  const yesterdayScore = scoreEntry(yesterday);
  const todayScore = scoreEntry(today);
  const blockersBonus = blockers && blockers.trim().length > 0 ? 5 : 0;
  return Math.min(100, Math.round((yesterdayScore + todayScore) / 2) + blockersBonus);
}
