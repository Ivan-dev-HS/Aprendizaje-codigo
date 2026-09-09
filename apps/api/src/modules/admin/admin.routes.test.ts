import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import { prisma } from "@codeforge/database";
import { createApp } from "../../app.js";

const app = createApp();

const adminUser = {
  email: `test-admin-${Date.now()}@example.local`,
  username: `testadmin${Date.now()}`.slice(0, 20),
  password: "SuperSecreta123",
  displayName: "Test Admin",
};
const regularUser = {
  email: `test-regular-${Date.now()}@example.local`,
  username: `testreg${Date.now()}`.slice(0, 20),
  password: "SuperSecreta123",
  displayName: "Test Regular",
};

let adminToken: string;
let regularToken: string;
let regularUserId: string;

beforeAll(async () => {
  await prisma.user.deleteMany({
    where: { email: { in: [adminUser.email, regularUser.email] } },
  });

  const adminRes = await request(app).post("/api/v1/auth/register").send(adminUser);
  await prisma.user.update({
    where: { email: adminUser.email },
    data: { role: "ADMIN" },
  });
  // El access token del registro llevaba role=USER; se vuelve a iniciar
  // sesión para obtener uno con el rol ya promovido a ADMIN.
  const adminLogin = await request(app)
    .post("/api/v1/auth/login")
    .send({ email: adminUser.email, password: adminUser.password });
  adminToken = adminLogin.body.accessToken;

  const regularRes = await request(app).post("/api/v1/auth/register").send(regularUser);
  regularToken = regularRes.body.accessToken;
  regularUserId = regularRes.body.user.id;
  void adminRes;
});

afterAll(async () => {
  const users = await prisma.user.findMany({
    where: { email: { in: [adminUser.email, regularUser.email] } },
    select: { id: true },
  });
  // AuditLog.actorId no tiene onDelete: Cascade (a propósito: es un registro
  // permanente que no debe desaparecer al borrar al usuario que lo generó).
  await prisma.auditLog.deleteMany({
    where: { actorId: { in: users.map((u) => u.id) } },
  });
  await prisma.user.deleteMany({
    where: { email: { in: [adminUser.email, regularUser.email] } },
  });
});

function asAdmin(req: request.Test) {
  return req.set("Authorization", `Bearer ${adminToken}`);
}
function asRegular(req: request.Test) {
  return req.set("Authorization", `Bearer ${regularToken}`);
}

describe("Autorización: /admin/* exige rol ADMIN", () => {
  it("un usuario normal recibe 403", async () => {
    const res = await asRegular(request(app).get("/api/v1/admin/analytics"));
    expect(res.status).toBe(403);
  });

  it("un anónimo recibe 401", async () => {
    const res = await request(app).get("/api/v1/admin/analytics");
    expect(res.status).toBe(401);
  });
});

describe("CRUD genérico de administración (Skill) + AuditLog", () => {
  it("crea, lista (con búsqueda), lee, actualiza y borra, dejando rastro en AuditLog", async () => {
    const slug = `admin-test-skill-${Date.now()}`;
    const create = await asAdmin(request(app).post("/api/v1/admin/skills")).send({
      slug,
      name: "Admin Test Skill",
      description: "Skill creada por el test de administración.",
      category: "testing",
    });
    expect(create.status).toBe(201);
    const skillId = create.body.item.id;

    const list = await asAdmin(
      request(app).get("/api/v1/admin/skills?q=Admin Test Skill"),
    );
    expect(list.status).toBe(200);
    expect(list.body.items.some((s: { id: string }) => s.id === skillId)).toBe(true);

    const detail = await asAdmin(request(app).get(`/api/v1/admin/skills/${skillId}`));
    expect(detail.status).toBe(200);
    expect(detail.body.item.slug).toBe(slug);

    const update = await asAdmin(
      request(app).patch(`/api/v1/admin/skills/${skillId}`),
    ).send({
      description: "Descripción actualizada.",
    });
    expect(update.status).toBe(200);
    expect(update.body.item.description).toBe("Descripción actualizada.");

    const del = await asAdmin(request(app).delete(`/api/v1/admin/skills/${skillId}`));
    expect(del.status).toBe(204);

    const afterDelete = await asAdmin(
      request(app).get(`/api/v1/admin/skills/${skillId}`),
    );
    expect(afterDelete.status).toBe(404);

    const auditLog = await asAdmin(
      request(app).get("/api/v1/admin/audit-log?pageSize=100"),
    );
    expect(auditLog.status).toBe(200);
    const entityEntries = auditLog.body.items.filter(
      (e: { entityId: string }) => e.entityId === skillId,
    );
    expect(entityEntries.map((e: { action: string }) => e.action).sort()).toEqual([
      "CREATE",
      "DELETE",
      "UPDATE",
    ]);
  });
});

