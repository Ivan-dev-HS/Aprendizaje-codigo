import type { Difficulty } from "./exercises.js";

export type InterviewCategory =
  "TECHNICAL" | "BEHAVIORAL" | "FRONTEND" | "BACKEND" | "FULL_STACK" | "IT_SUPPORT";

export interface InterviewAttemptScores {
  technicalScore: number;
  problemSolvingScore: number;
  communicationScore: number;
  confidenceScore: number;
  overallScore: number;
}

export interface InterviewSummary {
  id: string;
  slug: string;
  title: string;
  category: InterviewCategory;
  durationMinutes: number;
  questionCount: number;
  lastAttempt: { finishedAt: string; overallScore: number } | null;
}

export interface InterviewQuestionPrompt {
  id: string;
  order: number;
  prompt: string;
  difficulty: Difficulty;
}

export interface InterviewDetail extends InterviewSummary {
  questions: InterviewQuestionPrompt[];
}

export interface StartInterviewResult {
  attemptId: string;
  startedAt: string;
  durationMinutes: number;
  questions: InterviewQuestionPrompt[];
}

export interface InterviewAnswerFeedback {
  questionId: string;
  scores: {
    technical: number;
    problemSolving: number;
    communication: number;
    confidence: number;
    overall: number;
  };
  conceptsMentioned: string[];
  conceptsMissing: string[];
  commonMistakes: string[];
  expectedAnswer: string;
}

export interface SubmitInterviewAnswerResult {
  feedback: InterviewAnswerFeedback;
  isLastQuestion: boolean;
  attemptFinished: boolean;
  scores: InterviewAttemptScores | null;
  xpAwarded: number;
  alreadyAwarded: boolean;
  leveledUp: boolean;
}

export interface InterviewAttemptSummary {
  id: string;
  interviewId: string;
  interviewTitle: string;
  interviewSlug: string;
  category: InterviewCategory;
  startedAt: string;
  finishedAt: string | null;
  scores: InterviewAttemptScores | null;
}

export interface InterviewAttemptAnswerDetail {
  questionId: string;
  prompt: string;
  answerText: string;
  timeSpentSeconds: number;
  scores: {
    technical: number;
    problemSolving: number;
    communication: number;
    confidence: number;
    overall: number;
  };
  conceptsMentioned: string[];
  conceptsMissing: string[];
  commonMistakes: string[];
  expectedAnswer: string;
}

export interface InterviewAttemptDetail extends InterviewAttemptSummary {
  answers: InterviewAttemptAnswerDetail[];
}
