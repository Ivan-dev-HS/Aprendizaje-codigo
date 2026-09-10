import { logger } from "./logger.js";

/**
 * Interfaz para un futuro asistente de IA (sección 85-89 de SPEC.md),
 * referenciada por la feature flag `AI_ASSISTANT` (desactivada por defecto,
 * ver `packages/database/prisma/seed/feature-flags.ts`). Ningún endpoint la
 * usa todavía — no hay proveedor de IA real disponible en este entorno ni
 * una clave de API que conectar — pero la interfaz ya existe para que
 * enchufar un proveedor real (Anthropic, OpenAI...) el día de mañana sea
 * implementar `AiProvider` y sustituir la instancia exportada más abajo,
 * igual que `EmailProvider`. Construir la UI/endpoints reales sobre un mock
 * sería aparentar una función que no funciona de verdad.
 */
export interface AiProvider {
  explainConcept(input: {
    concept: string;
    context?: string;
  }): Promise<{ explanation: string }>;
  reviewCode(input: { code: string; language: string }): Promise<{ review: string }>;
  generateHint(input: {
    exerciseTitle: string;
    level: number;
  }): Promise<{ hint: string }>;
  simulateInterview(input: {
    question: string;
    answer: string;
  }): Promise<{ feedback: string }>;
  generateExercise(input: {
    skill: string;
    difficulty: string;
  }): Promise<{ title: string; description: string }>;
}

const MOCK_NOTICE =
  "[Mock] No hay ningún proveedor de IA real conectado en este entorno. Esta respuesta es un placeholder fijo, no una generación real.";

/** Implementación mock: nunca llama a ningún modelo de lenguaje. */
export class MockAiProvider implements AiProvider {
  async explainConcept(input: { concept: string }) {
    logger.info({ concept: input.concept }, "AiProvider (mock) explainConcept llamado");
    return { explanation: MOCK_NOTICE };
  }

  async reviewCode(input: { language: string }) {
    logger.info({ language: input.language }, "AiProvider (mock) reviewCode llamado");
    return { review: MOCK_NOTICE };
  }

  async generateHint(input: { exerciseTitle: string; level: number }) {
    logger.info(input, "AiProvider (mock) generateHint llamado");
    return { hint: MOCK_NOTICE };
  }

  async simulateInterview() {
    logger.info({}, "AiProvider (mock) simulateInterview llamado");
    return { feedback: MOCK_NOTICE };
  }

  async generateExercise(input: { skill: string; difficulty: string }) {
    logger.info(input, "AiProvider (mock) generateExercise llamado");
    return { title: MOCK_NOTICE, description: MOCK_NOTICE };
  }
}

export const aiProvider: AiProvider = new MockAiProvider();
