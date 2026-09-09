import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import { prisma } from "@codeforge/database";
import { createApp } from "../../app.js";

const app = createApp();

const testUser = {
  email: `test-cases-${Date.now()}@example.local`,
  username: `testcase${Date.now()}`.slice(0, 20),
  password: "SuperSecreta123",
  displayName: "Test Cases",
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

describe("GET /api/v1/cases", () => {
  it("lista casos publicados filtrables por kind y domain", async () => {
    const res = await request(app).get("/api/v1/cases?kind=DEBUGGING&domain=GIT");
    expect(res.status).toBe(200);
    expect(res.body.items.length).toBeGreaterThan(0);
    expect(
      res.body.items.every(
        (c: { kind: string; domain: string }) =>
          c.kind === "DEBUGGING" && c.domain === "GIT",
      ),
    ).toBe(true);
  });

  it("incluye los 4 tipos de casos (Debugging/IT Support/Networking/Producción)", async () => {
    const kinds = ["DEBUGGING", "IT_SUPPORT", "NETWORKING", "PRODUCTION_INCIDENT"];
    for (const kind of kinds) {
      const res = await request(app).get(`/api/v1/cases?kind=${kind}`);
      expect(res.body.items.length).toBeGreaterThan(0);
    }
  });
});

describe("GET /api/v1/cases/:id — nunca filtra la opción correcta", () => {
  it("el detalle no incluye el campo solution", async () => {
    const listRes = await request(app).get(
      "/api/v1/cases?kind=DEBUGGING&domain=GIT&pageSize=1",
    );
    const caseId = listRes.body.items[0].id;

    const res = await request(app).get(`/api/v1/cases/${caseId}`);
    expect(res.status).toBe(200);
    expect(res.body.case.solution).toBeUndefined();
    expect(res.body.case.options.length).toBeGreaterThan(1);
    expect(res.body.case.requiresPostmortem).toBe(false);
  });

  it("un caso PRODUCTION_INCIDENT marca requiresPostmortem", async () => {
    const listRes = await request(app).get(
      "/api/v1/cases?kind=PRODUCTION_INCIDENT&pageSize=1",
    );
    const caseId = listRes.body.items[0].id;
    const res = await request(app).get(`/api/v1/cases/${caseId}`);
    expect(res.body.case.requiresPostmortem).toBe(true);
  });
});

describe("Sistema de pistas", () => {
  it("las pistas se revelan una a una, nunca la solución completa", async () => {
    const listRes = await request(app).get(
      "/api/v1/cases?kind=DEBUGGING&domain=GIT&pageSize=1",
    );
    const caseId = listRes.body.items[0].id;

    const hint1 = await request(app).get(`/api/v1/cases/${caseId}/hints/1`);
    expect(hint1.status).toBe(200);
    expect(hint1.body.hint).toBeTypeOf("string");

    const hint4 = await request(app).get(`/api/v1/cases/${caseId}/hints/4`);
    expect(hint4.status).toBe(400);
  });
});

describe("POST /api/v1/cases/:id/attempt — diagnóstico de opción múltiple y XP anti-explotación", () => {
  it("otorga XP la primera vez que se acierta, y 0 en intentos correctos posteriores", async () => {
    const listRes = await request(app).get(
      "/api/v1/cases?kind=DEBUGGING&domain=GIT&pageSize=1",
    );
    const caseId = listRes.body.items[0].id;
    const correctOptionId = "a"; // debug-git-cambios-no-visibles: la opción "a" es correcta

    const first = await auth(request(app).post(`/api/v1/cases/${caseId}/attempt`)).send({
      optionId: correctOptionId,
    });
    expect(first.status).toBe(200);
    expect(first.body.isCorrect).toBe(true);
    expect(first.body.xpAwarded).toBe(15);
    expect(first.body.alreadyAwarded).toBe(false);
    expect(first.body.correctOptionId).toBe("a");

    const second = await auth(request(app).post(`/api/v1/cases/${caseId}/attempt`)).send({
      optionId: correctOptionId,
    });
    expect(second.status).toBe(200);
    expect(second.body.xpAwarded).toBe(0);
    expect(second.body.alreadyAwarded).toBe(true);
  });

  it("un diagnóstico incorrecto no otorga XP y no revela la solución de inmediato", async () => {
    const listRes = await request(app).get(
      "/api/v1/cases?kind=DEBUGGING&domain=CSS&pageSize=1",
    );
    const caseId = listRes.body.items[0].id;

    const res = await auth(request(app).post(`/api/v1/cases/${caseId}/attempt`)).send({
      optionId: "b", // la opción correcta de ese caso es "a"
    });
    expect(res.status).toBe(200);
    expect(res.body.isCorrect).toBe(false);
    expect(res.body.xpAwarded).toBe(0);
    expect(res.body.correctOptionId).toBeNull();
  });

  it("un caso de producción acepta un postmortem junto al diagnóstico", async () => {
    const listRes = await request(app).get(
      "/api/v1/cases?kind=PRODUCTION_INCIDENT&pageSize=1",
    );
    const caseId = listRes.body.items[0].id;

    const res = await auth(request(app).post(`/api/v1/cases/${caseId}/attempt`)).send({
      optionId: "a",
      postmortem: {
        whatHappened: "La API dejó de conectar a la base de datos en producción.",
        rootCause: "Faltaba la variable de entorno DATABASE_URL.",
        impact: "Todas las peticiones que tocaban la base de datos fallaron.",
        timeline: "Detectado a los 5 minutos del despliegue.",
        fix: "Se configuró la variable de entorno en el proveedor de hosting.",
        prevention:
          "Añadir una validación de arranque que falle rápido si faltan variables.",
      },
    });
    expect(res.status).toBe(200);
  });

  it("requiere autenticación", async () => {
    const listRes = await request(app).get("/api/v1/cases?pageSize=1");
    const caseId = listRes.body.items[0].id;
    const res = await request(app)
      .post(`/api/v1/cases/${caseId}/attempt`)
      .send({ optionId: "a" });
    expect(res.status).toBe(401);
  });
});
