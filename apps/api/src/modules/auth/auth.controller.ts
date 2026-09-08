import type { Request, Response } from "express";
import {
  loginSchema,
  passwordResetConfirmSchema,
  passwordResetRequestSchema,
  registerSchema,
} from "@codeforge/validators";
import { env } from "../../config/env.js";
import { authService } from "./auth.service.js";

const REFRESH_COOKIE_NAME = "refreshToken";
const REFRESH_COOKIE_PATH = "/api/v1/auth";

function setRefreshCookie(res: Response, token: string, expiresAt: Date) {
  res.cookie(REFRESH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: env.COOKIE_SECURE,
    sameSite: "lax",
    domain: env.COOKIE_DOMAIN === "localhost" ? undefined : env.COOKIE_DOMAIN,
    path: REFRESH_COOKIE_PATH,
    expires: expiresAt,
  });
}

function clearRefreshCookie(res: Response) {
  res.clearCookie(REFRESH_COOKIE_NAME, {
    httpOnly: true,
    secure: env.COOKIE_SECURE,
    sameSite: "lax",
    domain: env.COOKIE_DOMAIN === "localhost" ? undefined : env.COOKIE_DOMAIN,
    path: REFRESH_COOKIE_PATH,
  });
}

function requestContext(req: Request) {
  return { userAgent: req.header("user-agent"), ipAddress: req.ip };
}

export const authController = {
  async register(req: Request, res: Response) {
    const input = registerSchema.parse(req.body);
    const { user, session } = await authService.register(input, requestContext(req));
    setRefreshCookie(res, session.refreshToken, session.refreshTokenExpiresAt);
    res.status(201).json({
      user,
      accessToken: session.accessToken,
      accessTokenExpiresAt: session.accessTokenExpiresAt,
    });
  },

  async login(req: Request, res: Response) {
    const input = loginSchema.parse(req.body);
    const { user, session } = await authService.login(input, requestContext(req));
    setRefreshCookie(res, session.refreshToken, session.refreshTokenExpiresAt);
    res.status(200).json({
      user,
      accessToken: session.accessToken,
      accessTokenExpiresAt: session.accessTokenExpiresAt,
    });
  },

  async refresh(req: Request, res: Response) {
    const refreshToken = req.cookies?.[REFRESH_COOKIE_NAME] as string | undefined;
    if (!refreshToken) {
      res
        .status(401)
        .json({ error: { code: "UNAUTHORIZED", message: "No hay sesión activa." } });
      return;
    }
    const { user, session } = await authService.refresh(
      refreshToken,
      requestContext(req),
    );
    setRefreshCookie(res, session.refreshToken, session.refreshTokenExpiresAt);
    res.status(200).json({
      user,
      accessToken: session.accessToken,
      accessTokenExpiresAt: session.accessTokenExpiresAt,
    });
  },

  async logout(req: Request, res: Response) {
    const refreshToken = req.cookies?.[REFRESH_COOKIE_NAME] as string | undefined;
    await authService.logout(refreshToken);
    clearRefreshCookie(res);
    res.status(204).send();
  },

  async requestPasswordReset(req: Request, res: Response) {
    const input = passwordResetRequestSchema.parse(req.body);
    await authService.requestPasswordReset(input.email);
    res.status(200).json({
      message:
        "Si existe una cuenta con ese email, recibirás instrucciones para recuperar tu contraseña.",
    });
  },

  async confirmPasswordReset(req: Request, res: Response) {
    const input = passwordResetConfirmSchema.parse(req.body);
    await authService.confirmPasswordReset(input.token, input.newPassword);
    res
      .status(200)
      .json({ message: "Contraseña actualizada. Ya puedes iniciar sesión." });
  },
};
