import type {
  InterviewAttemptDetail,
  InterviewAttemptSummary,
  InterviewDetail,
  InterviewSummary,
  StartInterviewResult,
  SubmitInterviewAnswerResult,
} from "@codeforge/types";
import type { SubmitInterviewAnswerInput } from "@codeforge/validators";
import { HttpError } from "../../lib/http-error.js";
import { awardXp, recordProgressEvent } from "../gamification/xp.service.js";
import { aggregateAttemptScores, scoreAnswer } from "./interview-scoring.js";
import { interviewsRepository, type InterviewFilters } from "./interviews.repository.js";

const XP_PER_INTERVIEW = 300; // sección 41-43 de SPEC.md

type TemplateQuestion = {
  order: number;
  question: {
    id: string;
    prompt: string;
    difficulty: "EASY" | "MEDIUM" | "HARD";
    expectedAnswer: string;
    concepts: unknown;
    commonMistakes: unknown;
  };
};

function toQuestionPrompts(templateQuestions: TemplateQuestion[]) {
  return templateQuestions.map((tq) => ({
    id: tq.question.id,
    order: tq.order,
    prompt: tq.question.prompt,
    difficulty: tq.question.difficulty,
  }));
}

export const interviewsService = {
  async list(filters: InterviewFilters, userId?: string): Promise<InterviewSummary[]> {
    const interviews = await interviewsRepository.listInterviews(filters);
    return Promise.all(
      interviews.map(async (i) => {
        const lastAttempt = userId
          ? await interviewsRepository.lastFinishedAttempt(userId, i.id)
          : null;
        return {
          id: i.id,
          slug: i.slug,
          title: i.title,
          category: i.category,
          durationMinutes: i.durationMinutes,
          questionCount: i._count.templateQuestions,
          lastAttempt:
            lastAttempt && lastAttempt.finishedAt
              ? {
                  finishedAt: lastAttempt.finishedAt.toISOString(),
                  overallScore: lastAttempt.overallScore ?? 0,
                }
              : null,
        };
      }),
    );
  },

  async getDetail(slug: string, userId?: string): Promise<InterviewDetail> {
    const interview = await interviewsRepository.findBySlug(slug);
    if (!interview) throw HttpError.notFound("Entrevista no encontrada.");

    const lastAttempt = userId
      ? await interviewsRepository.lastFinishedAttempt(userId, interview.id)
      : null;

    return {
      id: interview.id,
      slug: interview.slug,
      title: interview.title,
      category: interview.category,
      durationMinutes: interview.durationMinutes,
      questionCount: interview.templateQuestions.length,
      lastAttempt:
        lastAttempt && lastAttempt.finishedAt
          ? {
              finishedAt: lastAttempt.finishedAt.toISOString(),
              overallScore: lastAttempt.overallScore ?? 0,
            }
          : null,
      questions: toQuestionPrompts(interview.templateQuestions),
    };
  },

  async start(interviewId: string, userId: string): Promise<StartInterviewResult> {
    const interview = await interviewsRepository.findById(interviewId);
    if (!interview) throw HttpError.notFound("Entrevista no encontrada.");
    if (interview.templateQuestions.length === 0) {
      throw HttpError.badRequest("Esta entrevista todavía no tiene preguntas.");
    }

    let attempt = await interviewsRepository.findUnfinishedAttempt(userId, interviewId);
    if (!attempt) {
      attempt = await interviewsRepository.createAttempt(userId, interviewId);
      await recordProgressEvent(userId, "interview_started", { interviewId });
    }

    return {
      attemptId: attempt.id,
      startedAt: attempt.startedAt.toISOString(),
      durationMinutes: interview.durationMinutes,
      questions: toQuestionPrompts(interview.templateQuestions),
    };
  },

  async submitAnswer(
    interviewId: string,
    userId: string,
    input: SubmitInterviewAnswerInput,
  ): Promise<SubmitInterviewAnswerResult> {
    const interview = await interviewsRepository.findById(interviewId);
    if (!interview) throw HttpError.notFound("Entrevista no encontrada.");

    const templateQuestion = interview.templateQuestions.find(
      (tq) => tq.question.id === input.questionId,
    );
    if (!templateQuestion) {
      throw HttpError.badRequest("Esa pregunta no pertenece a esta entrevista.");
    }
    const question = templateQuestion.question;
    const concepts = question.concepts as string[];
    const commonMistakes = question.commonMistakes as string[];

    const attempt = await interviewsRepository.findAttemptById(input.attemptId);
    if (!attempt || attempt.userId !== userId || attempt.interviewId !== interviewId) {
      throw HttpError.notFound("Intento de entrevista no encontrado.");
    }
    if (attempt.finishedAt) {
      throw HttpError.conflict("Esta entrevista ya ha finalizado.");
    }

    const existing = attempt.answers.find((a) => a.questionId === input.questionId);
    const totalQuestions = interview.templateQuestions.length;

    const breakdown = existing
      ? scoreAnswer(existing.answerText, concepts)
      : scoreAnswer(input.answerText, concepts);

    if (!existing) {
      await interviewsRepository.createAnswer({
        attemptId: attempt.id,
        questionId: input.questionId,
        answerText: input.answerText,
        timeSpentSeconds: input.timeSpentSeconds,
        technicalScore: breakdown.technical,
        problemSolvingScore: breakdown.problemSolving,
        communicationScore: breakdown.communication,
        confidenceScore: breakdown.confidence,
        score: breakdown.overall,
      });
    }

    const answeredCount = existing ? attempt.answers.length : attempt.answers.length + 1;
    const isLastQuestion = answeredCount >= totalQuestions;

    const feedback = {
      questionId: input.questionId,
      scores: {
        technical: breakdown.technical,
        problemSolving: breakdown.problemSolving,
        communication: breakdown.communication,
        confidence: breakdown.confidence,
        overall: breakdown.overall,
      },
      conceptsMentioned: breakdown.conceptsMentioned,
      conceptsMissing: breakdown.conceptsMissing,
      commonMistakes,
      expectedAnswer: question.expectedAnswer,
    };

    if (!isLastQuestion) {
      return {
        feedback,
        isLastQuestion: false,
        attemptFinished: false,
        scores: null,
        xpAwarded: 0,
        alreadyAwarded: false,
        leveledUp: false,
      };
    }

    if (attempt.finishedAt) {
      // Ya se había finalizado (reintento idempotente de la última respuesta).
      return {
        feedback,
        isLastQuestion: true,
        attemptFinished: true,
        scores: {
          technicalScore: attempt.technicalScore ?? 0,
          problemSolvingScore: attempt.problemSolvingScore ?? 0,
          communicationScore: attempt.communicationScore ?? 0,
          confidenceScore: attempt.confidenceScore ?? 0,
          overallScore: attempt.overallScore ?? 0,
        },
        xpAwarded: 0,
        alreadyAwarded: true,
        leveledUp: false,
      };
    }

    const finalAttempt = await interviewsRepository.findAttemptById(attempt.id);
    const allBreakdowns = (finalAttempt?.answers ?? []).map((a) => ({
      technical: a.technicalScore ?? 0,
      problemSolving: a.problemSolvingScore ?? 0,
      communication: a.communicationScore ?? 0,
      confidence: a.confidenceScore ?? 0,
      overall: a.score ?? 0,
    }));
    const scores = aggregateAttemptScores(allBreakdowns);

    const xpResult = await awardXp(userId, XP_PER_INTERVIEW, "INTERVIEW", interviewId);
    await interviewsRepository.finalizeAttempt(attempt.id, {
      ...scores,
      xpAwarded: xpResult.awarded,
    });
    await recordProgressEvent(userId, "interview_completed", {
      interviewId,
      overallScore: scores.overallScore,
    });

    return {
      feedback,
      isLastQuestion: true,
      attemptFinished: true,
      scores,
      xpAwarded: xpResult.awarded,
      alreadyAwarded: xpResult.alreadyAwarded,
      leveledUp: xpResult.leveledUp,
    };
  },

  async listAttempts(userId: string): Promise<InterviewAttemptSummary[]> {
    const attempts = await interviewsRepository.listAttemptsForUser(userId);
    return attempts.map((a) => ({
      id: a.id,
      interviewId: a.interviewId,
      interviewTitle: a.interview.title,
      interviewSlug: a.interview.slug,
      category: a.interview.category,
      startedAt: a.startedAt.toISOString(),
      finishedAt: a.finishedAt ? a.finishedAt.toISOString() : null,
      scores: a.finishedAt
        ? {
            technicalScore: a.technicalScore ?? 0,
            problemSolvingScore: a.problemSolvingScore ?? 0,
            communicationScore: a.communicationScore ?? 0,
            confidenceScore: a.confidenceScore ?? 0,
            overallScore: a.overallScore ?? 0,
          }
        : null,
    }));
  },

  async getAttemptDetail(
    attemptId: string,
    userId: string,
  ): Promise<InterviewAttemptDetail> {
    const attempt = await interviewsRepository.findAttemptById(attemptId);
    if (!attempt) throw HttpError.notFound("Intento de entrevista no encontrado.");
    if (attempt.userId !== userId) throw HttpError.forbidden();

    const answers = attempt.answers.map((a) => {
      const concepts = a.question.concepts as string[];
      const breakdown = scoreAnswer(a.answerText, concepts);
      return {
        questionId: a.questionId,
        prompt: a.question.prompt,
        answerText: a.answerText,
        timeSpentSeconds: a.timeSpentSeconds,
        scores: {
          technical: a.technicalScore ?? breakdown.technical,
          problemSolving: a.problemSolvingScore ?? breakdown.problemSolving,
          communication: a.communicationScore ?? breakdown.communication,
          confidence: a.confidenceScore ?? breakdown.confidence,
          overall: a.score ?? breakdown.overall,
        },
        conceptsMentioned: breakdown.conceptsMentioned,
        conceptsMissing: breakdown.conceptsMissing,
        commonMistakes: a.question.commonMistakes as string[],
        expectedAnswer: a.question.expectedAnswer,
      };
    });

    return {
      id: attempt.id,
      interviewId: attempt.interviewId,
      interviewTitle: attempt.interview.title,
      interviewSlug: attempt.interview.slug,
      category: attempt.interview.category,
      startedAt: attempt.startedAt.toISOString(),
      finishedAt: attempt.finishedAt ? attempt.finishedAt.toISOString() : null,
      scores: attempt.finishedAt
        ? {
            technicalScore: attempt.technicalScore ?? 0,
            problemSolvingScore: attempt.problemSolvingScore ?? 0,
            communicationScore: attempt.communicationScore ?? 0,
            confidenceScore: attempt.confidenceScore ?? 0,
            overallScore: attempt.overallScore ?? 0,
          }
        : null,
      answers,
    };
  },
};
