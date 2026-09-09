import { prisma, type InterviewCategory } from "@codeforge/database";

export interface InterviewFilters {
  category?: InterviewCategory;
}

const orderedTemplateQuestions = {
  templateQuestions: {
    include: { question: true },
    orderBy: { order: "asc" as const },
  },
};

export const interviewsRepository = {
  listInterviews(filters: InterviewFilters) {
    return prisma.interview.findMany({
      where: filters.category ? { category: filters.category } : {},
      include: { _count: { select: { templateQuestions: true } } },
      orderBy: { title: "asc" },
    });
  },

  findBySlug(slug: string) {
    return prisma.interview.findUnique({
      where: { slug },
      include: orderedTemplateQuestions,
    });
  },

  findById(id: string) {
    return prisma.interview.findUnique({
      where: { id },
      include: orderedTemplateQuestions,
    });
  },

  lastFinishedAttempt(userId: string, interviewId: string) {
    return prisma.interviewAttempt.findFirst({
      where: { userId, interviewId, finishedAt: { not: null } },
      orderBy: { finishedAt: "desc" },
    });
  },

  findUnfinishedAttempt(userId: string, interviewId: string) {
    return prisma.interviewAttempt.findFirst({
      where: { userId, interviewId, finishedAt: null },
      orderBy: { startedAt: "desc" },
    });
  },

  createAttempt(userId: string, interviewId: string) {
    return prisma.interviewAttempt.create({ data: { userId, interviewId } });
  },

  findAttemptById(id: string) {
    return prisma.interviewAttempt.findUnique({
      where: { id },
      include: {
        interview: true,
        answers: { include: { question: true } },
      },
    });
  },

  findQuestionById(id: string) {
    return prisma.interviewQuestion.findUnique({ where: { id } });
  },

  countAnswers(attemptId: string) {
    return prisma.interviewAnswer.count({ where: { attemptId } });
  },

  hasAnswered(attemptId: string, questionId: string) {
    return prisma.interviewAnswer.findFirst({ where: { attemptId, questionId } });
  },

  createAnswer(data: {
    attemptId: string;
    questionId: string;
    answerText: string;
    timeSpentSeconds: number;
    technicalScore: number;
    problemSolvingScore: number;
    communicationScore: number;
    confidenceScore: number;
    score: number;
  }) {
    return prisma.interviewAnswer.create({ data });
  },

  finalizeAttempt(
    id: string,
    scores: {
      technicalScore: number;
      problemSolvingScore: number;
      communicationScore: number;
      confidenceScore: number;
      overallScore: number;
      xpAwarded: number;
    },
  ) {
    return prisma.interviewAttempt.update({
      where: { id },
      data: { finishedAt: new Date(), ...scores },
    });
  },

  listAttemptsForUser(userId: string) {
    return prisma.interviewAttempt.findMany({
      where: { userId },
      include: { interview: true },
      orderBy: { startedAt: "desc" },
    });
  },
};
