import type { AuthUser } from "@codeforge/types";
import type { Profile, User } from "@codeforge/database";

export function toAuthUser(user: User & { profile: Profile | null }): AuthUser {
  if (!user.profile) {
    throw new Error(
      `El usuario ${user.id} no tiene perfil asociado (invariante violado).`,
    );
  }
  return {
    id: user.id,
    email: user.email,
    username: user.username,
    role: user.role,
    createdAt: user.createdAt.toISOString(),
    profile: {
      displayName: user.profile.displayName,
      avatarUrl: user.profile.avatarUrl,
      bio: user.profile.bio,
      goal: user.profile.goal,
      experienceLevel: user.profile.experienceLevel,
      level: user.profile.level,
      totalXp: user.profile.totalXp,
      streakDays: user.profile.streakDays,
      readinessScore: user.profile.readinessScore,
      onboardingCompletedAt: user.profile.onboardingCompletedAt?.toISOString() ?? null,
    },
  };
}
