import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import { prisma } from "@codeforge/database";
import { createApp } from "../../app.js";

const app = createApp();

const testUser = {
  email: `test-projects-${Date.now()}@example.local`,
  username: `testproj${Date.now()}`.slice(0, 20),
  password: "SuperSecreta123",
  displayName: "Test Projects",
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

describe("GET /api/v1/projects", () => {
  it("lista el catálogo público de proyectos", async () => {
    const res = await request(app).get("/api/v1/projects");
    expect(res.status).toBe(200);
    expect(res.body.items.length).toBeGreaterThanOrEqual(3);
    expect(
      res.body.items.some((p: { slug: string }) => p.slug === "lista-de-tareas"),
    ).toBe(true);
  });
});

describe("GET /api/v1/projects/:slug — nunca deja ver requirements/tasks a medias", () => {
  it("devuelve el detalle completo con status NOT_STARTED cuando no hay sesión", async () => {
    const res = await request(app).get("/api/v1/projects/lista-de-tareas");
    expect(res.status).toBe(200);
    expect(res.body.project.status).toBe("NOT_STARTED");
    expect(res.body.project.tasks.length).toBeGreaterThan(0);
    expect(res.body.project.userProject).toBeNull();
  });
});

describe("Ciclo de vida de un proyecto: start -> completar tareas -> completar proyecto y otorgar XP", () => {
  it("completar todas las tareas marca el proyecto como COMPLETED y otorga XP una sola vez", async () => {
    const detailRes = await request(app).get("/api/v1/projects/portfolio-personal");
    const projectId = detailRes.body.project.id as string;
    const taskIds = detailRes.body.project.tasks.map(
      (t: { id: string }) => t.id,
    ) as string[];

    const start = await auth(request(app).post(`/api/v1/projects/${projectId}/start`));
    expect(start.status).toBe(200);

    const afterStartDetail = await auth(
      request(app).get("/api/v1/projects/portfolio-personal"),
    );
    expect(afterStartDetail.body.project.status).toBe("IN_PROGRESS");

    let lastResult;
    for (const taskId of taskIds) {
      lastResult = await auth(
        request(app).post(`/api/v1/projects/${projectId}/tasks/${taskId}/complete`),
      );
      expect(lastResult.status).toBe(200);
    }

    expect(lastResult?.body.projectCompleted).toBe(true);
    expect(lastResult?.body.xpAwarded).toBeGreaterThan(0);

    const finalDetail = await auth(
      request(app).get("/api/v1/projects/portfolio-personal"),
    );
    expect(finalDetail.body.project.status).toBe("COMPLETED");
    expect(finalDetail.body.project.completedTaskCount).toBe(taskIds.length);
  });

  it("actualizar los metadatos (githubUrl/demoUrl/technologies) del proyecto del usuario", async () => {
    const detailRes = await request(app).get("/api/v1/projects/portfolio-personal");
    const projectId = detailRes.body.project.id as string;

    const update = await auth(request(app).patch(`/api/v1/projects/${projectId}`)).send({
      githubUrl: "https://github.com/test/portfolio",
      demoUrl: "https://test.example.local",
      technologies: ["HTML", "CSS"],
    });
    expect(update.status).toBe(200);
    expect(update.body.userProject.githubUrl).toBe("https://github.com/test/portfolio");
    expect(update.body.userProject.technologies).toEqual(["HTML", "CSS"]);
  });
});
