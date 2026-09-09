import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import { prisma } from "@codeforge/database";
import { createApp } from "../../app.js";

const app = createApp();

const testUser = {
  email: `test-tickets-${Date.now()}@example.local`,
  username: `testtix${Date.now()}`.slice(0, 20),
  password: "SuperSecreta123",
  displayName: "Test Tickets",
};
const testUser2 = {
  email: `test-tickets2-${Date.now()}@example.local`,
  username: `testtix2${Date.now()}`.slice(0, 20),
  password: "SuperSecreta123",
  displayName: "Test Tickets 2",
};

let accessToken: string;
let accessToken2: string;
let lifecycleTicketId: string;

beforeAll(async () => {
  await prisma.user.deleteMany({
    where: { email: { in: [testUser.email, testUser2.email] } },
  });
  const res = await request(app).post("/api/v1/auth/register").send(testUser);
  accessToken = res.body.accessToken;
  const res2 = await request(app).post("/api/v1/auth/register").send(testUser2);
  accessToken2 = res2.body.accessToken;

  // Ticket dedicado para el test de ciclo de vida: los tickets sembrados son
  // compartidos entre ejecuciones (sprint board real, sin scoping por
  // usuario), así que reutilizar uno de ellos para un test que muta su
  // status sería frágil entre ejecuciones repetidas.
  const reporter = await prisma.user.findFirstOrThrow({
    where: { email: { endsWith: "@nexora-tech.internal" } },
  });
  const lifecycleTicket = await prisma.ticket.create({
    data: {
      code: `TEST-${Date.now()}`,
      title: "Ticket de prueba para el ciclo de vida",
      description: "Creado por company-simulator.routes.test.ts",
      priority: "LOW",
      type: "CHORE",
      status: "BACKLOG",
      acceptanceCriteria: ["N/A"],
      reporterId: reporter.id,
    },
  });
  lifecycleTicketId = lifecycleTicket.id;
});

afterAll(async () => {
  const users = await prisma.user.findMany({
    where: { email: { in: [testUser.email, testUser2.email] } },
    select: { id: true },
  });
  const userIds = users.map((u) => u.id);
  // Ticket/TicketComment/CodeReview no tienen onDelete: Cascade hacia User
  // (a propósito: borrar un usuario nunca debe borrar el historial
  // compartido del sprint board). Hay que desvincular antes de poder borrar
  // los usuarios de prueba.
  await prisma.ticketComment.deleteMany({ where: { authorId: { in: userIds } } });
  await prisma.codeReview.deleteMany({ where: { reviewerId: { in: userIds } } });
  await prisma.ticket.delete({ where: { id: lifecycleTicketId } }).catch(() => undefined);
  await prisma.ticket.updateMany({
    where: { assigneeId: { in: userIds } },
    data: { assigneeId: null },
  });
  await prisma.standupEntry.deleteMany({ where: { userId: { in: userIds } } });
  await prisma.user.deleteMany({ where: { id: { in: userIds } } });
});

function auth(req: request.Test, token = accessToken) {
  return req.set("Authorization", `Bearer ${token}`);
}

describe("GET /api/v1/sprints/current", () => {
  it("devuelve el sprint activo con el desglose de tickets por status", async () => {
    const res = await request(app).get("/api/v1/sprints/current");
    expect(res.status).toBe(200);
    expect(res.body.sprint.slug).toBe("sprint-12");
    expect(res.body.sprint.totalTickets).toBeGreaterThan(0);
  });
});

describe("GET /api/v1/tickets", () => {
  it("lista los tickets del sprint actual por defecto", async () => {
    const res = await request(app).get("/api/v1/tickets");
    expect(res.status).toBe(200);
    expect(res.body.items.some((t: { code: string }) => t.code === "NEX-101")).toBe(true);
  });

  it("filtra por status", async () => {
    const res = await request(app).get("/api/v1/tickets?status=TODO");
    expect(res.status).toBe(200);
    expect(res.body.items.every((t: { status: string }) => t.status === "TODO")).toBe(
      true,
    );
  });
});

