import { prisma, type TicketStatus } from "@codeforge/database";

export interface TicketFilters {
  sprintId?: string;
  status?: TicketStatus;
}

const personSelect = { id: true, profile: { select: { displayName: true } } } as const;

export const ticketsRepository = {
  findCurrentSprint() {
    const now = new Date();
    return prisma.sprint
      .findFirst({
        where: { startDate: { lte: now }, endDate: { gte: now } },
        orderBy: { startDate: "desc" },
      })
      .then(
        (sprint) => sprint ?? prisma.sprint.findFirst({ orderBy: { startDate: "desc" } }),
      );
  },

  listTickets(filters: TicketFilters) {
    return prisma.ticket.findMany({
      where: {
        ...(filters.sprintId ? { sprintId: filters.sprintId } : {}),
        ...(filters.status ? { status: filters.status } : {}),
      },
      include: { reporter: { select: personSelect }, assignee: { select: personSelect } },
      orderBy: { createdAt: "asc" },
    });
  },

  findTicketById(id: string) {
    return prisma.ticket.findUnique({
      where: { id },
      include: {
        reporter: { select: personSelect },
        assignee: { select: personSelect },
        comments: {
          include: { author: { select: personSelect } },
          orderBy: { createdAt: "asc" },
        },
      },
    });
  },

  assignToUser(id: string, userId: string) {
    return prisma.ticket.update({ where: { id }, data: { assigneeId: userId } });
  },

  updateStatus(id: string, status: TicketStatus, xpAwarded?: number) {
    return prisma.ticket.update({
      where: { id },
      data: { status, ...(xpAwarded !== undefined ? { xpAwarded } : {}) },
    });
  },

  addComment(ticketId: string, authorId: string, body: string) {
    return prisma.ticketComment.create({
      data: { ticketId, authorId, body },
      include: { author: { select: personSelect } },
    });
  },
};
