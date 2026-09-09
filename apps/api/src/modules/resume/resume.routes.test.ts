import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import { prisma } from "@codeforge/database";
import { createApp } from "../../app.js";

const app = createApp();

const testUser = {
  email: `test-resume-${Date.now()}@example.local`,
  username: `testcv${Date.now()}`.slice(0, 20),
  password: "SuperSecreta123",
  displayName: "Test Resume",
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

describe("CV builder", () => {
  it("rechaza sin autenticación", async () => {
    const res = await request(app).get("/api/v1/resume/me");
    expect(res.status).toBe(401);
  });

  it("GET /resume/me arranca vacío pero con datos reales del perfil", async () => {
    const res = await auth(request(app).get("/api/v1/resume/me"));
    expect(res.status).toBe(200);
    expect(res.body.resume.experience).toEqual([]);
    expect(res.body.resume.displayName).toBe(testUser.displayName);
  });

  it("PATCH /resume/me guarda resumen/experiencia/educación/enlaces y persiste", async () => {
    const update = await auth(request(app).patch("/api/v1/resume/me")).send({
      summary: "Desarrolladora en formación, enfocada en frontend.",
      experience: [
        {
          company: "Freelance",
          role: "Desarrolladora web",
          startDate: "2025-01",
          endDate: null,
          description: "Sitios web para pequeños negocios locales.",
        },
      ],
      education: [
        {
          institution: "CodeForge",
          degree: "Ruta Frontend Developer",
          startDate: "2026-01",
          endDate: null,
        },
      ],
      links: [{ label: "GitHub", url: "https://github.com/test" }],
    });
    expect(update.status).toBe(200);
    expect(update.body.resume.summary).toContain("frontend");
    expect(update.body.resume.experience).toHaveLength(1);

    const reread = await auth(request(app).get("/api/v1/resume/me"));
    expect(reread.body.resume.education[0].institution).toBe("CodeForge");
    expect(reread.body.resume.links[0].url).toBe("https://github.com/test");
  });
});
