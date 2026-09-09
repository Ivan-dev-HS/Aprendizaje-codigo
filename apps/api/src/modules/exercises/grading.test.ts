import { describe, expect, it } from "vitest";
import { calculateXpForAttempt, gradeAttempt } from "./grading.js";

describe("gradeAttempt", () => {
  it("MCQ: correcto solo si coincide el optionId", () => {
    const solution = { correctOptionId: "b" };
    expect(gradeAttempt("MCQ", solution, { type: "MCQ", optionId: "b" })).toBe(true);
    expect(gradeAttempt("MCQ", solution, { type: "MCQ", optionId: "a" })).toBe(false);
  });

  it("TRUE_FALSE: compara el booleano", () => {
    const solution = { correct: true };
    expect(
      gradeAttempt("TRUE_FALSE", solution, { type: "TRUE_FALSE", value: true }),
    ).toBe(true);
    expect(
      gradeAttempt("TRUE_FALSE", solution, { type: "TRUE_FALSE", value: false }),
    ).toBe(false);
  });

  it("ORDERING: exige el mismo orden exacto", () => {
    const solution = { correctOrder: ["a", "b", "c"] };
    expect(
      gradeAttempt("ORDERING", solution, { type: "ORDERING", order: ["a", "b", "c"] }),
    ).toBe(true);
    expect(
      gradeAttempt("ORDERING", solution, { type: "ORDERING", order: ["a", "c", "b"] }),
    ).toBe(false);
  });

  it("MATCHING: todos los pares deben coincidir, el orden de envío no importa", () => {
    const solution = {
      correctPairs: [
        { leftId: "l1", rightId: "r1" },
        { leftId: "l2", rightId: "r2" },
      ],
    };
    expect(
      gradeAttempt("MATCHING", solution, {
        type: "MATCHING",
        pairs: [
          { leftId: "l2", rightId: "r2" },
          { leftId: "l1", rightId: "r1" },
        ],
      }),
    ).toBe(true);
    expect(
      gradeAttempt("MATCHING", solution, {
        type: "MATCHING",
        pairs: [{ leftId: "l1", rightId: "r2" }],
      }),
    ).toBe(false);
  });

  it("OUTPUT_PREDICTION: ignora mayúsculas y espacios extra", () => {
    const solution = { expectedOutput: "Hola Mundo" };
    expect(
      gradeAttempt("OUTPUT_PREDICTION", solution, {
        type: "OUTPUT_PREDICTION",
        output: "  hola   mundo  ",
      }),
    ).toBe(true);
  });

  it("CODE_COMPLETION: acepta cualquiera de las respuestas aceptables", () => {
    const solution = {
      expectedAnswer: "map",
      acceptableAnswers: ["Array.prototype.map"],
    };
    expect(
      gradeAttempt("CODE_COMPLETION", solution, {
        type: "CODE_COMPLETION",
        answer: "MAP",
      }),
    ).toBe(true);
    expect(
      gradeAttempt("CODE_COMPLETION", solution, {
        type: "CODE_COMPLETION",
        answer: "filter",
      }),
    ).toBe(false);
  });

  it("DEBUGGING: correcto solo si coincide el optionId", () => {
    const solution = { correctOptionId: "c" };
    expect(
      gradeAttempt("DEBUGGING", solution, { type: "DEBUGGING", optionId: "c" }),
    ).toBe(true);
  });

  it("lanza un error explícito para tipos aún sin motor de corrección", () => {
    expect(() => gradeAttempt("SQL", {}, { type: "MCQ", optionId: "a" })).toThrow(/Fase/);
  });
});

describe("calculateXpForAttempt", () => {
  it("no otorga XP si la respuesta es incorrecta", () => {
    expect(calculateXpForAttempt(25, 0, false)).toBe(0);
  });

  it("otorga los puntos completos sin pistas", () => {
    expect(calculateXpForAttempt(25, 0, true)).toBe(25);
  });

  it("penaliza un 15% por cada pista usada", () => {
    expect(calculateXpForAttempt(100, 1, true)).toBe(85);
    expect(calculateXpForAttempt(100, 2, true)).toBe(70);
  });

  it("nunca otorga menos del 40% de los puntos", () => {
    expect(calculateXpForAttempt(100, 3, true)).toBe(55);
    expect(calculateXpForAttempt(100, 10, true)).toBe(40);
  });
});
