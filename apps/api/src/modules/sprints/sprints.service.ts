import { prisma, type TicketStatus } from "@codeforge/database";
import type { SprintSummary } from "@codeforge/types";
import { HttpError } from "../../lib/http-error.js";

const ALL_STATUSES: TicketStatus[] = [
  "BACKLOG",
  "TODO",
  "IN_PROGRESS",
  "BLOCKED",
  "CODE_REVIEW",
  "QA",
  "DONE",
];

export const sprintsService = {
  async getCurrent(): Promise<SprintSummary> {
    const now = new Date();
    const sprint =
      (await prisma.sprint.findFirst({
        where: { startDate: { lte: now }, endDate: { gte: now } },
        orderBy: { startDate: "desc" },
      })) ?? (await prisma.sprint.findFirst({ orderBy: { startDate: "desc" } }));

    if (!sprint) throw HttpError.notFound("Todavía no hay ningún sprint configurado.");

    const tickets = await prisma.ticket.findMany({
      where: { sprintId: sprint.id },
      select: { status: true },
    });

    const ticketCountByStatus = Object.fromEntries(
      ALL_STATUSES.map((status) => [status, 0]),
    ) as Record<TicketStatus, number>;
    for (const t of tickets) ticketCountByStatus[t.status] += 1;

    return {
      id: sprint.id,
      slug: sprint.slug,
      name: sprint.name,
      goal: sprint.goal,
      startDate: sprint.startDate.toISOString(),
      endDate: sprint.endDate.toISOString(),
      ticketCountByStatus,
      totalTickets: tickets.length,
      doneTickets: ticketCountByStatus.DONE,
    };
  },
};
