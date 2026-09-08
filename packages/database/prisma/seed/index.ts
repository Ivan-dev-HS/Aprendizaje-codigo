import { prisma } from "../../src/client.js";
import { seedFeatureFlags } from "./feature-flags.js";

/**
 * Punto de entrada del seed. Idempotente (sección 98): ejecutarlo varias veces
 * no duplica datos, siempre usa `upsert` sobre una clave única estable
 * (slug/email/key). Cada fase añade aquí su propio seeder.
 */
async function main() {
  console.log("Sembrando base de datos de CodeForge…");

  await seedFeatureFlags();

  // Fase 2+: seedUsers, seedCourses, seedExercises, seedCases, seedProjects,
  // seedCompany, seedInterviews, seedAchievements...

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
