import { Router, type Request, type Response } from "express";
import { z, type ZodTypeAny } from "zod";
import { paginationQuerySchema } from "@codeforge/validators";
import { HttpError } from "../../lib/http-error.js";
import { asyncHandler } from "../../middleware/error-handler.js";
import { writeAuditLog } from "./audit-log.service.js";

/**
 * Los delegados de Prisma (`prisma.course`, `prisma.skill`...) tienen firmas
 * muy específicas por modelo; esta interfaz mínima solo describe los 5
 * métodos que el CRUD genérico necesita, con `any` deliberado en los
 * argumentos — es el único punto del proyecto donde se acepta, porque es
 * exactamente el tipo de adaptador genérico para el que `any` existe (nunca
 * se usa `any` en el resto del código de dominio).
 */
/* eslint-disable @typescript-eslint/no-explicit-any -- ver comentario arriba */
type PrismaDelegate = {
  findMany: (args?: any) => Promise<any[]>;
  count: (args?: any) => Promise<number>;
  findUnique: (args: any) => Promise<any>;
  create: (args: any) => Promise<any>;
  update: (args: any) => Promise<any>;
  delete: (args: any) => Promise<any>;
};
/* eslint-enable @typescript-eslint/no-explicit-any */

export interface AdminCrudConfig {
  /** Nombre estable para AuditLog.entityType (p.ej. "Course"). */
  entityType: string;
  model: PrismaDelegate;
  createSchema: ZodTypeAny;
  updateSchema: ZodTypeAny;
  /** Campo de texto sobre el que aplica `?q=` (contains, case-insensitive). */
  searchField?: string;
  /** Campos exactos filtrables vía querystring (p.ej. ?status=DONE). */
  filterFields?: string[];
  orderBy?: Record<string, "asc" | "desc">;
  include?: Record<string, unknown>;
}

const listQuerySchema = paginationQuerySchema.extend({ q: z.string().optional() });

/**
 * Fábrica de un router CRUD de administración (list/get/create/update/delete
 * + AuditLog en cada mutación) — sección 46 de SPEC.md pide el mismo CRUD
 * para 10 tipos de contenido distintos; en vez de repetir list/paginación/
 * búsqueda/auditoría 10 veces, se escribe una sola vez aquí y cada entidad
 * solo aporta su configuración (modelo, schemas de validación, campo de
 * búsqueda). Se monta siempre detrás de `requireAuth` + `requireRole("ADMIN")`
 * en `admin.routes.ts`, así que `req.user` está garantizado.
 */
export function createAdminCrudRouter(config: AdminCrudConfig): Router {
  const { entityType, model, createSchema, updateSchema, searchField, orderBy, include } =
    config;
  const filterFields = config.filterFields ?? [];
  const router = Router();

  router.get(
    "/",
    asyncHandler(async (req: Request, res: Response) => {
      const query = listQuerySchema.parse(req.query);
      const where: Record<string, unknown> = {};
      if (searchField && query.q) {
        where[searchField] = { contains: query.q, mode: "insensitive" };
      }
      for (const field of filterFields) {
        const value = req.query[field];
        if (typeof value === "string" && value.length > 0) where[field] = value;
      }

      const [items, total] = await Promise.all([
        model.findMany({
          where,
          ...(orderBy ? { orderBy } : {}),
          ...(include ? { include } : {}),
          skip: (query.page - 1) * query.pageSize,
          take: query.pageSize,
        }),
        model.count({ where }),
      ]);
      res.status(200).json({
        items,
        meta: {
          page: query.page,
          pageSize: query.pageSize,
          total,
          totalPages: Math.max(1, Math.ceil(total / query.pageSize)),
        },
      });
    }),
  );

  router.get(
    "/:id",
    asyncHandler(async (req: Request, res: Response) => {
      const item = await model.findUnique({
        where: { id: req.params.id },
        ...(include ? { include } : {}),
      });
      if (!item) throw HttpError.notFound("No encontrado.");
      res.status(200).json({ item });
    }),
  );

  router.post(
    "/",
    asyncHandler(async (req: Request, res: Response) => {
      if (!req.user) throw HttpError.unauthorized();
      const input: Record<string, unknown> = createSchema.parse(req.body);
      const item = await model.create({ data: input });
      await writeAuditLog(req.user.sub, "CREATE", entityType, item.id as string);
      res.status(201).json({ item });
    }),
  );

  router.patch(
    "/:id",
    asyncHandler(async (req: Request, res: Response) => {
      if (!req.user) throw HttpError.unauthorized();
      const input: Record<string, unknown> = updateSchema.parse(req.body);
      const item = await model.update({ where: { id: req.params.id }, data: input });
      await writeAuditLog(
        req.user.sub,
        "UPDATE",
        entityType,
        req.params.id as string,
        input,
      );
      res.status(200).json({ item });
    }),
  );

  router.delete(
    "/:id",
    asyncHandler(async (req: Request, res: Response) => {
      if (!req.user) throw HttpError.unauthorized();
      await model.delete({ where: { id: req.params.id } });
      await writeAuditLog(req.user.sub, "DELETE", entityType, req.params.id as string);
      res.status(204).send();
    }),
  );

  return router;
}
