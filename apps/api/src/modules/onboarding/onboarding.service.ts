import type { OnboardingInput } from "@codeforge/validators";
import type { OnboardingResult } from "@codeforge/types";
import { prisma } from "@codeforge/database";
import { HttpError } from "../../lib/http-error.js";
import { toAuthUser } from "../users/user.mapper.js";
import { DIAGNOSTIC_QUIZ, getPublicDiagnosticQuiz } from "./diagnostic-quiz.js";
import { buildRoadmap } from "./learning-path.js";

const SKILL_NAMES: Record<string, string> = {
  "semantic-html": "HTML semántico",
  "css-layout": "Modelo de caja CSS",
  flexbox: "Flexbox",
  "javascript-fundamentals": "Fundamentos de JavaScript",
  "async-javascript": "JavaScript asíncrono",
  dom: "DOM",
  git: "Git",
  "responsive-design": "Diseño responsive",
};

function scoreAssessment(answers: OnboardingInput["assessmentAnswers"]) {
  const bySkill = new Map<string, { correct: number; total: number }>();

  for (const question of DIAGNOSTIC_QUIZ) {
    const answer = answers.find((a) => a.questionId === question.id);
    const bucket = bySkill.get(question.skillSlug) ?? { correct: 0, total: 0 };
    bucket.total += 1;
    if (answer && answer.optionId === question.correctOptionId) bucket.correct += 1;
    bySkill.set(question.skillSlug, bucket);
  }

  const totalCorrect = [...bySkill.values()].reduce((sum, b) => sum + b.correct, 0);
  const totalQuestions = DIAGNOSTIC_QUIZ.length;
  const score =
    totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

  return { bySkill, score };
}

export const onboardingService = {
  getQuiz() {
    return getPublicDiagnosticQuiz();
  },

  async complete(userId: string, input: OnboardingInput): Promise<OnboardingResult> {
    const profile = await prisma.profile.findUnique({ where: { userId } });
    if (!profile) throw HttpError.notFound("Perfil no encontrado.");

    const { bySkill, score } = scoreAssessment(input.assessmentAnswers);

    const strengths: string[] = [];
    const recommendations: string[] = [];

    for (const [skillSlug, result] of bySkill) {
      const ratio = result.total > 0 ? result.correct / result.total : 0;
      const skill = await prisma.skill.findUnique({ where: { slug: skillSlug } });
      if (!skill) continue;

      const isWeak = ratio < 0.5;
      const masteryScore = Math.round(ratio * 40); // La evaluación inicial nunca otorga maestría alta por sí sola.

      await prisma.userSkill.upsert({
        where: { userId_skillId: { userId, skillId: skill.id } },
        update: { masteryScore, isWeak, lastPracticedAt: new Date() },
        create: {
          userId,
          skillId: skill.id,
          masteryScore,
          isWeak,
          lastPracticedAt: new Date(),
        },
      });

      const label = SKILL_NAMES[skillSlug] ?? skill.name;
      if (isWeak) {
        recommendations.push(`Te recomendamos repasar ${label}.`);
      } else {
        strengths.push(label);
      }
    }

    const roadmap = buildRoadmap(input.goal, input.experienceLevel);
    const courses = await prisma.course.findMany({
      where: { slug: { in: roadmap.map((r) => r.courseSlug) } },
    });
    const courseBySlug = new Map(courses.map((c) => [c.slug, c]));

    await prisma.learningPath.upsert({
      where: { userId },
      update: { goal: input.goal },
      create: { userId, goal: input.goal },
    });
    const learningPath = await prisma.learningPath.findUniqueOrThrow({
      where: { userId },
    });

    await prisma.learningPathItem.deleteMany({
      where: { learningPathId: learningPath.id },
    });

    const items: OnboardingResult["learningPath"]["items"] = [];
    let order = 0;
    for (const roadmapItem of roadmap) {
      const course = courseBySlug.get(roadmapItem.courseSlug);
      if (!course) continue; // Curso aún no sembrado; se omite en vez de romper el flujo.
      order += 1;
      await prisma.learningPathItem.create({
        data: {
          learningPathId: learningPath.id,
          courseId: course.id,
          order,
          isRequired: roadmapItem.isRequired,
          unlockedAt: order === 1 ? new Date() : null,
        },
      });
      items.push({
        courseSlug: course.slug,
        courseTitle: course.title,
        order,
        isRequired: roadmapItem.isRequired,
      });
    }

    await prisma.profile.update({
      where: { userId },
      data: {
        goal: input.goal,
        experienceLevel: input.experienceLevel,
        onboardingCompletedAt: new Date(),
      },
    });

    const user = await prisma.user.findUniqueOrThrow({
      where: { id: userId },
      include: { profile: true },
    });

    return {
      profile: toAuthUser(user).profile,
      learningPath: { goal: input.goal, items },
      assessment: { score, strengths, recommendations },
    };
  },
};
