import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import { prisma } from "@codeforge/database";
import { createApp } from "../../app.js";

const app = createApp();

const testUser = {
  email: `test-portfolio-${Date.now()}@example.local`,
  username: `testpf${Date.now()}`.slice(0, 20),
  password: "SuperSecreta123",
  displayName: "Test Portfolio",
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

describe("Portfolio: privado por defecto, publicable por el dueño", () => {
  it("GET /portfolio/me devuelve isPublic=false por defecto y una vista previa real", async () => {
    const res = await auth(request(app).get("/api/v1/portfolio/me"));
    expect(res.status).toBe(200);
    expect(res.body.settings.isPublic).toBe(false);
    expect(res.body.preview.username).toBe(testUser.username);
    expect(res.body.preview.displayName).toBe(testUser.displayName);
  });

  it("GET /portfolio/:username devuelve 404 mientras el portfolio es privado", async () => {
    const res = await request(app).get(`/api/v1/portfolio/${testUser.username}`);
    expect(res.status).toBe(404);
  });

  it("al publicarlo, GET /portfolio/:username lo muestra sin autenticación", async () => {
    const update = await auth(request(app).patch("/api/v1/portfolio/me")).send({
      isPublic: true,
      headline: "Aspirante a desarrolladora frontend",
    });
    expect(update.status).toBe(200);
    expect(update.body.settings.isPublic).toBe(true);

    const publicRes = await request(app).get(`/api/v1/portfolio/${testUser.username}`);
    expect(publicRes.status).toBe(200);
    expect(publicRes.body.portfolio.headline).toBe("Aspirante a desarrolladora frontend");
    expect(publicRes.body.portfolio.username).toBe(testUser.username);
  });

  it("un username inexistente devuelve 404", async () => {
    const res = await request(app).get("/api/v1/portfolio/usuario-que-no-existe-123");
    expect(res.status).toBe(404);
  });
});
