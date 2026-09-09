import type { Difficulty } from "./exercises.js";

export type CaseKind = "DEBUGGING" | "IT_SUPPORT" | "NETWORKING" | "PRODUCTION_INCIDENT";

export type CaseDomain =
  | "HTML"
  | "CSS"
  | "JAVASCRIPT"
  | "REACT"
  | "NODE"
  | "SQL"
  | "API"
  | "GIT"
  | "LINUX"
  | "IT_HARDWARE"
  | "IT_WINDOWS"
  | "IT_LINUX"
  | "IT_NETWORKING"
  | "IT_SOFTWARE"
  | "IT_SECURITY"
  | "IT_PRINTERS"
  | "IT_ACCOUNTS"
  | "IT_PERFORMANCE"
  | "NETWORKING"
  | "PRODUCTION";

export type IncidentSeverity = "P0" | "P1" | "P2" | "P3";

export interface CaseOption {
  id: string;
  label: string;
}

export interface CaseSummary {
  id: string;
  slug: string;
  kind: CaseKind;
  domain: CaseDomain;
  severity: IncidentSeverity | null;
  title: string;
  points: number;
  difficulty: Difficulty;
  isCompleted: boolean;
}

export interface CaseDetail extends CaseSummary {
  symptoms: string;
  environment: string;
  code: string | null;
  logs: string | null;
  expected: string;
  actual: string;
  options: CaseOption[];
  hintsAvailable: number;
  requiresPostmortem: boolean;
}

export interface CasePostmortem {
  whatHappened: string;
  rootCause: string;
  impact: string;
  timeline: string;
  fix: string;
  prevention: string;
}

export interface CaseAttemptResult {
  isCorrect: boolean;
  xpAwarded: number;
  alreadyAwarded: boolean;
  explanation: string;
  correctOptionId: string | null;
  leveledUp: boolean;
}
