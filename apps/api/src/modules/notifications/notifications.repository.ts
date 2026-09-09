import { prisma, type NotificationType } from "@codeforge/database";

export const notificationsRepository = {
  create(data: {
    userId: string;
    type: NotificationType;
    title: string;
    body: string;
    link?: string;
  }) {
    return prisma.notification.create({ data });
  },

  async listForUser(userId: string, page: number, pageSize: number) {
    const where = { userId };
    const [items, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({ where: { userId, readAt: null } }),
    ]);
    return { items, total, unreadCount };
  },

  markRead(id: string, userId: string) {
    return prisma.notification.updateMany({
      where: { id, userId, readAt: null },
      data: { readAt: new Date() },
    });
  },

  markAllRead(userId: string) {
    return prisma.notification.updateMany({
      where: { userId, readAt: null },
      data: { readAt: new Date() },
    });
  },
};
