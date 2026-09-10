import { randomUUID } from "node:crypto";
import bcrypt from "bcryptjs";
import type { UpdateProfileInput } from "@codeforge/validators";
import { prisma } from "@codeforge/database";
import { HttpError } from "../../lib/http-error.js";
import { toAuthUser } from "./user.mapper.js";

const GHOST_USER_EMAIL = "cuentas-eliminadas@codeforge.internal";

/**
 * La mayoría de las tablas de un usuario tienen `onDelete: Cascade` (Profile,
 * XpEvent, intentos, progreso...) y desaparecen limpiamente al borrar el
 * usuario. Pero el contenido que un usuario generó *dentro del espacio
 * compartido* de Nexora Tech (tickets reportados, comentarios, PRs, code
 * reviews) y las filas de AuditLog no tienen cascade a propósito — el
 * sprint board y el historial de auditoría son registros permanentes que no
 * deben desaparecer ni romperse porque su autor borró su cuenta. Antes de
 * borrar de verdad al usuario, esas filas se reasignan a una cuenta
 * "fantasma" estable (nunca inicia sesión: password hash inutilizable, igual
 * patrón que los compañeros NPC de Nexora Tech en `seed/company.ts`).
 */
async function findOrCreateGhostUser(): Promise<string> {
  const existing = await prisma.user.findUnique({ where: { email: GHOST_USER_EMAIL } });
  if (existing) return existing.id;

  // `upsert` (no `findThenCreate`) para que dos borrados de cuenta
  // concurrentes que compitan por crear la cuenta fantasma no choquen contra
  // la restricción única del email.
  const passwordHash = await bcrypt.hash(`unusable-${randomUUID()}`, 12);
  const ghost = await prisma.user.upsert({
    where: { email: GHOST_USER_EMAIL },
    update: {},
    create: {
      email: GHOST_USER_EMAIL,
      username: "cuenta-eliminada",
      passwordHash,
      profile: { create: { displayName: "Cuenta eliminada" } },
    },
  });
  return ghost.id;
}

export const usersService = {
  async getById(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });
    if (!user) throw HttpError.notFound("Usuario no encontrado.");
    return toAuthUser(user);
  },

  async updateProfile(userId: string, input: UpdateProfileInput) {
    await prisma.profile.update({
      where: { userId },
      data: {
        ...(input.displayName !== undefined ? { displayName: input.displayName } : {}),
        ...(input.bio !== undefined ? { bio: input.bio } : {}),
        ...(input.avatarUrl !== undefined ? { avatarUrl: input.avatarUrl || null } : {}),
      },
    });
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });
    if (!user) throw HttpError.notFound("Usuario no encontrado.");
    return toAuthUser(user);
  },

  async deleteAccount(userId: string, password: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw HttpError.notFound("Usuario no encontrado.");

    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      throw HttpError.badRequest("La contraseña no es correcta.");
    }

    const ghostId = await findOrCreateGhostUser();

    await prisma.$transaction([
      prisma.ticket.updateMany({
        where: { reporterId: userId },
        data: { reporterId: ghostId },
      }),
      prisma.ticket.updateMany({
        where: { assigneeId: userId },
        data: { assigneeId: null },
      }),
      prisma.ticketComment.updateMany({
        where: { authorId: userId },
        data: { authorId: ghostId },
      }),
      prisma.pullRequest.updateMany({
        where: { authorId: userId },
        data: { authorId: ghostId },
      }),
      prisma.codeReview.updateMany({
        where: { reviewerId: userId },
        data: { reviewerId: ghostId },
      }),
      prisma.auditLog.updateMany({
        where: { actorId: userId },
        data: { actorId: ghostId },
      }),
      prisma.user.delete({ where: { id: userId } }),
    ]);
  },
};
