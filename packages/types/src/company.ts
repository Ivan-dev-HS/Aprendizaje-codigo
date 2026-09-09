export type TicketStatus =
  "BACKLOG" | "TODO" | "IN_PROGRESS" | "BLOCKED" | "CODE_REVIEW" | "QA" | "DONE";

export type TicketPriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type TicketType = "BUG" | "FEATURE" | "CHORE" | "INCIDENT";

export interface TicketPerson {
  id: string;
  displayName: string;
}

export interface TicketSummary {
  id: string;
  code: string;
  title: string;
  priority: TicketPriority;
  type: TicketType;
  status: TicketStatus;
  reporter: TicketPerson;
  assignee: TicketPerson | null;
}

export interface TicketComment {
  id: string;
  author: TicketPerson;
  body: string;
  createdAt: string;
}

export interface TicketDetail extends TicketSummary {
  description: string;
  acceptanceCriteria: string[];
  comments: TicketComment[];
}

export interface SprintSummary {
  id: string;
  slug: string;
  name: string;
  goal: string;
  startDate: string;
  endDate: string;
  ticketCountByStatus: Record<TicketStatus, number>;
  totalTickets: number;
  doneTickets: number;
}

export interface StandupEntrySummary {
  id: string;
  date: string;
  yesterday: string;
  today: string;
  blockers: string | null;
  communicationScore: number | null;
}

export interface CandidateIssueOption {
  id: string;
  label: string;
}

export interface PullRequestSummary {
  id: string;
  title: string;
  ticketCode: string;
  ticketTitle: string;
  author: TicketPerson;
}

export interface PullRequestDetail extends PullRequestSummary {
  description: string;
  diff: string;
  candidateIssues: CandidateIssueOption[];
}

export interface CodeReviewResult {
  score: number;
  correctlyFlagged: string[];
  missedIssues: string[];
  incorrectlyFlagged: string[];
  xpAwarded: number;
  alreadyAwarded: boolean;
  leveledUp: boolean;
}
