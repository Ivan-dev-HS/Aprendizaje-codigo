import { prisma, type Role } from "@codeforge/database";
import { HttpError } from "../../lib/http-error.js";

export interface AdminUserFilters {
  q?: string;
  role?: Role;
}

/**
 * Gestión de usuarios desde /admin (sección 46 de SPEC.md). Deliberadamente
 * NO expone crear/borrar usuarios aquí: crear un usuario ya tiene una vía
 * real (`/auth/register`) y borrar en cascada el historial completo de una
 * persona (intentos, XP, tickets comentados...) es una acción demasiado
 * destructiva para un CRUD genérico — lo único que un admin necesita de
 * verdad es listar y cambiar el rol (promover/degradar ADMIN).
 */
export const usersAdminService = {
  async list(filters: AdminUserFilters, page: number, pageSize: number) {
    const where = {
      ...(filters.role ? { role: filters.role } : {}),
      ...(filters.q
        ? {
            OR: [
              { email: { contains: filters.q, mode: "insensitive" as const } },
              { username: { contains: filters.q, mode: "insensitive" as const } },
              {
                profile: {
                  displayName: { contains: filters.q, mode: "insensitive" as const },
                },
              },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      prisma.user.findMany({
        where,
        include: { profile: true },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.user.count({ where }),
    ]);

    return {
      items: items.map((u) => ({
        id: u.id,
        email: u.email,
        username: u.username,
        role: u.role,
        displayName: u.profile?.displayName ?? "",
        level: u.profile?.level ?? 1,
        totalXp: u.profile?.totalXp ?? 0,
        createdAt: u.createdAt.toISOString(),
        lastActivityAt: u.profile?.lastActivityAt?.toISOString() ?? null,
      })),
      meta: {
        page,
        pageSize,
        total,
        totalPages: Math.max(1, Math.ceil(total / pageSize)),
      },
    };
  },

  async updateRole(userId: string, role: Role, actingAdminId: string) {
    if (userId === actingAdminId && role === "USER") {
      throw HttpError.badRequest("No puedes quitarte tu propio rol de administrador.");
    }
    const user = await prisma.user.update({
      where: { id: userId },
      data: { role },
      include: { profile: true },
    });
    return user;
  },
};
