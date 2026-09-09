/**
 * Heurística basada en reglas simples (sección 39 de SPEC.md: Technical,
 * Problem Solving, Communication, Confidence, Overall). No es IA ni NLP real
 * — no hay ningún modelo de lenguaje integrado en el proyecto — así que nunca
 * se compara `answerText` contra `expectedAnswer` palabra por palabra (sería
 * una corrección injusta y frágil sobre texto libre, el mismo problema que
 * llevó a rediseñar Case y PullRequest como opción múltiple). Las preguntas
 * de entrevista sí son inherentemente de texto libre en la vida real, así
 * que en vez de forzar un múltiple choice artificial, cada dimensión suma
 * puntos únicamente por señales positivas y verificables detectadas en el
 * texto — nunca resta por no encontrar una frase exacta. `commonMistakes` se
 * muestra como contenido educativo tras responder, nunca se usa para
 * penalizar automáticamente.
 */

const REASONING_MARKERS = [
  "porque",
  "por lo tanto",
  "primero",
  "luego",
  "entonces",
  "así que",
  "para empezar",
  "en ese caso",
  "por ejemplo",
  "esto significa que",
  "si esto pasa",
  "en resumen",
];

const HEDGING_MARKERS = [
  "no sé",
  "no lo sé",
  "no estoy segur",
  "quizás",
  "tal vez",
  "supongo",
  "ni idea",
  "no tengo claro",
  "no recuerdo",
];

function normalize(text: string): string {
  return text.toLowerCase().trim();
}

function sentenceCount(normalized: string): number {
  return normalized.split(/[.!?]+/).filter((s) => s.trim().length > 0).length;
}

interface ConceptCoverage {
  score: number;
  mentioned: string[];
  missing: string[];
}

function scoreConceptCoverage(answer: string, concepts: string[]): ConceptCoverage {
  const normalized = normalize(answer);
  const mentioned = concepts.filter((c) => normalized.includes(c.toLowerCase()));
  const missing = concepts.filter((c) => !mentioned.includes(c));
  const ratio = concepts.length > 0 ? mentioned.length / concepts.length : 0;
  return { score: Math.round(ratio * 100), mentioned, missing };
}

function scoreReasoning(normalized: string): number {
  const markerHits = REASONING_MARKERS.filter((m) => normalized.includes(m)).length;
  let score = Math.min(60, markerHits * 20);
  if (normalized.length >= 80) score += 20;
  if (sentenceCount(normalized) >= 3) score += 20;
  return Math.min(100, score);
}

function scoreCommunication(normalized: string): number {
  let score = 0;
  if (normalized.length >= 20) score += 25;
  if (normalized.length >= 60) score += 15;
  if (sentenceCount(normalized) >= 2) score += 30;
  if (sentenceCount(normalized) >= 4) score += 10;
  if (normalized.length <= 800) score += 20; // respuesta ordenada, no un volcado sin editar
  return Math.min(100, score);
}

function scoreConfidence(normalized: string): number {
  let score = 75; // se asume una respuesta razonablemente segura salvo señales en contra
  const hedgeHits = HEDGING_MARKERS.filter((m) => normalized.includes(m)).length;
  score -= hedgeHits * 25;
  if (normalized.length < 15) score -= 35; // una respuesta muy corta lee como poco preparada
  return Math.max(0, Math.min(100, score));
}

export interface AnswerScoreBreakdown {
  technical: number;
  problemSolving: number;
  communication: number;
  confidence: number;
  overall: number;
  conceptsMentioned: string[];
  conceptsMissing: string[];
}

const WEIGHTS = {
  technical: 0.4,
  problemSolving: 0.25,
  communication: 0.2,
  confidence: 0.15,
};

export function scoreAnswer(
  answerText: string,
  concepts: string[],
): AnswerScoreBreakdown {
  const normalized = normalize(answerText);
  const {
    score: technical,
    mentioned,
    missing,
  } = scoreConceptCoverage(answerText, concepts);
  const problemSolving = scoreReasoning(normalized);
  const communication = scoreCommunication(normalized);
  const confidence = scoreConfidence(normalized);
  const overall = Math.round(
    technical * WEIGHTS.technical +
      problemSolving * WEIGHTS.problemSolving +
      communication * WEIGHTS.communication +
      confidence * WEIGHTS.confidence,
  );

  return {
    technical,
    problemSolving,
    communication,
    confidence,
    overall,
    conceptsMentioned: mentioned,
    conceptsMissing: missing,
  };
}

export interface AttemptScores {
  technicalScore: number;
  problemSolvingScore: number;
  communicationScore: number;
  confidenceScore: number;
  overallScore: number;
}

export function aggregateAttemptScores(
  breakdowns: Pick<
    AnswerScoreBreakdown,
    "technical" | "problemSolving" | "communication" | "confidence" | "overall"
  >[],
): AttemptScores {
  if (breakdowns.length === 0) {
    return {
      technicalScore: 0,
      problemSolvingScore: 0,
      communicationScore: 0,
      confidenceScore: 0,
      overallScore: 0,
    };
  }
  const avg = (
    key: "technical" | "problemSolving" | "communication" | "confidence" | "overall",
  ) => Math.round(breakdowns.reduce((sum, b) => sum + b[key], 0) / breakdowns.length);

  return {
    technicalScore: avg("technical"),
    problemSolvingScore: avg("problemSolving"),
    communicationScore: avg("communication"),
    confidenceScore: avg("confidence"),
    overallScore: avg("overall"),
  };
}
