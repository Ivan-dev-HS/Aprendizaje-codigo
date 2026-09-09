import { describe, expect, it } from "vitest";
import { aggregateAttemptScores, scoreAnswer } from "./interview-scoring.js";

describe("scoreAnswer", () => {
  const concepts = ["closure", "scope léxico", "función interna"];

  it("otorga technical alto cuando la respuesta menciona los conceptos clave", () => {
    const answer =
      "Un closure es cuando una función interna recuerda el scope léxico en el que fue creada, incluso después de que la función externa haya terminado de ejecutarse. Por ejemplo, esto significa que la función interna sigue teniendo acceso a esas variables.";
    const result = scoreAnswer(answer, concepts);
    expect(result.technical).toBe(100);
    expect(result.conceptsMentioned).toEqual(concepts);
    expect(result.conceptsMissing).toEqual([]);
  });

  it("technical es 0 si no se menciona ningún concepto, sin penalizar otras dimensiones por eso", () => {
    const answer = "No estoy seguro de cómo explicar esto con mis propias palabras.";
    const result = scoreAnswer(answer, concepts);
    expect(result.technical).toBe(0);
    expect(result.conceptsMissing).toEqual(concepts);
  });

  it("una respuesta muy corta y vacilante tiene baja confianza", () => {
    const result = scoreAnswer("no sé, tal vez", concepts);
    expect(result.confidence).toBeLessThan(40);
  });

  it("una respuesta con marcadores de razonamiento y varias frases sube problemSolving", () => {
    const answer =
      "Primero identificaría el problema. Luego revisaría los logs. Por lo tanto, entendería la causa raíz antes de aplicar un fix.";
    const result = scoreAnswer(answer, []);
    expect(result.problemSolving).toBeGreaterThan(50);
  });

  it("nunca puntúa por debajo de 0 ni por encima de 100 en ninguna dimensión", () => {
    const result = scoreAnswer("no sé no sé no sé no sé no sé", concepts);
    for (const value of [
      result.technical,
      result.problemSolving,
      result.communication,
      result.confidence,
      result.overall,
    ]) {
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThanOrEqual(100);
    }
  });
});

describe("aggregateAttemptScores", () => {
  it("promedia cada dimensión entre todas las respuestas del intento", () => {
    const scores = aggregateAttemptScores([
      {
        technical: 100,
        problemSolving: 80,
        communication: 60,
        confidence: 40,
        overall: 75,
      },
      {
        technical: 0,
        problemSolving: 20,
        communication: 40,
        confidence: 60,
        overall: 25,
      },
    ]);
    expect(scores.technicalScore).toBe(50);
    expect(scores.problemSolvingScore).toBe(50);
    expect(scores.communicationScore).toBe(50);
    expect(scores.confidenceScore).toBe(50);
    expect(scores.overallScore).toBe(50);
  });

  it("devuelve todo en 0 si no hay respuestas", () => {
    expect(aggregateAttemptScores([])).toEqual({
      technicalScore: 0,
      problemSolvingScore: 0,
      communicationScore: 0,
      confidenceScore: 0,
      overallScore: 0,
    });
  });
});
