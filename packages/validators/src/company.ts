import { z } from "zod";

const TICKET_STATUSES = [
  "BACKLOG",
  "TODO",
  "IN_PROGRESS",
  "BLOCKED",
  "CODE_REVIEW",
  "QA",
  "DONE",
] as const;

export const ticketListQuerySchema = z.object({
  sprintId: z.string().optional(),
  status: z.enum(TICKET_STATUSES).optional(),
});
export type TicketListQueryInput = z.infer<typeof ticketListQuerySchema>;

export const updateTicketSchema = z
  .object({
    status: z.enum(TICKET_STATUSES).optional(),
    assignToMe: z.literal(true).optional(),
  })
  .refine((v) => v.status !== undefined || v.assignToMe !== undefined, {
    message: "Debes indicar un nuevo status o assignToMe.",
  });
export type UpdateTicketInput = z.infer<typeof updateTicketSchema>;

export const addTicketCommentSchema = z.object({
  body: z.string().trim().min(1).max(2000),
});
export type AddTicketCommentInput = z.infer<typeof addTicketCommentSchema>;

export const submitStandupSchema = z.object({
  yesterday: z.string().trim().min(1).max(1000),
  today: z.string().trim().min(1).max(1000),
  blockers: z.string().trim().max(1000).optional(),
});
export type SubmitStandupInput = z.infer<typeof submitStandupSchema>;

export const submitCodeReviewSchema = z.object({
  selectedIssueIds: z.array(z.string()).max(20),
  verdict: z.enum(["APPROVE", "REQUEST_CHANGES", "COMMENT"]),
  summary: z.string().trim().max(2000).optional(),
});
export type SubmitCodeReviewInput = z.infer<typeof submitCodeReviewSchema>;
