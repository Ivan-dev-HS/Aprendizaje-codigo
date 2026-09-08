import bcrypt from "bcryptjs";
import type { RegisterInput, LoginInput } from "@codeforge/validators";
import { HttpError } from "../../lib/http-error.js";
import { emailProvider } from "../../lib/email-provider.js";
import {
  generateOpaqueToken,
  hashToken,
  parseExpiresInToMs,
  signAccessToken,
} from "../../lib/tokens.js";
import { env } from "../../config/env.js";
import { toAuthUser } from "../users/user.mapper.js";
import { authRepository } from "./auth.repository.js";

const BCRYPT_ROUNDS = 12;
const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hora

export interface RequestContext {
  userAgent?: string;
  ipAddress?: string;
}

async function issueSession(
  userId: string,
  role: "USER" | "ADMIN",
  username: string,
  ctx: RequestContext,
) {
  const accessToken = signAccessToken({ sub: userId, role, username });
  const refreshToken = generateOpaqueToken();
  const refreshTokenHash = hashToken(refreshToken);
  const expiresAt = new Date(Date.now() + parseExpiresInToMs(env.JWT_REFRESH_EXPIRES_IN));

  await authRepository.createSession({
    userId,
    refreshTokenHash,
    expiresAt,
    userAgent: ctx.userAgent,
    ipAddress: ctx.ipAddress,
  });

  return {
    accessToken,
    accessTokenExpiresAt: new Date(
      Date.now() + parseExpiresInToMs(env.JWT_ACCESS_EXPIRES_IN),
    ).toISOString(),
    refreshToken,
    refreshTokenExpiresAt: expiresAt,
  };
}

export const authService = {
  async register(input: RegisterInput, ctx: RequestContext) {
    const existingEmail = await authRepository.findUserByEmail(input.email);
    if (existingEmail) {
      throw HttpError.conflict("Ya existe una cuenta con ese email.");
    }
    const existingUsername = await authRepository.findUserByUsername(input.username);
    if (existingUsername) {
      throw HttpError.conflict("Ese nombre de usuario ya está en uso.");
    }

    const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);
    const user = await authRepository.createUser({
      email: input.email,
      username: input.username,
      passwordHash,
      displayName: input.displayName,
    });

    const session = await issueSession(user.id, user.role, user.username, ctx);
    return { user: toAuthUser(user), session };
  },

  async login(input: LoginInput, ctx: RequestContext) {
    const user = await authRepository.findUserByEmail(input.email);
    if (!user || !user.isActive) {
      throw HttpError.unauthorized("Email o contraseña incorrectos.");
    }
    const validPassword = await bcrypt.compare(input.password, user.passwordHash);
    if (!validPassword) {
      throw HttpError.unauthorized("Email o contraseña incorrectos.");
    }

    await authRepository.touchLastLogin(user.id);
    const session = await issueSession(user.id, user.role, user.username, ctx);
    return { user: toAuthUser(user), session };
  },

  async refresh(refreshToken: string, ctx: RequestContext) {
    const tokenHash = hashToken(refreshToken);
    const session = await authRepository.findActiveSessionByHash(tokenHash);
    if (!session) {
      throw HttpError.unauthorized("Sesión no válida. Inicia sesión de nuevo.");
    }

    // Rotación: se revoca la sesión usada y se emite una nueva.
    await authRepository.revokeSession(session.id);

    const user = await authRepository.findUserById(session.userId);
    if (!user || !user.isActive) {
      throw HttpError.unauthorized("Sesión no válida. Inicia sesión de nuevo.");
    }

    const newSession = await issueSession(user.id, user.role, user.username, ctx);
    return { user: toAuthUser(user), session: newSession };
  },

  async logout(refreshToken: string | undefined) {
    if (!refreshToken) return;
    const tokenHash = hashToken(refreshToken);
    const session = await authRepository.findActiveSessionByHash(tokenHash);
    if (session) {
      await authRepository.revokeSession(session.id);
    }
  },

  async requestPasswordReset(email: string) {
    const user = await authRepository.findUserByEmail(email);
    // Siempre responde con éxito (evita enumeración de usuarios); solo actúa si existe.
    if (!user) return;

    const token = generateOpaqueToken();
    const tokenHash = hashToken(token);
    await authRepository.createPasswordResetToken({
      userId: user.id,
      tokenHash,
      expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS),
    });

    await emailProvider.send({
      to: user.email,
      subject: "Recupera tu contraseña de CodeForge",
      text: `Usa este token para restablecer tu contraseña (válido 1 hora): ${token}`,
    });
  },

  async confirmPasswordReset(token: string, newPassword: string) {
    const tokenHash = hashToken(token);
    const resetToken = await authRepository.findActivePasswordResetToken(tokenHash);
    if (!resetToken) {
      throw HttpError.badRequest("El enlace de recuperación no es válido o ha expirado.");
    }

    const passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
    await authRepository.updatePassword(resetToken.userId, passwordHash);
    await authRepository.markPasswordResetTokenUsed(resetToken.id);
    // Por seguridad, cambiar la contraseña invalida todas las sesiones activas.
    await authRepository.revokeAllUserSessions(resetToken.userId);
  },
};
