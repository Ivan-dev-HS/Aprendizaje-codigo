import { prisma } from "@codeforge/database";

const personSelect = { id: true, profile: { select: { displayName: true } } } as const;

export const pullRequestsRepository = {
  listPractice() {
    return prisma.pullRequest.findMany({
      include: {
        author: { select: personSelect },
        ticket: { select: { code: true, title: true } },
      },
      orderBy: { createdAt: "asc" },
    });
  },

  findById(id: string) {
    return prisma.pullRequest.findUnique({
      where: { id },
      include: {
        author: { select: personSelect },
        ticket: { select: { code: true, title: true } },
      },
    });
  },

  countReviewsByUser(pullRequestId: string, reviewerId: string) {
    return prisma.codeReview.count({ where: { pullRequestId, reviewerId } });
  },

  createReview(data: {
    pullRequestId: string;
    reviewerId: string;
    comments: unknown;
    verdict: string;
    expertComparisonScore: number;
  }) {
    return prisma.codeReview.create({
      data: {
        pullRequestId: data.pullRequestId,
        reviewerId: data.reviewerId,
        comments: data.comments as never,
        verdict: data.verdict,
        expertComparisonScore: data.expertComparisonScore,
      },
    });
  },
};
