import type { TicketPriority } from "@codeforge/database";

/** Ticket.xpAwarded no tiene tabla de puntos propia: se escala por prioridad. */
export const TICKET_XP_BY_PRIORITY: Record<TicketPriority, number> = {
  LOW: 15,
  MEDIUM: 25,
  HIGH: 40,
  CRITICAL: 60,
};
