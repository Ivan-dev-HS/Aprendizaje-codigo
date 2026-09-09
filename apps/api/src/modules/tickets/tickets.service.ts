import type { TicketDetail, TicketPerson, TicketSummary } from "@codeforge/types";
import type { AddTicketCommentInput, UpdateTicketInput } from "@codeforge/validators";
import { HttpError } from "../../lib/http-error.js";
import { recordProgressEvent } from "../gamification/xp.service.js";
import { awardXpAndCheckProgress } from "../gamification/progress.service.js";
import { notificationsService } from "../notifications/notifications.service.js";
import { ticketsRepository, type TicketFilters } from "./tickets.repository.js";
import { TICKET_XP_BY_PRIORITY } from "./xp-by-priority.js";

function toPerson(
  user: { id: string; profile: { displayName: string } | null } | null,
): TicketPerson | null {
  if (!user) return null;
  return { id: user.id, displayName: user.profile?.displayName ?? "Sin nombre" };
}

function toSummary(
  t: Awaited<ReturnType<typeof ticketsRepository.listTickets>>[number],
): TicketSummary {
  return {
    id: t.id,
    code: t.code,
    title: t.title,
    priority: t.priority,
    type: t.type,
    status: t.status,
    reporter: toPerson(t.reporter) as TicketPerson,
    assignee: toPerson(t.assignee),
  };
}

export const ticketsService = {
  async list(filters: TicketFilters): Promise<TicketSummary[]> {
    let effectiveFilters = filters;
    if (!filters.sprintId) {
      const sprint = await ticketsRepository.findCurrentSprint();
      effectiveFilters = { ...filters, sprintId: sprint?.id };
    }
    const tickets = await ticketsRepository.listTickets(effectiveFilters);
    return tickets.map(toSummary);
  },

  async getDetail(id: string): Promise<TicketDetail> {
    const t = await ticketsRepository.findTicketById(id);
    if (!t) throw HttpError.notFound("Ticket no encontrado.");

    return {
      ...toSummary(t),
      description: t.description,
      acceptanceCriteria: t.acceptanceCriteria as string[],
      comments: t.comments.map((c) => ({
        id: c.id,
        author: toPerson(c.author) as TicketPerson,
        body: c.body,
        createdAt: c.createdAt.toISOString(),
      })),
    };
  },

  async update(id: string, userId: string, input: UpdateTicketInput) {
    const t = await ticketsRepository.findTicketById(id);
    if (!t) throw HttpError.notFound("Ticket no encontrado.");

    if (input.assignToMe) {
      if (t.assigneeId && t.assigneeId !== userId) {
        throw HttpError.conflict("Este ticket ya está asignado a otra persona.");
      }
      await ticketsRepository.assignToUser(id, userId);
    }

    let leveledUp = false;
    let xpAwarded = 0;
    if (input.status) {
      const assigneeId = input.assignToMe ? userId : t.assigneeId;
      if (assigneeId !== userId) {
        throw HttpError.forbidden(
          "Solo la persona asignada puede cambiar el status del ticket.",
        );
      }
      const becomingDone = input.status === "DONE" && t.status !== "DONE";
      await ticketsRepository.updateStatus(
        id,
        input.status,
        becomingDone ? TICKET_XP_BY_PRIORITY[t.priority] : undefined,
      );
      if (becomingDone) {
        const xpResult = await awardXpAndCheckProgress(
          userId,
          TICKET_XP_BY_PRIORITY[t.priority],
          "TICKET",
          id,
        );
        xpAwarded = xpResult.awarded;
        leveledUp = xpResult.leveledUp;
        await recordProgressEvent(userId, "ticket_completed", { ticketId: id });
      }
    }

    const updated = await ticketsRepository.findTicketById(id);
    return { ticket: toSummary(updated!), xpAwarded, leveledUp };
  },

  async addComment(id: string, userId: string, input: AddTicketCommentInput) {
    const t = await ticketsRepository.findTicketById(id);
    if (!t) throw HttpError.notFound("Ticket no encontrado.");

    const comment = await ticketsRepository.addComment(id, userId, input.body);

    if (t.assigneeId && t.assigneeId !== userId) {
      await notificationsService.create(
        t.assigneeId,
        "TICKET",
        `Nuevo comentario en ${t.code}`,
        `${comment.author?.profile?.displayName ?? "Alguien"} comentó en "${t.title}".`,
        `/company/tickets/${id}`,
      );
    }

    return {
      id: comment.id,
      author: toPerson(comment.author) as TicketPerson,
      body: comment.body,
      createdAt: comment.createdAt.toISOString(),
    };
  },
};
