import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import { prisma } from "@codeforge/database";
import { createApp } from "../../app.js";

const app = createApp();

const testUser = {
  email: `test-gamification-${Date.now()}@example.local`,
  username: `testgam${Date.now()}`.slice(0, 20),
  password: "SuperSecreta123",
  displayName: "Test Gamification",
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

describe("Completar una lección desbloquea logros y avanza misiones", () => {
  it("otorga el logro 'Primer paso', avanza la misión diaria de lecciones y notifica", async () => {
    const courseRes = await auth(request(app).get("/api/v1/courses/html"));
    const lessonId = courseRes.body.course.modules[0].lessons[0].id;

    const completeRes = await auth(
      request(app).post(`/api/v1/lessons/${lessonId}/complete`),
    );
    expect(completeRes.status).toBe(200);

    const summary = await auth(request(app).get("/api/v1/gamification/me"));
    expect(summary.status).toBe(200);
    expect(summary.body.totalXp).toBeGreaterThanOrEqual(10);

    const firstStep = summary.body.achievements.find(
      (a: { slug: string }) => a.slug === "primer-paso",
    );
    expect(firstStep.isUnlocked).toBe(true);
    expect(summary.body.newlyUnlockedAchievementIds).toContain(firstStep.id);

    const dailyLessonMission = summary.body.missions.find(
      (m: { slug: string }) => m.slug === "diaria-1-leccion",
    );
    expect(dailyLessonMission.progress).toBe(1);
    expect(dailyLessonMission.isCompleted).toBe(true);

    expect(summary.body.readiness.overall).toBeGreaterThanOrEqual(0);
    expect(summary.body.readiness.overall).toBeLessThanOrEqual(100);

    // Reconocer el logro: deja de aparecer como "nuevo" en la siguiente lectura.
    const ack = await auth(
      request(app).post("/api/v1/gamification/achievements/ack"),
    ).send({ achievementIds: [firstStep.id] });
    expect(ack.status).toBe(204);

    const summaryAfterAck = await auth(request(app).get("/api/v1/gamification/me"));
    expect(summaryAfterAck.body.newlyUnlockedAchievementIds).not.toContain(firstStep.id);

    const notifications = await auth(request(app).get("/api/v1/notifications"));
    expect(notifications.status).toBe(200);
    expect(notifications.body.unreadCount).toBeGreaterThan(0);
    const achievementNotification = notifications.body.items.find(
      (n: { type: string }) => n.type === "ACHIEVEMENT",
    );
    expect(achievementNotification).toBeDefined();

    const readRes = await auth(
      request(app).patch(`/api/v1/notifications/${achievementNotification.id}/read`),
    );
    expect(readRes.status).toBe(204);

    const notificationsAfter = await auth(request(app).get("/api/v1/notifications"));
    expect(notificationsAfter.body.unreadCount).toBe(notifications.body.unreadCount - 1);
  });
});

describe("GET /api/v1/search", () => {
  it("encuentra cursos, ejercicios y casos reales por título", async () => {
    const res = await request(app).get("/api/v1/search?q=HTML");
    expect(res.status).toBe(200);
    expect(res.body.items.length).toBeGreaterThan(0);
    expect(res.body.items.some((i: { type: string }) => i.type === "COURSE")).toBe(true);
  });

  it("una query demasiado corta no devuelve resultados", async () => {
    const res = await request(app).get("/api/v1/search?q=a");
    expect(res.status).toBe(200);
    expect(res.body.items).toEqual([]);
  });
});
