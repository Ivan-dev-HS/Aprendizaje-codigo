import { prisma } from "../../src/client.js";
import type { XpSource } from "../../generated/client/index.js";

/**
 * Secciones 41-43 de SPEC.md: badges/achievements reales, no placeholders.
 * `criteria` sigue la misma forma que `AchievementCriteria` de
 * `apps/api/src/modules/gamification/achievements.service.ts` (duplicado a
 * propósito: `packages/database` no depende de `apps/api`) — se comprueban
 * todos tras cada XP real (ver `progress.service.ts`).
 */
type AchievementCriteria =
  | { kind: "XP_SOURCE_COUNT"; source: XpSource; count: number }
  | { kind: "STREAK_DAYS"; days: number }
  | { kind: "LEVEL"; level: number }
  | { kind: "XP_TOTAL"; amount: number };

interface AchievementSeed {
  slug: string;
  title: string;
  description: string;
  icon: string;
  xpReward: number;
  criteria: AchievementCriteria;
}

const ACHIEVEMENTS: AchievementSeed[] = [
  {
    slug: "primer-paso",
    title: "Primer paso",
    description: "Completa tu primera lección.",
    icon: "🌱",
    xpReward: 10,
    criteria: { kind: "XP_SOURCE_COUNT", source: "LESSON", count: 1 },
  },
  {
    slug: "estudiante-dedicado",
    title: "Estudiante dedicado",
    description: "Completa 10 lecciones.",
    icon: "📘",
    xpReward: 30,
    criteria: { kind: "XP_SOURCE_COUNT", source: "LESSON", count: 10 },
  },
  {
    slug: "erudito",
    title: "Erudito",
    description: "Completa 25 lecciones.",
    icon: "🎓",
    xpReward: 75,
    criteria: { kind: "XP_SOURCE_COUNT", source: "LESSON", count: 25 },
  },
  {
    slug: "primer-ejercicio",
    title: "Manos a la obra",
    description: "Resuelve tu primer ejercicio.",
    icon: "✍️",
    xpReward: 10,
    criteria: { kind: "XP_SOURCE_COUNT", source: "EXERCISE", count: 1 },
  },
  {
    slug: "practicante",
    title: "Practicante",
    description: "Resuelve 10 ejercicios.",
    icon: "🛠️",
    xpReward: 40,
    criteria: { kind: "XP_SOURCE_COUNT", source: "EXERCISE", count: 10 },
  },
  {
    slug: "maestro-de-ejercicios",
    title: "Maestro de ejercicios",
    description: "Resuelve 20 ejercicios.",
    icon: "🏋️",
    xpReward: 80,
    criteria: { kind: "XP_SOURCE_COUNT", source: "EXERCISE", count: 20 },
  },
  {
    slug: "detective-de-bugs",
    title: "Detective de bugs",
    description: "Resuelve tu primer caso real de diagnóstico.",
    icon: "🔍",
    xpReward: 15,
    criteria: { kind: "XP_SOURCE_COUNT", source: "CASE", count: 1 },
  },
  {
    slug: "cazador-de-errores",
    title: "Cazador de errores",
    description: "Resuelve 8 casos reales de diagnóstico.",
    icon: "🐛",
    xpReward: 50,
    criteria: { kind: "XP_SOURCE_COUNT", source: "CASE", count: 8 },
  },
  {
    slug: "primer-proyecto",
    title: "Primer proyecto",
    description: "Completa tu primer proyecto real.",
    icon: "🚀",
    xpReward: 60,
    criteria: { kind: "XP_SOURCE_COUNT", source: "PROJECT", count: 1 },
  },
  {
    slug: "constructor",
    title: "Constructor",
    description: "Completa 3 proyectos reales.",
    icon: "🏗️",
    xpReward: 150,
    criteria: { kind: "XP_SOURCE_COUNT", source: "PROJECT", count: 3 },
  },
  {
    slug: "primer-ticket",
    title: "Día uno en Nexora Tech",
    description: "Completa tu primer ticket en el sprint board compartido.",
    icon: "🎫",
    xpReward: 15,
    criteria: { kind: "XP_SOURCE_COUNT", source: "TICKET", count: 1 },
  },
  {
    slug: "miembro-del-equipo",
    title: "Miembro del equipo",
    description: "Completa 5 tickets en Nexora Tech.",
    icon: "🤝",
    xpReward: 50,
    criteria: { kind: "XP_SOURCE_COUNT", source: "TICKET", count: 5 },
  },
  {
    slug: "revisor-de-codigo",
    title: "Revisor de código",
    description: "Completa tu primer ejercicio de code review.",
    icon: "🧐",
    xpReward: 15,
    criteria: { kind: "XP_SOURCE_COUNT", source: "CODE_REVIEW", count: 1 },
  },
  {
    slug: "ojo-de-aguila",
    title: "Ojo de águila",
    description: "Completa 3 ejercicios de code review.",
    icon: "🦅",
    xpReward: 40,
    criteria: { kind: "XP_SOURCE_COUNT", source: "CODE_REVIEW", count: 3 },
  },
  {
    slug: "primera-entrevista",
    title: "Primera entrevista",
    description: "Completa tu primera simulación de entrevista.",
    icon: "🎙️",
    xpReward: 30,
    criteria: { kind: "XP_SOURCE_COUNT", source: "INTERVIEW", count: 1 },
  },
  {
    slug: "listo-para-entrevistar",
    title: "Listo para entrevistar",
    description: "Completa 4 simulaciones de entrevista distintas.",
    icon: "💼",
    xpReward: 100,
    criteria: { kind: "XP_SOURCE_COUNT", source: "INTERVIEW", count: 4 },
  },
  {
    slug: "racha-de-3-dias",
    title: "Racha de 3 días",
    description: "Practica 3 días seguidos.",
    icon: "🔥",
    xpReward: 15,
    criteria: { kind: "STREAK_DAYS", days: 3 },
  },
  {
    slug: "racha-de-7-dias",
    title: "Racha de 7 días",
    description: "Practica 7 días seguidos.",
    icon: "🔥",
    xpReward: 50,
    criteria: { kind: "STREAK_DAYS", days: 7 },
  },
  {
    slug: "racha-de-30-dias",
    title: "Racha de 30 días",
    description: "Practica 30 días seguidos.",
    icon: "🔥",
    xpReward: 300,
    criteria: { kind: "STREAK_DAYS", days: 30 },
  },
  {
    slug: "nivel-5",
    title: "Nivel 5",
    description: "Alcanza el nivel 5.",
    icon: "⭐",
    xpReward: 0,
    criteria: { kind: "LEVEL", level: 5 },
  },
  {
    slug: "nivel-10",
    title: "Nivel 10",
    description: "Alcanza el nivel 10.",
    icon: "🌟",
    xpReward: 0,
    criteria: { kind: "LEVEL", level: 10 },
  },
  {
    slug: "coleccionista-de-xp",
    title: "Coleccionista de XP",
    description: "Acumula 1000 XP en total.",
    icon: "💎",
    xpReward: 0,
    criteria: { kind: "XP_TOTAL", amount: 1000 },
  },
];

export async function seedAchievements(): Promise<number> {
  for (const a of ACHIEVEMENTS) {
    await prisma.achievement.upsert({
      where: { slug: a.slug },
      update: {
        title: a.title,
        description: a.description,
        icon: a.icon,
        xpReward: a.xpReward,
        criteria: a.criteria,
      },
      create: {
        slug: a.slug,
        title: a.title,
        description: a.description,
        icon: a.icon,
        xpReward: a.xpReward,
        criteria: a.criteria,
      },
    });
  }
  console.log(`  ✔ ${ACHIEVEMENTS.length} logros reales`);
  return ACHIEVEMENTS.length;
}
