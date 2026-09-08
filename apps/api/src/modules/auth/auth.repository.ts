import { prisma } from "@codeforge/database";

export const authRepository = {
  findUserByEmail(email: string) {
    return prisma.user.findUnique({ where: { email }, include: { profile: true } });
  },

  findUserByUsername(username: string) {
    return prisma.user.findUnique({ where: { username } });
  },

  findUserById(id: string) {
    return prisma.user.findUnique({ where: { id }, include: { profile: true } });
  },

  createUser(data: {
    email: string;
    username: string;
    passwordHash: string;
    displayName: string;
  }) {
    return prisma.user.create({
      data: {
        email: data.email,
        username: data.username,
        passwordHash: data.passwordHash,
        profile: { create: { displayName: data.displayName } },
      },
      include: { profile: true },
    });
  },

  touchLastLogin(userId: string) {
    return prisma.user.update({
      where: { id: userId },
      data: { lastLoginAt: new Date() },
    });
  },

  createSession(data: {
    userId: string;
    refreshTokenHash: string;
    expiresAt: Date;
    userAgent?: string;
    ipAddress?: string;
  }) {
    return prisma.session.create({ data });
  },

  findActiveSessionByHash(refreshTokenHash: string) {
    return prisma.session.findFirst({
      where: { refreshTokenHash, revokedAt: null, expiresAt: { gt: new Date() } },
    });
  },

  revokeSession(id: string) {
    return prisma.session.update({ where: { id }, data: { revokedAt: new Date() } });
  },

  revokeAllUserSessions(userId: string) {
    return prisma.session.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  },

  createPasswordResetToken(data: { userId: string; tokenHash: string; expiresAt: Date }) {
    return prisma.passwordResetToken.create({ data });
  },

  findActivePasswordResetToken(tokenHash: string) {
    return prisma.passwordResetToken.findFirst({
      where: { tokenHash, usedAt: null, expiresAt: { gt: new Date() } },
    });
  },

  markPasswordResetTokenUsed(id: string) {
    return prisma.passwordResetToken.update({
      where: { id },
      data: { usedAt: new Date() },
    });
  },

  updatePassword(userId: string, passwordHash: string) {
    return prisma.user.update({ where: { id: userId }, data: { passwordHash } });
  },
};
