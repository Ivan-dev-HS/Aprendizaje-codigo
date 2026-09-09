import type { ProjectDetail, ProjectSummary, UserProjectStatus } from "@codeforge/types";
import type { UpdateUserProjectInput } from "@codeforge/validators";
import { HttpError } from "../../lib/http-error.js";
import { recordProgressEvent } from "../gamification/xp.service.js";
import { awardXpAndCheckProgress } from "../gamification/progress.service.js";
import { projectsRepository } from "./projects.repository.js";
import { PROJECT_XP_BY_LEVEL } from "./xp-by-level.js";

function statusFor(userProject: { status: string } | undefined): UserProjectStatus {
  if (!userProject) return "NOT_STARTED";
  return userProject.status === "COMPLETED" ? "COMPLETED" : "IN_PROGRESS";
}

export const projectsService = {
  async list(userId?: string): Promise<ProjectSummary[]> {
    const projects = await projectsRepository.listProjects();
    const userProjects = userId
      ? await projectsRepository.findUserProjects(
          userId,
          projects.map((p) => p.id),
        )
      : [];
    const byProjectId = new Map(userProjects.map((up) => [up.projectId, up]));

    return projects.map((p) => {
      const userProject = byProjectId.get(p.id);
      return {
        id: p.id,
        slug: p.slug,
        title: p.title,
        level: p.level,
        brief: p.brief,
        estimatedHours: p.estimatedHours,
        taskCount: p.tasks.length,
        completedTaskCount:
          userProject?.progress.filter((pr) => pr.completedAt).length ?? 0,
        status: statusFor(userProject),
      };
    });
  },

  async getDetail(slug: string, userId?: string): Promise<ProjectDetail> {
    const project = await projectsRepository.findProjectBySlug(slug);
    if (!project) throw HttpError.notFound("Proyecto no encontrado.");

    const userProject = userId
      ? await projectsRepository.findUserProject(userId, project.id)
      : null;
    const completedTaskIds = new Set(
      userProject?.progress.filter((pr) => pr.completedAt).map((pr) => pr.taskId) ?? [],
    );

    return {
      id: project.id,
      slug: project.slug,
      title: project.title,
      level: project.level,
      brief: project.brief,
      estimatedHours: project.estimatedHours,
      taskCount: project.tasks.length,
      completedTaskCount: completedTaskIds.size,
      status: statusFor(userProject ?? undefined),
      requirements: project.requirements as string[],
      userStories: project.userStories as string[],
      acceptanceCriteria: project.acceptanceCriteria as string[],
      bonusIdeas: (project.bonusIdeas as string[] | null) ?? [],
      tasks: project.tasks.map((t) => ({
        id: t.id,
        title: t.title,
        description: t.description,
        order: t.order,
        isCompleted: completedTaskIds.has(t.id),
      })),
      userProject: userProject
        ? {
            githubUrl: userProject.githubUrl,
            demoUrl: userProject.demoUrl,
            readme: userProject.readme,
            screenshots: (userProject.screenshots as string[] | null) ?? [],
            technologies: (userProject.technologies as string[] | null) ?? [],
            completedAt: userProject.completedAt?.toISOString() ?? null,
          }
        : null,
    };
  },

  async start(projectId: string, userId: string) {
    const project = await projectsRepository.findProjectById(projectId);
    if (!project) throw HttpError.notFound("Proyecto no encontrado.");

    const existing = await projectsRepository.findUserProject(userId, projectId);
    if (existing) return existing;

    const created = await projectsRepository.createUserProject(userId, projectId);
    await recordProgressEvent(userId, "project_started", { projectId });
    return created;
  },

  async updateMetadata(projectId: string, userId: string, input: UpdateUserProjectInput) {
    const userProject = await projectsRepository.findUserProject(userId, projectId);
    if (!userProject) {
      throw HttpError.badRequest("Primero debes iniciar el proyecto.");
    }
    return projectsRepository.updateUserProject(userProject.id, input);
  },

  async completeTask(projectId: string, taskId: string, userId: string) {
    const project = await projectsRepository.findProjectById(projectId);
    if (!project) throw HttpError.notFound("Proyecto no encontrado.");

    const task = await projectsRepository.findTask(taskId);
    if (!task || task.projectId !== projectId) {
      throw HttpError.notFound("Tarea no encontrada en este proyecto.");
    }

    let userProject = await projectsRepository.findUserProject(userId, projectId);
    userProject ??= await projectsRepository.createUserProject(userId, projectId);

    await projectsRepository.upsertTaskProgress(userProject.id, taskId);

    const refreshed = await projectsRepository.findUserProject(userId, projectId);
    const completedCount = refreshed?.progress.filter((p) => p.completedAt).length ?? 0;
    const allDone = completedCount >= project.tasks.length;

    let xpResult = { awarded: 0, alreadyAwarded: false, leveledUp: false };
    if (allDone && refreshed && refreshed.status !== "COMPLETED") {
      await projectsRepository.completeUserProject(refreshed.id);
      const amount = PROJECT_XP_BY_LEVEL[project.level];
      xpResult = await awardXpAndCheckProgress(userId, amount, "PROJECT", projectId);
      await recordProgressEvent(userId, "project_completed", { projectId });
    }

    return {
      completedTaskCount: completedCount,
      taskCount: project.tasks.length,
      projectCompleted: allDone,
      xpAwarded: xpResult.awarded,
      alreadyAwarded: xpResult.alreadyAwarded,
      leveledUp: xpResult.leveledUp,
    };
  },
};
