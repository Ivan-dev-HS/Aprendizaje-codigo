import { prisma } from "../../src/client.js";
import { seedFeatureFlags } from "./feature-flags.js";
import { seedUsers } from "./users.js";
import { seedSkills } from "./skills.js";
import { seedCourses } from "./courses.js";
import { seedLessons } from "./lessons.js";
import { seedExerciseContent } from "./exercises.js";

/**
 * Punto de entrada del seed. Idempotente (sección 98): ejecutarlo varias veces
 * no duplica datos, siempre usa `upsert` sobre una clave única estable
 * (slug/email/key). Cada fase añade aquí su propio seeder.
 */
async function main() {
  console.log("Sembrando base de datos de CodeForge…");

  await seedFeatureFlags();
  await seedUsers();
  await seedSkills();
  await seedCourses();
  await seedLessons();
  await seedExerciseContent();

  // Fase 6+: seedCases, seedProjects, seedCompany, seedInterviews,
  // seedAchievements...

  console.log("Seed completado.");
}

main()
  .catch((err) => {
    console.error("Error al sembrar la base de datos:", err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
