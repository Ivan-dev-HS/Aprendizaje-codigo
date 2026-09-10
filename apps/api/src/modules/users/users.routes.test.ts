import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import { prisma } from "@codeforge/database";
import { createApp } from "../../app.js";

const app = createApp();

const testUser = {
  email: `test-users-${Date.now()}@example.local`,
  username: `testusers${Date.now()}`.slice(0, 20),
  password: "SuperSecreta123",
  displayName: "Test Users",
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

describe("GET/PATCH /api/v1/users/me", () => {
  it("devuelve y actualiza el perfil del usuario autenticado", async () => {
    const me = await auth(request(app).get("/api/v1/users/me"));
    expect(me.status).toBe(200);
    expect(me.body.user.email).toBe(testUser.email);

    const update = await auth(request(app).patch("/api/v1/users/me")).send({
      bio: "Bio de prueba.",
    });
    expect(update.status).toBe(200);
    expect(update.body.user.profile.bio).toBe("Bio de prueba.");
  });
});

describe("DELETE /api/v1/users/me — eliminación de cuenta", () => {
  it("rechaza el borrado con la contraseña incorrecta", async () => {
    const res = await auth(request(app).delete("/api/v1/users/me")).send({
      password: "ContraseñaIncorrecta",
    });
    expect(res.status).toBe(400);

    const stillThere = await prisma.user.findUnique({ where: { email: testUser.email } });
    expect(stillThere).not.toBeNull();
  });

  it("borra la cuenta y reasigna a la cuenta fantasma el contenido compartido que generó (tickets/comentarios)", async () => {
    const user = await prisma.user.findUniqueOrThrow({
      where: { email: testUser.email },
    });

    const sprint = await prisma.sprint.findFirstOrThrow();
    const reportedTicket = await prisma.ticket.create({
      data: {
        code: `DEL-TEST-${Date.now()}`,
        sprintId: sprint.id,
        title: "Ticket reportado por el usuario que se va a borrar",
        description: "Creado por el test de eliminación de cuenta.",
        priority: "LOW",
        type: "CHORE",
        acceptanceCriteria: ["N/A"],
        reporterId: user.id,
      },
    });
    const comment = await prisma.ticketComment.create({
      data: {
        ticketId: reportedTicket.id,
        authorId: user.id,
        body: "Un comentario de prueba.",
      },
    });

    const res = await auth(request(app).delete("/api/v1/users/me")).send({
      password: testUser.password,
    });
    expect(res.status).toBe(204);

    const deletedUser = await prisma.user.findUnique({ where: { id: user.id } });
    expect(deletedUser).toBeNull();

    const ghost = await prisma.user.findUniqueOrThrow({
      where: { email: "cuentas-eliminadas@codeforge.internal" },
    });
    const ticketAfter = await prisma.ticket.findUniqueOrThrow({
      where: { id: reportedTicket.id },
    });
    expect(ticketAfter.reporterId).toBe(ghost.id);
    const commentAfter = await prisma.ticketComment.findUniqueOrThrow({
      where: { id: comment.id },
    });
    expect(commentAfter.authorId).toBe(ghost.id);

    // El ticket de prueba no debe quedar huérfano en el tablero compartido.
    await prisma.ticketComment.delete({ where: { id: comment.id } });
    await prisma.ticket.delete({ where: { id: reportedTicket.id } });
  });
});
