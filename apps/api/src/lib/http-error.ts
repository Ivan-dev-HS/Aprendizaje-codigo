/**
 * Error HTTP con código de dominio estable (usado por el frontend para
 * distinguir casos, p.ej. `AUTH_INVALID_CREDENTIALS`) y mensaje seguro para
 * mostrar al usuario. Nunca debe filtrar detalles internos.
 */
export class HttpError extends Error {
  readonly statusCode: number;
  readonly code: string;
  readonly details?: Record<string, string[]>;

  constructor(
    statusCode: number,
    code: string,
    message: string,
    details?: Record<string, string[]>,
  ) {
    super(message);
    this.name = "HttpError";
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }

  static badRequest(message: string, details?: Record<string, string[]>) {
    return new HttpError(400, "BAD_REQUEST", message, details);
  }

  static unauthorized(message = "No autenticado.") {
    return new HttpError(401, "UNAUTHORIZED", message);
  }

  static forbidden(message = "No tienes permisos para realizar esta acción.") {
    return new HttpError(403, "FORBIDDEN", message);
  }

  static notFound(message = "Recurso no encontrado.") {
    return new HttpError(404, "NOT_FOUND", message);
  }

  static conflict(message: string) {
    return new HttpError(409, "CONFLICT", message);
  }

  static tooManyRequests(message = "Demasiadas solicitudes. Inténtalo más tarde.") {
    return new HttpError(429, "TOO_MANY_REQUESTS", message);
  }

  static internal(message = "Ha ocurrido un error inesperado. Inténtalo de nuevo.") {
    return new HttpError(500, "INTERNAL_ERROR", message);
  }
}
