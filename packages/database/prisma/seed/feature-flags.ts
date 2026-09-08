import { prisma } from "../../src/client.js";

/** Feature flags iniciales (sección 86 de SPEC.md). Idempotente vía upsert por `key`. */
export async function seedFeatureFlags() {
  const flags = [
    {
      key: "AI_ASSISTANT",
      isEnabled: false,
      description:
        "Asistente de IA (explainConcept, reviewCode, generateHint...). Interfaz mock hasta conectar un proveedor real.",
    },
    {
      key: "BETA_COMPANY_MODE",
      isEnabled: true,
      description:
        "Simulador de empresa Nexora Tech (tickets, sprints, PRs, code review).",
    },
    {
      key: "CERTIFICATES",
      isEnabled: false,
      description:
        "Emisión de certificados al completar cursos/rutas. Pendiente de diseño.",
    },
  ];

  for (const flag of flags) {
    await prisma.featureFlag.upsert({
      where: { key: flag.key },
      update: { description: flag.description },
      create: flag,
    });
  }

  console.log(`  ✔ ${flags.length} feature flags`);
}
