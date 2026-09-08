import { describe, expect, it } from "vitest";
import { computeLevel, nextStreakDays } from "./xp.service.js";

describe("computeLevel", () => {
  it("empieza en nivel 1 con 0 XP", () => {
    expect(computeLevel(0)).toBe(1);
  });
  it("sube de nivel cada 100 XP", () => {
    expect(computeLevel(99)).toBe(1);
    expect(computeLevel(100)).toBe(2);
    expect(computeLevel(250)).toBe(3);
  });
});

describe("nextStreakDays", () => {
  it("empieza en 1 si nunca hubo actividad", () => {
    expect(nextStreakDays(null, 0)).toBe(1);
  });

  it("mantiene la racha si la actividad es el mismo día", () => {
    expect(nextStreakDays(new Date(), 5)).toBe(5);
  });

  it("incrementa la racha si la actividad fue ayer", () => {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    expect(nextStreakDays(yesterday, 5)).toBe(6);
  });

  it("reinicia la racha a 1 si hay un hueco de más de un día", () => {
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    expect(nextStreakDays(threeDaysAgo, 10)).toBe(1);
  });
});
