import type { NotificationType } from "@codeforge/database";
import type { NotificationSummary } from "@codeforge/types";
import { notificationsRepository } from "./notifications.repository.js";

/**
 * Sección 48 de SPEC.md: tipos achievement/course/ticket/review/system.
 * "Preparar arquitectura para email futuro" — la interfaz `EmailProvider`
 * (`apps/api/src/lib/email-provider.ts`) ya existe para esto (misma que usa
 * la recuperación de contraseña); conectar un digest de notificaciones por
 * email sería llamar `emailProvider.send(...)` aquí, sin cambiar nada más.
 * No se envía automáticamente todavía porque no hay proveedor real
 * configurado en este entorno.
 */
export const notificationsService = {
  create(
    userId: string,
    type: NotificationType,
    title: string,
    body: string,
    link?: string,
  ) {
    return notificationsRepository.create({ userId, type, title, body, link });
  },

  async listForUser(
    userId: string,
    page: number,
    pageSize: number,
  ): Promise<{
    items: NotificationSummary[];
    meta: { page: number; pageSize: number; total: number; totalPages: number };
    unreadCount: number;
  }> {
    const { items, total, unreadCount } = await notificationsRepository.listForUser(
      userId,
      page,
      pageSize,
    );
    return {
      items: items.map((n) => ({
        id: n.id,
        type: n.type,
        title: n.title,
        body: n.body,
        link: n.link,
        isRead: n.readAt !== null,
        createdAt: n.createdAt.toISOString(),
      })),
      meta: {
        page,
        pageSize,
        total,
        totalPages: Math.max(1, Math.ceil(total / pageSize)),
      },
      unreadCount,
    };
  },

  async markRead(id: string, userId: string) {
    await notificationsRepository.markRead(id, userId);
  },

  async markAllRead(userId: string) {
    await notificationsRepository.markAllRead(userId);
  },
};
