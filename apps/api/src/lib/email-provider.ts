import { logger } from "./logger.js";

export interface EmailMessage {
  to: string;
  subject: string;
  text: string;
}

export interface EmailProvider {
  send(message: EmailMessage): Promise<void>;
}

/**
 * Implementación por defecto: registra el envío en logs en vez de mandar un
 * email real (sección 96/106 de SPEC.md — no hay proveedor de email real
 * disponible en este entorno). Nunca loguea el cuerpo si contiene un token
 * sensible en claro más allá de lo estrictamente necesario para depurar en
 * desarrollo.
 *
 * Para conectar un proveedor real (Resend, SES, Postmark...), implementa
 * `EmailProvider` y sustituye la instancia exportada más abajo.
 */
export class LoggingEmailProvider implements EmailProvider {
  async send(message: EmailMessage): Promise<void> {
    logger.info({ to: message.to, subject: message.subject }, "Email (mock) enviado");
  }
}

export const emailProvider: EmailProvider = new LoggingEmailProvider();
