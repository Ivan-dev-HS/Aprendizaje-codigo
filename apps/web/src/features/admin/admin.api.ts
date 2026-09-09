import { apiClient } from "../../lib/api-client";

export interface AdminListResult<T> {
  items: T[];
  meta: { page: number; pageSize: number; total: number; totalPages: number };
}

/**
 * Cliente CRUD genérico: cada entidad de /admin/* (courses, modules,
 * lessons, exercises, projects, skills, achievements, interview-questions,
 * tickets) comparte exactamente la misma forma en el backend
 * (`admin-crud.ts`), así que un único cliente parametrizado por `basePath`
 * cubre las 9 en vez de repetir list/get/create/update/remove nueve veces.
 */
export function createAdminCrudApi<T extends { id: string }>(basePath: string) {
  return {
    async list(params: {
      page?: number;
      pageSize?: number;
      q?: string;
      [key: string]: unknown;
    }) {
      const { data } = await apiClient.get<AdminListResult<T>>(`/admin/${basePath}`, {
        params,
      });
      return data;
    },
    async get(id: string) {
      const { data } = await apiClient.get<{ item: T }>(`/admin/${basePath}/${id}`);
      return data.item;
    },
    async create(input: Record<string, unknown>) {
      const { data } = await apiClient.post<{ item: T }>(`/admin/${basePath}`, input);
      return data.item;
    },
    async update(id: string, input: Record<string, unknown>) {
      const { data } = await apiClient.patch<{ item: T }>(
        `/admin/${basePath}/${id}`,
        input,
      );
      return data.item;
    },
    async remove(id: string) {
      await apiClient.delete(`/admin/${basePath}/${id}`);
    },
  };
}

export interface AdminUserSummary {
  id: string;
  email: string;
  username: string;
  role: "USER" | "ADMIN";
  displayName: string;
  level: number;
  totalXp: number;
  createdAt: string;
  lastActivityAt: string | null;
}

export interface AdminAuditLogEntry {
  id: string;
  actorId: string;
  actorName: string;
  action: "CREATE" | "UPDATE" | "DELETE";
  entityType: string;
  entityId: string;
  metadata: unknown;
  createdAt: string;
}

export interface AdminFeatureFlag {
  id: string;
  key: string;
  isEnabled: boolean;
  description: string | null;
  updatedAt: string;
}

export interface AdminAnalytics {
  totalUsers: number;
  activeUsers: { last7Days: number; last30Days: number };
  exercisesCompleted: number;
  popularCourses: { id: string; title: string; completedLessons: number }[];
  highestFailureRateExercises: {
    exerciseId: string;
    title: string;
    failureRate: number;
    attempts: number;
  }[];
  weakestSkills: { skillId: string; name: string; usersStruggling: number }[];
  averageAttemptTimeSeconds: number;
  weeklyRetention: { rate: number | null; definition: string; cohortSize: number };
  totalExerciseAttempts: number;
}

export const adminApi = {
  async listUsers(params: {
    page?: number;
    pageSize?: number;
    q?: string;
    role?: string;
  }) {
    const { data } = await apiClient.get<AdminListResult<AdminUserSummary>>(
      "/admin/users",
      {
        params,
      },
    );
    return data;
  },
  async updateUserRole(id: string, role: "USER" | "ADMIN") {
    const { data } = await apiClient.patch<{ item: AdminUserSummary }>(
      `/admin/users/${id}/role`,
      { role },
    );
    return data.item;
  },
  async getAnalytics() {
    const { data } = await apiClient.get<AdminAnalytics>("/admin/analytics");
    return data;
  },
  async listAuditLog(params: { page?: number; pageSize?: number }) {
    const { data } = await apiClient.get<AdminListResult<AdminAuditLogEntry>>(
      "/admin/audit-log",
      { params },
    );
    return data;
  },
  async listFeatureFlags() {
    const { data } = await apiClient.get<{ items: AdminFeatureFlag[] }>(
      "/admin/feature-flags",
    );
    return data.items;
  },
  async updateFeatureFlag(key: string, isEnabled: boolean) {
    const { data } = await apiClient.patch<{ item: AdminFeatureFlag }>(
      `/admin/feature-flags/${key}`,
      { isEnabled },
    );
    return data.item;
  },
};
