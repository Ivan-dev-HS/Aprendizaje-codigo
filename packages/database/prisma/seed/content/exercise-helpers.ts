import { prisma } from "../../../src/client.js";
import type { Difficulty, ExercisePrompt, ExerciseType } from "@codeforge/types";

const POINTS_BY_DIFFICULTY: Record<Difficulty, number> = {
  EASY: 10,
  MEDIUM: 25,
  HARD: 50,
};

export interface ExerciseSeed {
  slug: string;
  title: string;
  description: string;
  type: ExerciseType;
  difficulty: Difficulty;
  estimatedMinutes: number;
  skillSlug: string;
  prompt: ExercisePrompt;
  hints: [string, string, string];
  solution: unknown;
  explanation: string;
}

export async function seedExercises(exercises: ExerciseSeed[]): Promise<number> {
  let count = 0;
  for (const ex of exercises) {
    const skill = await prisma.skill.findUnique({ where: { slug: ex.skillSlug } });
    if (!skill)
      throw new Error(
        `Skill "${ex.skillSlug}" no encontrada para el ejercicio ${ex.slug}`,
      );

    await prisma.exercise.upsert({
      where: { slug: ex.slug },
      update: {
        title: ex.title,
        description: ex.description,
        type: ex.type,
        difficulty: ex.difficulty,
        points: POINTS_BY_DIFFICULTY[ex.difficulty],
        estimatedMinutes: ex.estimatedMinutes,
        skillId: skill.id,
        prompt: ex.prompt as unknown as object,
        hints: ex.hints as unknown as object,
        solution: ex.solution as object,
        explanation: ex.explanation,
      },
      create: {
        slug: ex.slug,
        title: ex.title,
        description: ex.description,
        type: ex.type,
        difficulty: ex.difficulty,
        points: POINTS_BY_DIFFICULTY[ex.difficulty],
        estimatedMinutes: ex.estimatedMinutes,
        skillId: skill.id,
        prompt: ex.prompt as unknown as object,
        hints: ex.hints as unknown as object,
        solution: ex.solution as object,
        explanation: ex.explanation,
      },
    });
    count += 1;
  }
  return count;
}
