import { afterAll, describe, expect, it } from "vitest";
import request from "supertest";
import { prisma } from "@codeforge/database";
import { createApp } from "../../app.js";
import { DIAGNOSTIC_QUIZ } from "./diagnostic-quiz.js";

const app = createApp();

const testUser = {
  email: `test-onboarding-${Date.now()}@example.local`,
  username: `testob${Date.now()}`.slice(0, 20),
  password: "SuperSecreta123",
  displayName: "Test Onboarding",
};

afterAll(async () => {
  await prisma.user.deleteMany({ where: { email: testUser.email } });
});

describe("GET /api/v1/onboarding/quiz", () => {
  it("devuelve las preguntas sin la respuesta correcta", async () => {
    const res = await request(app).get("/api/v1/onboarding/quiz");
    expect(res.status).toBe(200);
    expect(res.body.questions).toHaveLength(DIAGNOSTIC_QUIZ.length);
    expect(res.body.questions[0].correctOptionId).toBeUndefined();
  });
});

describe("POST /api/v1/onboarding", () => {
  it("genera un roadmap real y marca skills según los aciertos", async () => {
    const registerRes = await request(app).post("/api/v1/auth/register").send(testUser);
    const accessToken = registerRes.body.accessToken as string;

    // Responde todo correcto salvo la de Git, para forzar una skill "weak".
    const answers = DIAGNOSTIC_QUIZ.map((q) => ({
      questionId: q.id,
      optionId: q.skillSlug === "git" ? "a" : q.correctOptionId,
    }));

    const res = await request(app)
      .post("/api/v1/onboarding")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ experienceLevel: "BASIC", goal: "FRONTEND", assessmentAnswers: answers });

    expect(res.status).toBe(200);
    expect(res.body.assessment.score).toBeGreaterThan(0);
    expect(res.body.assessment.recommendations.length).toBeGreaterThan(0);
    expect(res.body.learningPath.items.length).toBeGreaterThan(0);
    expect(res.body.learningPath.items[0].courseSlug).toBe("fundamentos-informatica");
    expect(res.body.learningPath.items[0].isRequired).toBe(false);
    const htmlItem = res.body.learningPath.items.find(
      (item: { courseSlug: string }) => item.courseSlug === "html",
    );
    expect(htmlItem.isRequired).toBe(true);
    expect(res.body.profile.onboardingCompletedAt).not.toBeNull();

    const meRes = await request(app)
      .get("/api/v1/users/me")
      .set("Authorization", `Bearer ${accessToken}`);
    expect(meRes.body.user.profile.goal).toBe("FRONTEND");
  });
});
