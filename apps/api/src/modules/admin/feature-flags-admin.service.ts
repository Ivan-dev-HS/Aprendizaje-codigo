import { prisma } from "@codeforge/database";
import { HttpError } from "../../lib/http-error.js";

export const featureFlagsAdminService = {
  list() {
    return prisma.featureFlag.findMany({ orderBy: { key: "asc" } });
  },

  async update(key: string, isEnabled: boolean, description?: string) {
    const existing = await prisma.featureFlag.findUnique({ where: { key } });
    if (!existing) throw HttpError.notFound("Feature flag no encontrada.");
    return prisma.featureFlag.update({
      where: { key },
      data: { isEnabled, ...(description !== undefined ? { description } : {}) },
    });
  },
};
