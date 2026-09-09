import { prisma, Prisma } from "@codeforge/database";

/** Sección 46/99 de SPEC.md: toda mutación de administración queda registrada. */
export async function listAuditLog(page: number, pageSize: number) {
  const [items, total] = await Promise.all([
    prisma.auditLog.findMany({
      include: {
        actor: { select: { id: true, profile: { select: { displayName: true } } } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.auditLog.count(),
  ]);
  return {
    items: items.map((log) => ({
      id: log.id,
      actorId: log.actorId,
      actorName: log.actor.profile?.displayName ?? log.actorId,
      action: log.action,
      entityType: log.entityType,
      entityId: log.entityId,
      metadata: log.metadata,
      createdAt: log.createdAt.toISOString(),
    })),
    meta: { page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) },
  };
}

export function writeAuditLog(
  actorId: string,
  action: "CREATE" | "UPDATE" | "DELETE",
  entityType: string,
  entityId: string,
  metadata?: Record<string, unknown>,
) {
  return prisma.auditLog.create({
    data: {
      actorId,
      action,
      entityType,
      entityId,
      metadata: metadata as Prisma.InputJsonValue | undefined,
    },
  });
}
