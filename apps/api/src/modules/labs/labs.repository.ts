import { prisma } from "@codeforge/database";

export const labsRepository = {
  listPlaygroundSnapshots(userId: string) {
    return prisma.playgroundSnapshot.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      select: { id: true, title: true, updatedAt: true },
    });
  },

  findPlaygroundSnapshot(userId: string, id: string) {
    return prisma.playgroundSnapshot.findFirst({ where: { id, userId } });
  },

  createPlaygroundSnapshot(
    userId: string,
    data: { title: string; html: string; css: string; js: string },
  ) {
    return prisma.playgroundSnapshot.create({ data: { userId, ...data } });
  },

  updatePlaygroundSnapshot(
    id: string,
    data: { title: string; html: string; css: string; js: string },
  ) {
    return prisma.playgroundSnapshot.update({ where: { id }, data });
  },

  deletePlaygroundSnapshot(id: string) {
    return prisma.playgroundSnapshot.delete({ where: { id } });
  },

  findTerminalState(userId: string) {
    return prisma.terminalLabState.findUnique({ where: { userId } });
  },

  upsertTerminalState(userId: string, filesystem: unknown, history: unknown) {
    return prisma.terminalLabState.upsert({
      where: { userId },
      update: { filesystem: filesystem as never, history: history as never },
      create: { userId, filesystem: filesystem as never, history: history as never },
    });
  },

  findGitState(userId: string) {
    return prisma.gitLabState.findUnique({ where: { userId } });
  },

  upsertGitState(userId: string, repoState: unknown) {
    return prisma.gitLabState.upsert({
      where: { userId },
      update: { repoState: repoState as never },
      create: { userId, repoState: repoState as never },
    });
  },

  listSqlDatasets() {
    return prisma.sqlLabDataset.findMany({ orderBy: { title: "asc" } });
  },
};