describe("Ciclo de vida de un ticket: autoasignar -> trabajar -> completar y otorgar XP", () => {
  it("solo la persona asignada puede cambiar el status", async () => {
    // Se usa el ticket dedicado del ciclo de vida (siempre BACKLOG/sin
    // asignar en este beforeAll) en vez de tomar el primero de la lista de
    // BACKLOG compartida: los tickets sembrados se agotan con ejecuciones
    // repetidas en local (E2E incluido), y esta petición es rechazada de
    // todos modos, así que no interfiere con el siguiente test.
    const forbidden = await auth(
      request(app).patch(`/api/v1/tickets/${lifecycleTicketId}`),
      accessToken2,
    ).send({ status: "TODO" });
    expect(forbidden.status).toBe(403);
  });

  it("autoasignar, mover a DONE y recibir XP una sola vez", async () => {
    const ticketId = lifecycleTicketId;

    const assign = await auth(request(app).patch(`/api/v1/tickets/${ticketId}`)).send({
      assignToMe: true,
    });
    expect(assign.status).toBe(200);
    expect(assign.body.ticket.assignee.displayName).toBe(testUser.displayName);

    const otherAssign = await auth(
      request(app).patch(`/api/v1/tickets/${ticketId}`),
      accessToken2,
    ).send({ assignToMe: true });
    expect(otherAssign.status).toBe(409);

    const done = await auth(request(app).patch(`/api/v1/tickets/${ticketId}`)).send({
      status: "DONE",
    });
    expect(done.status).toBe(200);
    expect(done.body.xpAwarded).toBe(15); // prioridad LOW

    const doneAgain = await auth(request(app).patch(`/api/v1/tickets/${ticketId}`)).send({
      status: "DONE",
    });
    expect(doneAgain.body.xpAwarded).toBe(0);
  });
});

describe("POST /api/v1/tickets/:id/comments", () => {
  it("cualquier usuario autenticado puede comentar en un ticket", async () => {
    const listRes = await request(app).get("/api/v1/tickets");
    const ticketId = listRes.body.items[0].id;

    const res = await auth(
      request(app).post(`/api/v1/tickets/${ticketId}/comments`),
    ).send({
      body: "He revisado esto, parece un problema de caché del navegador.",
    });
    expect(res.status).toBe(201);
    expect(res.body.comment.author.displayName).toBe(testUser.displayName);

    const detail = await request(app).get(`/api/v1/tickets/${ticketId}`);
    expect(detail.body.ticket.comments.length).toBeGreaterThan(0);
  });
});

describe("POST /api/v1/standups", () => {
  it("guarda la entrada y calcula un communicationScore heurístico", async () => {
    const res = await auth(request(app).post("/api/v1/standups")).send({
      yesterday: "Terminé NEX-103 (actualización de ESLint) y revisé el PR de Marcos.",
      today: "Voy a empezar con NEX-101, el bug de Safari.",
      blockers: "",
    });
    expect(res.status).toBe(201);
    expect(res.body.entry.communicationScore).toBeGreaterThan(0);

    const list = await auth(request(app).get("/api/v1/standups/me"));
    expect(list.body.items.length).toBeGreaterThan(0);
  });
});

describe("Code review de práctica (Pull Requests)", () => {
  it("lista las PRs de práctica y su detalle no revela isRealIssue", async () => {
    const list = await request(app).get("/api/v1/pull-requests");
    expect(list.status).toBe(200);
    expect(list.body.items.length).toBeGreaterThanOrEqual(3);

    const prId = list.body.items[0].id;
    const detail = await request(app).get(`/api/v1/pull-requests/${prId}`);
    expect(detail.status).toBe(200);
    expect(detail.body.pullRequest.candidateIssues[0].isRealIssue).toBeUndefined();
  });

  it("otorga XP proporcional a los issues reales identificados correctamente", async () => {
    const list = await request(app).get("/api/v1/pull-requests");
    const loginPr = list.body.items.find((p: { title: string }) =>
      p.title.includes("login"),
    );
    const detail = await request(app).get(`/api/v1/pull-requests/${loginPr.id}`);
    const allIds = detail.body.pullRequest.candidateIssues.map(
      (i: { id: string }) => i.id,
    );

    // Enviamos TODAS las opciones marcadas: acierta las 3 reales, falla las 2 falsas -> 3/5 = 60
    const res = await auth(
      request(app).post(`/api/v1/pull-requests/${loginPr.id}/review`),
    ).send({
      selectedIssueIds: allIds,
      verdict: "REQUEST_CHANGES",
      summary: "Hay problemas de seguridad importantes en este PR.",
    });
    expect(res.status).toBe(200);
    expect(res.body.score).toBe(60);
    expect(res.body.xpAwarded).toBeGreaterThan(0);

    const second = await auth(
      request(app).post(`/api/v1/pull-requests/${loginPr.id}/review`),
    ).send({ selectedIssueIds: [], verdict: "APPROVE" });
    expect(second.body.xpAwarded).toBe(0);
    expect(second.body.alreadyAwarded).toBe(true);
  });
});
