import {
  prisma,
  type CaseDomain,
  type CaseKind,
  type Difficulty,
} from "@codeforge/database";

export interface CaseFilters {
  kind?: CaseKind;
  domain?: CaseDomain;
  difficulty?: Difficulty;
}

export const casesRepository = {
  async listPaginated(filters: CaseFilters, page: number, pageSize: number) {
    const where = {
      isPublished: true,
      ...(filters.kind ? { kind: filters.kind } : {}),
      ...(filters.domain ? { domain: filters.domain } : {}),
      ...(filters.difficulty ? { difficulty: filters.difficulty } : {}),
    };

    const [items, total] = await Promise.all([
      prisma.case.findMany({
        where,
        orderBy: [{ difficulty: "asc" }, { title: "asc" }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.case.count({ where }),
    ]);

    return { items, total };
  },

  findById(id: string) {
    return prisma.case.findUnique({ where: { id } });
  },

  async completedSetForUser(userId: string, caseIds: string[]) {
    const completed = await prisma.caseAttempt.findMany({
      where: { userId, caseId: { in: caseIds }, isCorrect: true },
      distinct: ["caseId"],
      select: { caseId: true },
    });
    return new Set(completed.map((c) => c.caseId));
  },

  countAttempts(userId: string, caseId: string) {
    return prisma.caseAttempt.count({ where: { userId, caseId } });
  },

  createAttempt(data: {
    userId: string;
    caseId: string;
    diagnosis: string;
    isCorrect: boolean;
    hintsUsed: number;
    xpAwarded: number;
    postmortem?: unknown;
  }) {
    return prisma.caseAttempt.create({
      data: {
        userId: data.userId,
        caseId: data.caseId,
        diagnosis: data.diagnosis,
        isCorrect: data.isCorrect,
        hintsUsed: data.hintsUsed,
        xpAwarded: data.xpAwarded,
        postmortem: data.postmortem as never,
      },
    });
  },
};