describe("CRUD genérico con campos JSON (Achievement)", () => {
  it("acepta y devuelve criteria como JSON arbitrario", async () => {
    const slug = `admin-test-achievement-${Date.now()}`;
    const create = await asAdmin(request(app).post("/api/v1/admin/achievements")).send({
      slug,
      title: "Logro de prueba",
      description: "Creado por el test de administración.",
      icon: "🧪",
      xpReward: 5,
      criteria: { kind: "XP_TOTAL", amount: 999999 },
    });
    expect(create.status).toBe(201);
    expect(create.body.item.criteria).toEqual({ kind: "XP_TOTAL", amount: 999999 });

    await asAdmin(
      request(app).delete(`/api/v1/admin/achievements/${create.body.item.id}`),
    );
  });
});

describe("GET /api/v1/admin/courses — datos reales sembrados", () => {
  it("lista y filtra por búsqueda el catálogo real", async () => {
    const res = await asAdmin(request(app).get("/api/v1/admin/courses?q=HTML"));
    expect(res.status).toBe(200);
    expect(res.body.items.some((c: { slug: string }) => c.slug === "html")).toBe(true);
  });
});

describe("Gestión de usuarios", () => {
  it("lista usuarios y permite cambiar el rol", async () => {
    const list = await asAdmin(
      request(app).get(`/api/v1/admin/users?q=${regularUser.username}`),
    );
    expect(list.status).toBe(200);
    expect(list.body.items.some((u: { id: string }) => u.id === regularUserId)).toBe(
      true,
    );

    const promote = await asAdmin(
      request(app).patch(`/api/v1/admin/users/${regularUserId}/role`),
    ).send({ role: "ADMIN" });
    expect(promote.status).toBe(200);
    expect(promote.body.item.role).toBe("ADMIN");

    const demote = await asAdmin(
      request(app).patch(`/api/v1/admin/users/${regularUserId}/role`),
    ).send({ role: "USER" });
    expect(demote.status).toBe(200);
    expect(demote.body.item.role).toBe("USER");
  });

  it("un admin no puede quitarse su propio rol de administrador", async () => {
    const adminId = (
      await prisma.user.findUniqueOrThrow({ where: { email: adminUser.email } })
    ).id;
    const res = await asAdmin(
      request(app).patch(`/api/v1/admin/users/${adminId}/role`),
    ).send({
      role: "USER",
    });
    expect(res.status).toBe(400);
  });
});

describe("GET /api/v1/admin/analytics", () => {
  it("devuelve métricas agregadas reales", async () => {
    const res = await asAdmin(request(app).get("/api/v1/admin/analytics"));
    expect(res.status).toBe(200);
    expect(res.body.totalUsers).toBeGreaterThan(0);
    expect(res.body.weeklyRetention.definition).toBeTypeOf("string");
    expect(Array.isArray(res.body.popularCourses)).toBe(true);
  });
});

describe("Feature flags", () => {
  it("lista y actualiza una feature flag existente", async () => {
    const list = await asAdmin(request(app).get("/api/v1/admin/feature-flags"));
    expect(list.status).toBe(200);
    const flag = list.body.items.find((f: { key: string }) => f.key === "CERTIFICATES");
    expect(flag).toBeDefined();
    const originalState = flag.isEnabled;

    const update = await asAdmin(
      request(app).patch(`/api/v1/admin/feature-flags/${flag.key}`),
    ).send({ isEnabled: !originalState });
    expect(update.status).toBe(200);
    expect(update.body.item.isEnabled).toBe(!originalState);

    await asAdmin(request(app).patch(`/api/v1/admin/feature-flags/${flag.key}`)).send({
      isEnabled: originalState,
    });
  });
});
