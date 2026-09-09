export type ProjectLevel =
  | "L1_PORTFOLIO"
  | "L2_LANDING"
  | "L3_TODO"
  | "L4_DASHBOARD"
  | "L5_API_APP"
  | "L6_ECOMMERCE"
  | "L7_FULL_STACK"
  | "L8_SAAS";

export type UserProjectStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";

export interface ProjectTaskSummary {
  id: string;
  title: string;
  description: string;
  order: number;
  isCompleted: boolean;
}

export interface ProjectSummary {
  id: string;
  slug: string;
  title: string;
  level: ProjectLevel;
  brief: string;
  estimatedHours: number;
  taskCount: number;
  completedTaskCount: number;
  status: UserProjectStatus;
}

export interface UserProjectMetadata {
  githubUrl: string | null;
  demoUrl: string | null;
  readme: string | null;
  screenshots: string[];
  technologies: string[];
  completedAt: string | null;
}

export interface ProjectDetail extends ProjectSummary {
  requirements: string[];
  userStories: string[];
  acceptanceCriteria: string[];
  bonusIdeas: string[];
  tasks: ProjectTaskSummary[];
  userProject: UserProjectMetadata | null;
}
