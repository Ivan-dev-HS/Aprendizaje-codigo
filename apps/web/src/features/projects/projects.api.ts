import type { ProjectDetail, ProjectSummary } from "@codeforge/types";
import { apiClient } from "../../lib/api-client";

export interface UpdateUserProjectInput {
  githubUrl?: string;
  demoUrl?: string;
  readme?: string;
  screenshots?: string[];
  technologies?: string[];
}

export const projectsApi = {
  async list() {
    const { data } = await apiClient.get<{ items: ProjectSummary[] }>("/projects");
    return data.items;
  },

  async getDetail(slug: string) {
    const { data } = await apiClient.get<{ project: ProjectDetail }>(`/projects/${slug}`);
    return data.project;
  },

  async start(id: string) {
    await apiClient.post(`/projects/${id}/start`);
  },

  async updateMetadata(id: string, input: UpdateUserProjectInput) {
    const { data } = await apiClient.patch(`/projects/${id}`, input);
    return data.userProject;
  },

  async completeTask(projectId: string, taskId: string) {
    const { data } = await apiClient.post(
      `/projects/${projectId}/tasks/${taskId}/complete`,
    );
    return data as {
      completedTaskCount: number;
      taskCount: number;
      projectCompleted: boolean;
      xpAwarded: number;
      alreadyAwarded: boolean;
      leveledUp: boolean;
    };
  },
};
