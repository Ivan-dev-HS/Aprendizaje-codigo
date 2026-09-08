import { describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "../../app.js";

describe("GET /api/v1/health", () => {
  it("responde 200 y confirma que la base de datos está arriba", async () => {
    const app = createApp();
    const res = await request(app).get("/api/v1/health");

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
    expect(res.body.database).toBe("up");
  });

  it("no requiere autenticación", async () => {
    const app = createApp();
    const res = await request(app).get("/api/v1/health");
    expect(res.status).not.toBe(401);
  });
});
