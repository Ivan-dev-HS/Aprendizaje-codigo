import type { UpdateProfileInput } from "@codeforge/validators";
import { prisma } from "@codeforge/database";
import { HttpError } from "../../lib/http-error.js";
import { toAuthUser } from "./user.mapper.js";

export const usersService = {
  async getById(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });
    if (!user) throw HttpError.notFound("Usuario no encontrado.");
    return toAuthUser(user);
  },

  async updateProfile(userId: string, input: UpdateProfileInput) {
    await prisma.profile.update({
      where: { userId },
      data: {
        ...(input.displayName !== undefined ? { displayName: input.displayName } : {}),
        ...(input.bio !== undefined ? { bio: input.bio } : {}),
        ...(input.avatarUrl !== undefined ? { avatarUrl: input.avatarUrl || null } : {}),
      },
    });
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });
    if (!user) throw HttpError.notFound("Usuario no encontrado.");
    return toAuthUser(user);
  },
};
