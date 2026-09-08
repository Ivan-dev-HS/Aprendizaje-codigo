import { describe, expect, it } from "vitest";
import { applyExperienceAdjustments, buildRoadmap } from "./learning-path.js";

describe("buildRoadmap", () => {
  it("FROM_SCRATCH incluye fundamentos-informatica como obligatorio para un principiante", () => {
    const roadmap = buildRoadmap("FROM_SCRATCH", "NONE");
    const first = roadmap.find((i) => i.courseSlug === "fundamentos-informatica");
    expect(first?.isRequired).toBe(true);
  });

  it("FRONTEND no incluye node como obligatorio", () => {
    const roadmap = buildRoadmap("FRONTEND", "NONE");
    const node = roadmap.find((i) => i.courseSlug === "node");
    expect(node?.isRequired).toBe(false);
  });

  it("IT_SUPPORT prioriza linux e it-support como obligatorios", () => {
    const roadmap = buildRoadmap("IT_SUPPORT", "NONE");
    expect(roadmap.find((i) => i.courseSlug === "linux")?.isRequired).toBe(true);
    expect(roadmap.find((i) => i.courseSlug === "it-support")?.isRequired).toBe(true);
    expect(roadmap.find((i) => i.courseSlug === "react")).toBeUndefined();
  });
});

describe("applyExperienceAdjustments", () => {
  const roadmap = buildRoadmap("FULL_STACK", "NONE");

  it("NONE no modifica ningún curso", () => {
    const adjusted = applyExperienceAdjustments(roadmap, "NONE");
    expect(adjusted).toEqual(roadmap);
  });

  it("BASIC marca fundamentos-informatica como opcional pero no HTML", () => {
    const adjusted = applyExperienceAdjustments(roadmap, "BASIC");
    expect(
      adjusted.find((i) => i.courseSlug === "fundamentos-informatica")?.isRequired,
    ).toBe(false);
    expect(adjusted.find((i) => i.courseSlug === "html")?.isRequired).toBe(true);
  });

  it("ADVANCED marca html, css, git-github, javascript y typescript como opcionales", () => {
    const adjusted = applyExperienceAdjustments(roadmap, "ADVANCED");
    for (const slug of ["html", "css", "git-github", "javascript", "typescript"]) {
      expect(adjusted.find((i) => i.courseSlug === slug)?.isRequired).toBe(false);
    }
    // Pero no toca cursos que no son introductorios.
    expect(adjusted.find((i) => i.courseSlug === "docker")?.isRequired).toBe(true);
  });
});
