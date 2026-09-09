import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import { prisma } from "@codeforge/database";
import { createApp } from "../../app.js";

const app = createApp();

const testUser = {
  email: `test-interviews-${Date.now()}@example.local`,
  username: `testint${Date.now()}`.slice(0, 20),
  password: "SuperSecreta123",
  displayName: "Test Interviews",
};

let accessToken: string;

beforeAll(async () => {
  await prisma.user.deleteMany({ where: { email: testUser.email } });
  const res = await request(app).post("/api/v1/auth/register").send(testUser);
  accessToken = res.body.accessToken;
});

afterAll(async () => {
  await prisma.user.deleteMany({ where: { email: testUser.email } });
});

function auth(req: request.Test) {
  return req.set("Authorization", `Bearer ${accessToken}`);
}

describe("GET /api/v1/interviews", () => {
  it("lista las plantillas de entrevista, filtrables por categoría", async () => {
    const res = await request(app).get("/api/v1/interviews?category=BEHAVIORAL");
    expect(res.status).toBe(200);
    expect(res.body.items.length).toBeGreaterThan(0);
    expect(
      res.body.items.every((i: { category: string }) => i.category === "BEHAVIORAL"),
    ).toBe(true);
  });

  it("incluye las 6 categorías (Technical/Behavioral/Frontend/Backend/Full Stack/IT Support)", async () => {
    const categories = [
      "TECHNICAL",
      "BEHAVIORAL",
      "FRONTEND",
      "BACKEND",
      "FULL_STACK",
      "IT_SUPPORT",
    ];
    for (const category of categories) {
      const res = await request(app).get(`/api/v1/interviews?category=${category}`);
      expect(res.body.items.length).toBeGreaterThan(0);
    }
  });
});

describe("GET /api/v1/interviews/:slug — nunca filtra expectedAnswer/concepts", () => {
  it("el detalle no incluye expectedAnswer ni concepts en las preguntas", async () => {
    const res = await request(app).get("/api/v1/interviews/entrevista-tecnica-general");
    expect(res.status).toBe(200);
    expect(res.body.interview.questions.length).toBe(4);
    expect(res.body.interview.questions[0].expectedAnswer).toBeUndefined();
    expect(res.body.interview.questions[0].concepts).toBeUndefined();
    expect(res.body.interview.questions[0].prompt).toBeTypeOf("string");
  });
});

describe("Simulación de entrevista completa: start -> answer x N -> scores + XP", () => {
  it("otorga feedback por pregunta, cierra el intento en la última y otorga XP una sola vez", async () => {
    const detail = await request(app).get(
      "/api/v1/interviews/entrevista-tecnica-general",
    );
    const interviewId = detail.body.interview.id;
    const questions = detail.body.interview.questions;

    const start = await auth(
      request(app).post(`/api/v1/interviews/${interviewId}/start`),
    ).send();
    expect(start.status).toBe(200);
    const attemptId = start.body.attemptId;
    expect(start.body.questions.length).toBe(questions.length);

    // Reiniciar la misma entrevista mientras el intento sigue abierto debe
    // reutilizar el mismo attemptId (idempotente), no crear uno nuevo.
    const startAgain = await auth(
      request(app).post(`/api/v1/interviews/${interviewId}/start`),
    ).send();
    expect(startAgain.body.attemptId).toBe(attemptId);

    let lastRes;
    for (const q of questions) {
      lastRes = await auth(
        request(app).post(`/api/v1/interviews/${interviewId}/answer`),
      ).send({
        attemptId,
        questionId: q.id,
        answerText:
          "Esta es una respuesta real y razonada, con varias frases, que explica el concepto con mis propias palabras. Por lo tanto, cubro varios aspectos relevantes de la pregunta.",
        timeSpentSeconds: 60,
      });
      expect(lastRes.status).toBe(200);
      expect(lastRes.body.feedback.expectedAnswer).toBeTypeOf("string");
    }

    expect(lastRes?.body.isLastQuestion).toBe(true);
    expect(lastRes?.body.attemptFinished).toBe(true);
    expect(lastRes?.body.scores.overallScore).toBeGreaterThan(0);
    expect(lastRes?.body.xpAwarded).toBe(300);
    expect(lastRes?.body.alreadyAwarded).toBe(false);

    // Repetir la respuesta a la última pregunta del mismo intento ya
    // finalizado no debe otorgar XP de nuevo.
    const lastQuestion = questions[questions.length - 1];
    const repeat = await auth(
      request(app).post(`/api/v1/interviews/${interviewId}/answer`),
    ).send({
      attemptId,
      questionId: lastQuestion.id,
      answerText: "Otra respuesta distinta que no debería cambiar nada ya finalizado.",
      timeSpentSeconds: 10,
    });
    expect(repeat.status).toBe(409);
  });

  it("requiere autenticación para empezar o responder", async () => {
    const detail = await request(app).get("/api/v1/interviews/entrevista-backend");
    const interviewId = detail.body.interview.id;
    const res = await request(app).post(`/api/v1/interviews/${interviewId}/start`).send();
    expect(res.status).toBe(401);
  });
});

describe("GET /api/v1/interviews/attempts/me y /attempts/:attemptId", () => {
  it("lista el historial del usuario y expone el detalle con feedback por pregunta", async () => {
    const list = await auth(request(app).get("/api/v1/interviews/attempts/me"));
    expect(list.status).toBe(200);
    expect(list.body.items.length).toBeGreaterThan(0);

    const attemptId = list.body.items[0].id;
    const detail = await auth(
      request(app).get(`/api/v1/interviews/attempts/${attemptId}`),
    );
    expect(detail.status).toBe(200);
    expect(detail.body.attempt.answers.length).toBeGreaterThan(0);
    expect(detail.body.attempt.answers[0].expectedAnswer).toBeTypeOf("string");
  });

  it("no permite ver el intento de otro usuario", async () => {
    const other = {
      email: `test-interviews-2-${Date.now()}@example.local`,
      username: `testint2${Date.now()}`.slice(0, 20),
      password: "SuperSecreta123",
      displayName: "Test Interviews 2",
    };
    await prisma.user.deleteMany({ where: { email: other.email } });
    const otherRes = await request(app).post("/api/v1/auth/register").send(other);
    const otherToken = otherRes.body.accessToken;

    const list = await auth(request(app).get("/api/v1/interviews/attempts/me"));
    const attemptId = list.body.items[0].id;

    const res = await request(app)
      .get(`/api/v1/interviews/attempts/${attemptId}`)
      .set("Authorization", `Bearer ${otherToken}`);
    expect(res.status).toBe(403);

    await prisma.user.deleteMany({ where: { email: other.email } });
  });
});
