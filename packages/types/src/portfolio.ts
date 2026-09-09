export interface ResumeExperienceItem {
  company: string;
  role: string;
  startDate: string;
  endDate: string | null;
  description: string;
}

export interface ResumeEducationItem {
  institution: string;
  degree: string;
  startDate: string;
  endDate: string | null;
}

export interface ResumeLinkItem {
  label: string;
  url: string;
}

export interface PortfolioProjectSummary {
  slug: string;
  title: string;
  level: string;
  brief: string;
  githubUrl: string | null;
  demoUrl: string | null;
  technologies: string[];
  completedAt: string | null;
}

export interface PortfolioSkillSummary {
  slug: string;
  name: string;
  masteryScore: number;
}

export interface PortfolioAchievementSummary {
  slug: string;
  title: string;
  icon: string;
}

/** Sección 36 de SPEC.md: se compone en vivo a partir de datos reales de la plataforma. */
export interface PortfolioView {
  username: string;
  displayName: string;
  avatarUrl: string | null;
  bio: string | null;
  headline: string | null;
  theme: string;
  level: number;
  totalXp: number;
  skills: PortfolioSkillSummary[];
  projects: PortfolioProjectSummary[];
  achievements: PortfolioAchievementSummary[];
  education: ResumeEducationItem[];
  links: ResumeLinkItem[];
}

export interface PortfolioSettings {
  isPublic: boolean;
  headline: string | null;
  theme: string;
}

export interface ResumeView {
  summary: string | null;
  experience: ResumeExperienceItem[];
  education: ResumeEducationItem[];
  links: ResumeLinkItem[];
  displayName: string;
  bio: string | null;
  skills: PortfolioSkillSummary[];
  projects: PortfolioProjectSummary[];
}
