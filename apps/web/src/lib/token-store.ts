/**
 * El access token vive solo en memoria (nunca en localStorage/sessionStorage)
 * para reducir la superficie de robo por XSS. Al recargar la página se pierde
 * y se recupera silenciosamente vía POST /auth/refresh (cookie httpOnly).
 */
let accessToken: string | null = null;
let onAuthFailure: (() => void) | null = null;

export function getAccessToken(): string | null {
  return accessToken;
}

export function setAccessToken(token: string | null): void {
  accessToken = token;
}

/** Registrado por <AuthProvider> para reaccionar cuando el refresh falla definitivamente. */
export function setOnAuthFailure(handler: (() => void) | null): void {
  onAuthFailure = handler;
}

export function notifyAuthFailure(): void {
  onAuthFailure?.();
}
