import bcrypt from "bcryptjs";
import { prisma } from "../../src/client.js";

/**
 * Usuarios de demostración (sección 57/96 de SPEC.md). Credenciales solo
 * válidas en una instancia local de desarrollo — nunca son credenciales reales.
 */
export const DEMO_USERS = [
  {
    email: "demo@example.local",
    username: "demo",
    password: "CodeForge2026!",
    displayName: "Usuario Demo",
    role: "USER" as const,
  },
  {
    email: "admin@example.local",
    username: "admin",
    password: "CodeForge2026!",
    displayName: "Admin CodeForge",
    role: "ADMIN" as const,
  },
];

export async function seedUsers() {
  for (const demoUser of DEMO_USERS) {
    const passwordHash = await bcrypt.hash(demoUser.password, 12);
    await prisma.user.upsert({
      where: { email: demoUser.email },
      update: { role: demoUser.role },
      create: {
        email: demoUser.email,
        username: demoUser.username,
        passwordHash,
        role: demoUser.role,
        profile: {
          create: {
            displayName: demoUser.displayName,
            goal: "FULL_STACK",
            experienceLevel: demoUser.role === "ADMIN" ? "ADVANCED" : "NONE",
            onboardingCompletedAt: demoUser.role === "ADMIN" ? new Date() : null,
          },
        },
      },
    });
  }
  console.log(`  ✔ ${DEMO_USERS.length} usuarios de demostración`);
}
