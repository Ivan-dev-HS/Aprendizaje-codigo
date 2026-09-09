import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import { prisma } from "@codeforge/database";
import { createApp } from "../../app.js";

const app = createApp();

const testUser = {
  email: `test-labs-${Date.now()}@example.local`,
  username: `testlabs${Date.now()}`.slice(0, 20),
  password: "SuperSecreta123",
  displayName: "Test Labs",
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

describe("Autenticación obligatoria en /labs/*", () => {
  it("rechaza sin token", async () => {
    const res = await request(app).get("/api/v1/labs/terminal");
    expect(res.status).toBe(401);
  });
});

describe("POST /api/v1/labs/js/run — proxy real hacia exec-service", () => {
  it("ejecuta JavaScript y devuelve la salida real de console.log", async () => {
    const res = await auth(request(app).post("/api/v1/labs/js/run")).send({
      code: "console.log(2 + 2);",
    });
    expect(res.status).toBe(200);
    expect(res.body.outputs).toEqual(["4"]);
    expect(res.body.timedOut).toBe(false);
  });

  it("captura errores de sintaxis sin devolver 500", async () => {
    const res = await auth(request(app).post("/api/v1/labs/js/run")).send({
      code: "const x = ;",
    });
    expect(res.status).toBe(200);
    expect(res.body.errors.length).toBeGreaterThan(0);
  });
});

describe("POST /api/v1/labs/sql/run — proxy real hacia exec-service (rol de solo lectura)", () => {
  it("ejecuta un SELECT real contra el dataset de la tienda online", async () => {
    const res = await auth(request(app).post("/api/v1/labs/sql/run")).send({
      sql: "SELECT * FROM sandbox.customers ORDER BY id LIMIT 3",
    });
    expect(res.status).toBe(200);
    expect(res.body.rows.length).toBe(3);
    expect(res.body.columns).toContain("name");
  });

  it("rechaza sentencias que no sean SELECT con 400 (SQL_NOT_ALLOWED)", async () => {
    const res = await auth(request(app).post("/api/v1/labs/sql/run")).send({
      sql: "DELETE FROM sandbox.customers",
    });
    expect(res.status).toBe(400);
  });
});

describe("GET /api/v1/labs/sql/datasets", () => {
  it("incluye el dataset sembrado 'tienda-online'", async () => {
    const res = await auth(request(app).get("/api/v1/labs/sql/datasets"));
    expect(res.status).toBe(200);
    expect(res.body.items.some((d: { slug: string }) => d.slug === "tienda-online")).toBe(
      true,
    );
  });
});

describe("Playground snapshots (HTML/CSS/JS)", () => {
  it("crea, lista, actualiza y borra un snapshot del usuario", async () => {
    const create = await auth(request(app).post("/api/v1/labs/playground")).send({
      title: "Mi primer snapshot",
      html: "<h1>Hola</h1>",
      css: "h1 { color: red; }",
      js: "console.log('hola');",
    });
    expect(create.status).toBe(201);
    const id = create.body.snapshot.id as string;

    const list = await auth(request(app).get("/api/v1/labs/playground"));
    expect(list.status).toBe(200);
    expect(list.body.items.some((s: { id: string }) => s.id === id)).toBe(true);

    const update = await auth(request(app).put(`/api/v1/labs/playground/${id}`)).send({
      title: "Título actualizado",
      html: "<h1>Adiós</h1>",
      css: "",
      js: "",
    });
    expect(update.status).toBe(200);
    expect(update.body.snapshot.title).toBe("Título actualizado");

    const del = await auth(request(app).delete(`/api/v1/labs/playground/${id}`));
    expect(del.status).toBe(204);

    const getAfterDelete = await auth(request(app).get(`/api/v1/labs/playground/${id}`));
    expect(getAfterDelete.status).toBe(404);
  });
});

describe("Terminal Lab — sistema de archivos virtual persistente por usuario", () => {
  it("arranca en /home/user y persiste el historial entre peticiones", async () => {
    const initial = await auth(request(app).get("/api/v1/labs/terminal"));
    expect(initial.status).toBe(200);
    expect(initial.body.cwd).toBe("/home/user");
    expect(initial.body.history).toEqual([]);

    const pwd = await auth(request(app).post("/api/v1/labs/terminal")).send({
      command: "pwd",
    });
    expect(pwd.status).toBe(200);
    expect(pwd.body.history).toHaveLength(1);

    const cd = await auth(request(app).post("/api/v1/labs/terminal")).send({
      command: "cd projects",
    });
    expect(cd.body.cwd).toBe("/home/user/projects");

    const stateAfter = await auth(request(app).get("/api/v1/labs/terminal"));
    expect(stateAfter.body.cwd).toBe("/home/user/projects");
    expect(stateAfter.body.history).toHaveLength(2);
  });
});

describe("Git Lab — grafo de commits simulado persistente por usuario", () => {
  it("init -> add -> commit crea el primer commit en la rama main", async () => {
    const init = await auth(request(app).post("/api/v1/labs/git")).send({
      command: "git init",
    });
    expect(init.status).toBe(200);
    expect(init.body.branches).toEqual({});

    const add = await auth(request(app).post("/api/v1/labs/git")).send({
      command: "git add index.html",
    });
    expect(add.body.staged).toEqual(["index.html"]);

    const commit = await auth(request(app).post("/api/v1/labs/git")).send({
      command: 'git commit -m "primer commit"',
    });
    expect(commit.status).toBe(200);
    expect(commit.body.commits).toHaveLength(1);
    expect(commit.body.staged).toEqual([]);

    const state = await auth(request(app).get("/api/v1/labs/git"));
    expect(state.body.commits).toHaveLength(1);
    expect(state.body.branches.main).toBe(commit.body.commits[0].id);
  });
});
