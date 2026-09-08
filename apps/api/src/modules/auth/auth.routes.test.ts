import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import { prisma } from "@codeforge/database";
import { createApp } from "../../app.js";

const app = createApp();

const testUser = {
  email: `test-auth-${Date.now()}@example.local`,
  username: `testauth${Date.now()}`.slice(0, 20),
  password: "SuperSecreta123",
  displayName: "Test Auth",
};

afterAll(async () => {
  await prisma.user.deleteMany({ where: { email: testUser.email } });
});

describe("POST /api/v1/auth/register", () => {
  it("crea un usuario y devuelve access token + cookie de refresh", async () => {
    const res = await request(app).post("/api/v1/auth/register").send(testUser);

    expect(res.status).toBe(201);
    expect(res.body.user.email).toBe(testUser.email);
    expect(res.body.user.role).toBe("USER");
    expect(res.body.accessToken).toBeTypeOf("string");
    expect(res.headers["set-cookie"]?.[0]).toMatch(/refreshToken=/);
    // Nunca debe filtrar el hash de la contraseña.
    expect(res.body.user.passwordHash).toBeUndefined();
  });

  it("rechaza un registro duplicado con 409", async () => {
    const res = await request(app).post("/api/v1/auth/register").send(testUser);
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe("CONFLICT");
  });

  it("rechaza datos inválidos con 400 y detalles por campo", async () => {
    const res = await request(app)
      .post("/api/v1/auth/register")
      .send({ email: "no-es-un-email", username: "a", password: "123", displayName: "" });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
    expect(res.body.error.details).toBeDefined();
  });
});

describe("POST /api/v1/auth/login", () => {
  it("inicia sesión con credenciales correctas", async () => {
    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: testUser.email, password: testUser.password });
    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBeTypeOf("string");
  });

  it("rechaza contraseña incorrecta con 401 sin revelar cuál campo falló", async () => {
    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: testUser.email, password: "contraseña-incorrecta" });
    expect(res.status).toBe(401);
  });
});

describe("Flujo de sesión: login -> me -> refresh -> logout", () => {
  it("permite refrescar el access token y revocarlo con logout", async () => {
    const loginRes = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: testUser.email, password: testUser.password });
    const cookie = loginRes.headers["set-cookie"] as unknown as string;
    expect(cookie).toBeDefined();

    const meRes = await request(app)
      .get("/api/v1/users/me")
      .set("Authorization", `Bearer ${loginRes.body.accessToken}`);
    expect(meRes.status).toBe(200);
    expect(meRes.body.user.email).toBe(testUser.email);

    const refreshRes = await request(app)
      .post("/api/v1/auth/refresh")
      .set("Cookie", cookie);
    expect(refreshRes.status).toBe(200);
    expect(refreshRes.body.accessToken).toBeTypeOf("string");
    // Nota: no se compara con el access token anterior — un JWT firmado en el
    // mismo segundo con el mismo payload es idéntico por diseño (determinista);
    // la propiedad de seguridad real bajo prueba es la rotación del refresh
    // token, verificada más abajo (reutilizar la cookie anterior debe fallar).

    // El refresh token anterior ya no debe ser válido (rotación).
    const reuseRes = await request(app)
      .post("/api/v1/auth/refresh")
      .set("Cookie", cookie);
    expect(reuseRes.status).toBe(401);

    const newCookie = refreshRes.headers["set-cookie"] as unknown as string;
    const logoutRes = await request(app)
      .post("/api/v1/auth/logout")
      .set("Cookie", newCookie);
    expect(logoutRes.status).toBe(204);
  });
});

describe("GET /api/v1/users/me sin token", () => {
  it("devuelve 401", async () => {
    const res = await request(app).get("/api/v1/users/me");
    expect(res.status).toBe(401);
  });
});

beforeAll(async () => {
  await prisma.user.deleteMany({ where: { email: testUser.email } });
});
