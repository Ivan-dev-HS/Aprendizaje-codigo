import { prisma, type Difficulty, type ExerciseType } from "@codeforge/database";

export interface ExerciseFilters {
  skillSlug?: string;
  difficulty?: Difficulty;
  type?: ExerciseType;
}

export const exercisesRepository = {
  async listPaginated(filters: ExerciseFilters, page: number, pageSize: number) {
    const where = {
      isPublished: true,
      ...(filters.difficulty ? { difficulty: filters.difficulty } : {}),
      ...(filters.type ? { type: filters.type } : {}),
      ...(filters.skillSlug ? { skill: { slug: filters.skillSlug } } : {}),
    };

    const [items, total] = await Promise.all([
      prisma.exercise.findMany({
        where,
        include: { skill: true },
        orderBy: [{ difficulty: "asc" }, { title: "asc" }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.exercise.count({ where }),
    ]);

    return { items, total };
  },

  findById(id: string) {
    return prisma.exercise.findUnique({ where: { id }, include: { skill: true } });
  },

  async attemptStatsForUser(userId: string, exerciseIds: string[]) {
    const [counts, completed] = await Promise.all([
      prisma.exerciseAttempt.groupBy({
        by: ["exerciseId"],
        where: { userId, exerciseId: { in: exerciseIds } },
        _count: { _all: true },
      }),
      prisma.exerciseAttempt.findMany({
        where: { userId, exerciseId: { in: exerciseIds }, isCorrect: true },
        distinct: ["exerciseId"],
        select: { exerciseId: true },
      }),
    ]);

    const attemptCountByExercise = new Map(
      counts.map((c) => [c.exerciseId, c._count._all]),
    );
    const completedSet = new Set(completed.map((c) => c.exerciseId));

    return { attemptCountByExercise, completedSet };
  },

  countAttempts(userId: string, exerciseId: string) {
    return prisma.exerciseAttempt.count({ where: { userId, exerciseId } });
  },

  createAttempt(data: {
    userId: string;
    exerciseId: string;
    answer: unknown;
    isCorrect: boolean;
    score: number;
    xpAwarded: number;
    hintsUsed: number;
    timeSpentSeconds: number;
    attemptNumber: number;
  }) {
    return prisma.exerciseAttempt.create({
      data: {
        userId: data.userId,
        exerciseId: data.exerciseId,
        answer: data.answer as never,
        isCorrect: data.isCorrect,
        score: data.score,
        xpAwarded: data.xpAwarded,
        hintsUsed: data.hintsUsed,
        timeSpentSeconds: data.timeSpentSeconds,
        attemptNumber: data.attemptNumber,
      },
    });
  },
};
