import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import { prisma } from "@codeforge/database";
import { createApp } from "../../app.js";

const app = createApp();

const testUser = {
  email: `test-courses-${Date.now()}@example.local`,
  username: `testcourses${Date.now()}`.slice(0, 20),
  password: "SuperSecreta123",
  displayName: "Test Courses",
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

describe("GET /api/v1/courses", () => {
  it("lista el catálogo público sin autenticación", async () => {
    const res = await request(app).get("/api/v1/courses");
    expect(res.status).toBe(200);
    expect(res.body.courses.length).toBeGreaterThanOrEqual(18);
    const html = res.body.courses.find((c: { slug: string }) => c.slug === "html");
    expect(html.lessonCount).toBeGreaterThan(0);
  });
});

describe("GET /api/v1/courses/:slug y bloqueo de módulos", () => {
  it("el primer módulo de HTML está desbloqueado, el segundo bloqueado hasta completarlo", async () => {
    const res = await auth(request(app).get("/api/v1/courses/html"));
    expect(res.status).toBe(200);
    const [firstModule, secondModule] = res.body.course.modules;
    expect(firstModule.isLocked).toBe(false);
    expect(secondModule.isLocked).toBe(true);
  });

  it("no se puede acceder a una lección de un módulo bloqueado", async () => {
    const courseRes = await auth(request(app).get("/api/v1/courses/html"));
    const lockedLessonId = courseRes.body.course.modules[1].lessons[0].id;

    const res = await auth(request(app).get(`/api/v1/lessons/${lockedLessonId}`));
    expect(res.status).toBe(403);
  });

  it("completar todas las lecciones del primer módulo desbloquea el segundo", async () => {
    const courseRes = await auth(request(app).get("/api/v1/courses/html"));
    const firstModuleLessons = courseRes.body.course.modules[0].lessons;

    for (const lesson of firstModuleLessons) {
      const res = await auth(request(app).post(`/api/v1/lessons/${lesson.id}/complete`));
      expect(res.status).toBe(200);
      expect(res.body.xpAwarded).toBe(10);
    }

    const afterRes = await auth(request(app).get("/api/v1/courses/html"));
    expect(afterRes.body.course.modules[1].isLocked).toBe(false);
  });

  it("completar la misma lección dos veces no otorga XP de nuevo (anti-explotación, sección 42)", async () => {
    const courseRes = await auth(request(app).get("/api/v1/courses/html"));
    const lessonId = courseRes.body.course.modules[0].lessons[0].id;

    const res = await auth(request(app).post(`/api/v1/lessons/${lessonId}/complete`));
    expect(res.status).toBe(200);
    expect(res.body.xpAwarded).toBe(0);
    expect(res.body.alreadyCompleted).toBe(true);
  });
});

describe("GET /api/v1/learning-paths/me", () => {
  it("devuelve el roadmap generado en el onboarding", async () => {
    // Completa el onboarding para este usuario antes de pedir su roadmap.
    const quizRes = await request(app).get("/api/v1/onboarding/quiz");
    const answers = quizRes.body.questions.map((q: { id: string }) => ({
      questionId: q.id,
      optionId: "a",
    }));
    await auth(request(app).post("/api/v1/onboarding")).send({
      experienceLevel: "NONE",
      goal: "FRONTEND",
      assessmentAnswers: answers,
    });

    const res = await auth(request(app).get("/api/v1/learning-paths/me"));
    expect(res.status).toBe(200);
    expect(res.body.learningPath.goal).toBe("FRONTEND");
    expect(res.body.learningPath.items.length).toBeGreaterThan(0);
    const html = res.body.learningPath.items.find(
      (i: { courseSlug: string }) => i.courseSlug === "html",
    );
    // Ya completamos 3 lecciones de HTML en el test anterior.
    expect(html.completedLessonCount).toBeGreaterThan(0);
  });
});
