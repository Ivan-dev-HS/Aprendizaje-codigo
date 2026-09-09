import { prisma } from "@codeforge/database";

export const projectsRepository = {
  listProjects() {
    return prisma.project.findMany({
      orderBy: { estimatedHours: "asc" },
      include: { tasks: { select: { id: true } } },
    });
  },

  findProjectBySlug(slug: string) {
    return prisma.project.findUnique({
      where: { slug },
      include: { tasks: { orderBy: { order: "asc" } } },
    });
  },

  findProjectById(id: string) {
    return prisma.project.findUnique({
      where: { id },
      include: { tasks: { orderBy: { order: "asc" } } },
    });
  },

  findUserProjects(userId: string, projectIds: string[]) {
    return prisma.userProject.findMany({
      where: { userId, projectId: { in: projectIds } },
      include: { progress: true },
    });
  },

  findUserProject(userId: string, projectId: string) {
    return prisma.userProject.findUnique({
      where: { userId_projectId: { userId, projectId } },
      include: { progress: true },
    });
  },

  createUserProject(userId: string, projectId: string) {
    return prisma.userProject.create({
      data: { userId, projectId },
      include: { progress: true },
    });
  },

  updateUserProject(
    id: string,
    data: {
      githubUrl?: string;
      demoUrl?: string;
      readme?: string;
      screenshots?: string[];
      technologies?: string[];
    },
  ) {
    return prisma.userProject.update({
      where: { id },
      data: {
        ...(data.githubUrl !== undefined ? { githubUrl: data.githubUrl } : {}),
        ...(data.demoUrl !== undefined ? { demoUrl: data.demoUrl } : {}),
        ...(data.readme !== undefined ? { readme: data.readme } : {}),
        ...(data.screenshots !== undefined
          ? { screenshots: data.screenshots as never }
          : {}),
        ...(data.technologies !== undefined
          ? { technologies: data.technologies as never }
          : {}),
      },
      include: { progress: true },
    });
  },

  completeUserProject(id: string) {
    return prisma.userProject.update({
      where: { id },
      data: { status: "COMPLETED", completedAt: new Date() },
      include: { progress: true },
    });
  },

  upsertTaskProgress(userProjectId: string, taskId: string) {
    return prisma.projectProgress.upsert({
      where: { userProjectId_taskId: { userProjectId, taskId } },
      update: { completedAt: new Date() },
      create: { userProjectId, taskId, completedAt: new Date() },
    });
  },

  findTask(taskId: string) {
    return prisma.projectTask.findUnique({ where: { id: taskId } });
  },

  listCompletedUserProjectsForUser(userId: string) {
    return prisma.userProject.findMany({
      where: { userId, status: "COMPLETED" },
      include: { project: true },
      orderBy: { completedAt: "desc" },
    });
  },
};
