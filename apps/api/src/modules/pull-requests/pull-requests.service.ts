import type {
  CandidateIssueOption,
  CodeReviewResult,
  PullRequestDetail,
  PullRequestSummary,
  TicketPerson,
} from "@codeforge/types";
import type { SubmitCodeReviewInput } from "@codeforge/validators";
import { HttpError } from "../../lib/http-error.js";
import { awardXp } from "../gamification/xp.service.js";
import { pullRequestsRepository } from "./pull-requests.repository.js";

interface StoredCandidateIssue extends CandidateIssueOption {
  isRealIssue: boolean;
}

const XP_PER_ISSUE = 10;

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j] as T, copy[i] as T];
  }
  return copy;
}

function toPerson(user: {
  id: string;
  profile: { displayName: string } | null;
}): TicketPerson {
  return { id: user.id, displayName: user.profile?.displayName ?? "Sin nombre" };
}

export const pullRequestsService = {
  async list(): Promise<PullRequestSummary[]> {
    const prs = await pullRequestsRepository.listPractice();
    return prs.map((pr) => ({
      id: pr.id,
      title: pr.title,
      ticketCode: pr.ticket.code,
      ticketTitle: pr.ticket.title,
      author: toPerson(pr.author),
    }));
  },

  async getDetail(id: string): Promise<PullRequestDetail> {
    const pr = await pullRequestsRepository.findById(id);
    if (!pr) throw HttpError.notFound("Pull request no encontrada.");

    const issues = pr.candidateIssues as unknown as StoredCandidateIssue[];
    const options: CandidateIssueOption[] = shuffle(
      issues.map((i) => ({ id: i.id, label: i.label })),
    );

    return {
      id: pr.id,
      title: pr.title,
      ticketCode: pr.ticket.code,
      ticketTitle: pr.ticket.title,
      author: toPerson(pr.author),
      description: pr.description,
      diff: pr.diff,
      candidateIssues: options,
    };
  },

  async submitReview(
    id: string,
    userId: string,
    input: SubmitCodeReviewInput,
  ): Promise<CodeReviewResult> {
    const pr = await pullRequestsRepository.findById(id);
    if (!pr) throw HttpError.notFound("Pull request no encontrada.");

    const issues = pr.candidateIssues as unknown as StoredCandidateIssue[];
    const selected = new Set(input.selectedIssueIds);

    const correctlyFlagged = issues.filter((i) => i.isRealIssue && selected.has(i.id));
    const missedIssues = issues.filter((i) => i.isRealIssue && !selected.has(i.id));
    const incorrectlyFlagged = issues.filter((i) => !i.isRealIssue && selected.has(i.id));
    const correctlyIgnored = issues.filter((i) => !i.isRealIssue && !selected.has(i.id));

    const correct = correctlyFlagged.length + correctlyIgnored.length;
    const score = issues.length > 0 ? Math.round((correct / issues.length) * 100) : 0;

    const previousAttempts = await pullRequestsRepository.countReviewsByUser(id, userId);
    await pullRequestsRepository.createReview({
      pullRequestId: id,
      reviewerId: userId,
      comments: { selectedIssueIds: input.selectedIssueIds, summary: input.summary },
      verdict: input.verdict,
      expertComparisonScore: score,
    });

    const baseXp = issues.length * XP_PER_ISSUE;
    const xpForAttempt = Math.round((baseXp * score) / 100);
    const xpResult =
      previousAttempts === 0
        ? await awardXp(userId, xpForAttempt, "CODE_REVIEW", id)
        : { awarded: 0, alreadyAwarded: true, leveledUp: false };

    return {
      score,
      correctlyFlagged: correctlyFlagged.map((i) => i.label),
      missedIssues: missedIssues.map((i) => i.label),
      incorrectlyFlagged: incorrectlyFlagged.map((i) => i.label),
      xpAwarded: xpResult.awarded,
      alreadyAwarded: xpResult.alreadyAwarded,
      leveledUp: xpResult.leveledUp,
    };
  },
};
