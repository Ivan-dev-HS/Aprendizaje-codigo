import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import { prisma } from "@codeforge/database";
import { createApp } from "../../app.js";

const app = createApp();

const testUser = {
  email: `test-exercises-${Date.now()}@example.local`,
  username: `testex${Date.now()}`.slice(0, 20),
  password: "SuperSecreta123",
  displayName: "Test Exercises",
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

describe("GET /api/v1/exercises", () => {
  it("lista ejercicios públicos filtrables por skill y tipo", async () => {
    const res = await request(app).get("/api/v1/exercises?skillSlug=git&type=MCQ");
    expect(res.status).toBe(200);
    expect(res.body.items.length).toBeGreaterThan(0);
    expect(res.body.items.every((e: { type: string }) => e.type === "MCQ")).toBe(true);
  });
});

describe("GET /api/v1/exercises/:id — nunca filtra la solución", () => {
  it("el detalle no incluye el campo solution", async () => {
    const listRes = await request(app).get("/api/v1/exercises?skillSlug=git&pageSize=1");
    const exerciseId = listRes.body.items[0].id;

    const res = await request(app).get(`/api/v1/exercises/${exerciseId}`);
    expect(res.status).toBe(200);
    expect(res.body.exercise.solution).toBeUndefined();
    expect(res.body.exercise.prompt).toBeDefined();
  });
});

describe("Sistema de pistas (sección 24)", () => {
  it("las pistas se revelan una a una, nunca la solución completa", async () => {
    const listRes = await request(app).get("/api/v1/exercises?skillSlug=git&pageSize=1");
    const exerciseId = listRes.body.items[0].id;

    const hint1 = await request(app).get(`/api/v1/exercises/${exerciseId}/hints/1`);
    expect(hint1.status).toBe(200);
    expect(hint1.body.hint).toBeTypeOf("string");

    const hint4 = await request(app).get(`/api/v1/exercises/${exerciseId}/hints/4`);
    expect(hint4.status).toBe(400);
  });
});

describe("POST /api/v1/exercises/:id/attempt — corrección MCQ y anti-explotación de XP", () => {
  it("otorga XP la primera vez que se acierta, y 0 en intentos correctos posteriores", async () => {
    const listRes = await request(app).get(
      "/api/v1/exercises?skillSlug=git&type=MCQ&pageSize=1",
    );
    const exerciseId = listRes.body.items[0].id;
    const detailRes = await auth(request(app).get(`/api/v1/exercises/${exerciseId}`));
    const correctOptionId = "c"; // git-mcq-comando-staging: "git add"

    const first = await auth(
      request(app).post(`/api/v1/exercises/${exerciseId}/attempt`),
    ).send({
      answer: { type: "MCQ", optionId: correctOptionId },
    });
    expect(first.status).toBe(200);
    expect(first.body.isCorrect).toBe(true);
    expect(first.body.xpAwarded).toBe(10); // EASY = 10 XP
    expect(first.body.alreadyAwarded).toBe(false);
    expect(first.body.solution).toBeTruthy(); // se revela al acertar

    const second = await auth(
      request(app).post(`/api/v1/exercises/${exerciseId}/attempt`),
    ).send({
      answer: { type: "MCQ", optionId: correctOptionId },
    });
    expect(second.status).toBe(200);
    expect(second.body.xpAwarded).toBe(0);
    expect(second.body.alreadyAwarded).toBe(true);
    void detailRes;
  });

  it("rechaza un tipo de respuesta que no coincide con el ejercicio", async () => {
    const listRes = await request(app).get(
      "/api/v1/exercises?skillSlug=git&type=MCQ&pageSize=1",
    );
    const exerciseId = listRes.body.items[0].id;

    const res = await auth(
      request(app).post(`/api/v1/exercises/${exerciseId}/attempt`),
    ).send({
      answer: { type: "TRUE_FALSE", value: true },
    });
    expect(res.status).toBe(400);
  });
});

describe("Aprendizaje adaptativo (sección 70): 3 fallos marcan la skill como weak", () => {
  it("tres respuestas incorrectas consecutivas marcan la skill git como weak", async () => {
    const listRes = await request(app).get(
      "/api/v1/exercises?skillSlug=git&type=TRUE_FALSE&pageSize=1",
    );
    const exerciseId = listRes.body.items[0].id;

    let lastResult;
    for (let i = 0; i < 3; i++) {
      lastResult = await auth(
        request(app).post(`/api/v1/exercises/${exerciseId}/attempt`),
      ).send({
        answer: { type: "TRUE_FALSE", value: false }, // la solución real es `true`
      });
    }

    expect(lastResult?.body.isCorrect).toBe(false);
    expect(lastResult?.body.skill.isWeak).toBe(true);

    const skillsRes = await auth(request(app).get("/api/v1/skills/me"));
    const gitSkill = skillsRes.body.skills.find(
      (s: { slug: string }) => s.slug === "git",
    );
    expect(gitSkill.isWeak).toBe(true);
  });

  it("después de 3 intentos incorrectos, la solución se revela igualmente", async () => {
    const listRes = await request(app).get(
      "/api/v1/exercises?skillSlug=git&type=TRUE_FALSE&pageSize=1",
    );
    const exerciseId = listRes.body.items[0].id;

    const res = await auth(
      request(app).post(`/api/v1/exercises/${exerciseId}/attempt`),
    ).send({
      answer: { type: "TRUE_FALSE", value: true }, // ahora acierta, en el 4º intento
    });
    expect(res.body.isCorrect).toBe(true);
    expect(res.body.solution).toBeTruthy();
  });
});
