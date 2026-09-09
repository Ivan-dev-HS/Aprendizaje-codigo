import { prisma } from "../../src/client.js";
import type { XpSource } from "../../generated/client/index.js";

/**
 * Retos diarios/semanales (sección 41-43 de SPEC.md). `criteria` sigue la
 * misma forma que `MissionCriteria` de
 * `apps/api/src/modules/gamification/missions.service.ts`.
 */
type MissionCriteria =
  | { kind: "XP_EARNED"; target: number }
  | { kind: "XP_SOURCE_COUNT"; source: XpSource; target: number };

interface MissionSeed {
  slug: string;
  title: string;
  description: string;
  period: "DAILY" | "WEEKLY";
  xpReward: number;
  criteria: MissionCriteria;
}

const MISSIONS: MissionSeed[] = [
  {
    slug: "diaria-1-leccion",
    title: "Completa 1 lección hoy",
    description: "Termina al menos una lección hoy.",
    period: "DAILY",
    xpReward: 15,
    criteria: { kind: "XP_SOURCE_COUNT", source: "LESSON", target: 1 },
  },
  {
    slug: "diaria-2-ejercicios",
    title: "Resuelve 2 ejercicios hoy",
    description: "Practica con al menos dos ejercicios hoy.",
    period: "DAILY",
    xpReward: 20,
    criteria: { kind: "XP_SOURCE_COUNT", source: "EXERCISE", target: 2 },
  },
  {
    slug: "diaria-50-xp",
    title: "Gana 50 XP hoy",
    description: "Acumula 50 XP haciendo lo que quieras hoy.",
    period: "DAILY",
    xpReward: 25,
    criteria: { kind: "XP_EARNED", target: 50 },
  },
  {
    slug: "semanal-5-lecciones",
    title: "Completa 5 lecciones esta semana",
    description: "Termina cinco lecciones a lo largo de la semana.",
    period: "WEEKLY",
    xpReward: 60,
    criteria: { kind: "XP_SOURCE_COUNT", source: "LESSON", target: 5 },
  },
  {
    slug: "semanal-10-ejercicios",
    title: "Resuelve 10 ejercicios esta semana",
    description: "Practica con diez ejercicios a lo largo de la semana.",
    period: "WEEKLY",
    xpReward: 80,
    criteria: { kind: "XP_SOURCE_COUNT", source: "EXERCISE", target: 10 },
  },
  {
    slug: "semanal-300-xp",
    title: "Gana 300 XP esta semana",
    description: "Acumula 300 XP haciendo lo que quieras esta semana.",
    period: "WEEKLY",
    xpReward: 100,
    criteria: { kind: "XP_EARNED", target: 300 },
  },
];

export async function seedMissions(): Promise<number> {
  for (const m of MISSIONS) {
    await prisma.mission.upsert({
      where: { slug: m.slug },
      update: {
        title: m.title,
        description: m.description,
        period: m.period,
        xpReward: m.xpReward,
        criteria: m.criteria,
      },
      create: {
        slug: m.slug,
        title: m.title,
        description: m.description,
        period: m.period,
        xpReward: m.xpReward,
        criteria: m.criteria,
      },
    });
  }
  console.log(`  ✔ ${MISSIONS.length} misiones diarias/semanales`);
  return MISSIONS.length;
}
