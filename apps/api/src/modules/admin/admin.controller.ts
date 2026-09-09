import type { Request, Response } from "express";
import {
  adminListQuerySchema,
  adminUpdateFeatureFlagSchema,
  adminUpdateUserRoleSchema,
  adminUserListQuerySchema,
} from "@codeforge/validators";
import { HttpError } from "../../lib/http-error.js";
import { getAnalytics } from "./analytics.service.js";
import { listAuditLog, writeAuditLog } from "./audit-log.service.js";
import { featureFlagsAdminService } from "./feature-flags-admin.service.js";
import { usersAdminService } from "./users-admin.service.js";

export const adminController = {
  async listUsers(req: Request, res: Response) {
    const query = adminUserListQuerySchema.parse(req.query);
    const result = await usersAdminService.list(
      { q: query.q, role: query.role },
      query.page,
      query.pageSize,
    );
    res.status(200).json(result);
  },

  async updateUserRole(req: Request, res: Response) {
    if (!req.user) throw HttpError.unauthorized();
    const input = adminUpdateUserRoleSchema.parse(req.body);
    const user = await usersAdminService.updateRole(
      req.params.id as string,
      input.role,
      req.user.sub,
    );
    await writeAuditLog(req.user.sub, "UPDATE", "User", user.id, { role: input.role });
    res.status(200).json({
      item: {
        id: user.id,
        email: user.email,
        role: user.role,
        displayName: user.profile?.displayName ?? "",
      },
    });
  },

  async analytics(_req: Request, res: Response) {
    const data = await getAnalytics();
    res.status(200).json(data);
  },

  async listAuditLog(req: Request, res: Response) {
    const query = adminListQuerySchema.parse(req.query);
    const result = await listAuditLog(query.page, query.pageSize);
    res.status(200).json(result);
  },

  async listFeatureFlags(_req: Request, res: Response) {
    const items = await featureFlagsAdminService.list();
    res.status(200).json({ items });
  },

  async updateFeatureFlag(req: Request, res: Response) {
    if (!req.user) throw HttpError.unauthorized();
    const input = adminUpdateFeatureFlagSchema.parse(req.body);
    const flag = await featureFlagsAdminService.update(
      req.params.key as string,
      input.isEnabled,
      input.description,
    );
    await writeAuditLog(req.user.sub, "UPDATE", "FeatureFlag", flag.key, {
      isEnabled: input.isEnabled,
    });
    res.status(200).json({ item: flag });
  },
};
