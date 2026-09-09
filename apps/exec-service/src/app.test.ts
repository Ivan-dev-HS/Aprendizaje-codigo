import { describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "./app.js";
import { env } from "./config/env.js";

const app = createApp();

describe("GET /health", () => {
  it("responde 200 sin requerir el token interno", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
  });
});

describe("rutas desconocidas", () => {
  it("responde 404 con el formato de error estándar", async () => {
    const res = await request(app).get("/no-existe");
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("NOT_FOUND");
  });
});

describe("/exec requiere el token interno (nunca se expone públicamente)", () => {
  it("rechaza sin token", async () => {
    const res = await request(app).post("/exec/js").send({ code: "1+1" });
    expect(res.status).toBe(401);
  });

  it("rechaza con un token incorrecto", async () => {
    const res = await request(app)
      .post("/exec/js")
      .set("x-internal-token", "token-incorrecto")
      .send({ code: "1+1" });
    expect(res.status).toBe(401);
  });

  it("acepta con el token correcto y ejecuta el código", async () => {
    const res = await request(app)
      .post("/exec/js")
      .set("x-internal-token", env.EXEC_SERVICE_INTERNAL_TOKEN)
      .send({ code: 'console.log("ok")' });
    expect(res.status).toBe(200);
    expect(res.body.outputs).toEqual(["ok"]);
  });
});
