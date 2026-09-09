import { describe, expect, it } from "vitest";
import { calculateCommunicationScore } from "./communication-score.js";

describe("calculateCommunicationScore", () => {
  it("puntúa bajo una actualización vaga y corta", () => {
    const score = calculateCommunicationScore("cosas", "algo");
    expect(score).toBeLessThan(30);
  });

  it("puntúa alto una actualización específica con referencias a tickets", () => {
    const score = calculateCommunicationScore(
      "Terminé el ticket NEX-102: arreglé el bug del formulario de login.",
      "Voy a implementar la validación de NEX-105 y revisar el PR de Marcos.",
    );
    expect(score).toBeGreaterThan(70);
  });

  it("una entrada vacía puntúa 0 en esa parte", () => {
    const score = calculateCommunicationScore("", "");
    expect(score).toBe(0);
  });

  it("mencionar un bloqueo real suma unos puntos extra", () => {
    const withoutBlocker = calculateCommunicationScore(
      "Terminé NEX-100 y revisé el PR de Elena.",
      "Voy a empezar NEX-101.",
    );
    const withBlocker = calculateCommunicationScore(
      "Terminé NEX-100 y revisé el PR de Elena.",
      "Voy a empezar NEX-101.",
      "Bloqueado esperando acceso a la base de datos de staging.",
    );
    expect(withBlocker).toBeGreaterThan(withoutBlocker);
  });
});
