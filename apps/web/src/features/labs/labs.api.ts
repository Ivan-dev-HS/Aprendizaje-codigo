import type {
  GitStateView,
  JsRunResult,
  PlaygroundSnapshotDetail,
  PlaygroundSnapshotSummary,
  SqlLabDatasetSummary,
  SqlRunResult,
  TerminalStateView,
} from "@codeforge/types";
import { apiClient } from "../../lib/api-client";

export interface PlaygroundSnapshotInput {
  title: string;
  html: string;
  css: string;
  js: string;
}

export const labsApi = {
  async runJs(code: string) {
    const { data } = await apiClient.post<JsRunResult>("/labs/js/run", { code });
    return data;
  },

  async runSql(sql: string) {
    const { data } = await apiClient.post<SqlRunResult>("/labs/sql/run", { sql });
    return data;
  },

  async listSqlDatasets() {
    const { data } = await apiClient.get<{ items: SqlLabDatasetSummary[] }>(
      "/labs/sql/datasets",
    );
    return data.items;
  },

  async listPlaygroundSnapshots() {
    const { data } = await apiClient.get<{ items: PlaygroundSnapshotSummary[] }>(
      "/labs/playground",
    );
    return data.items;
  },

  async getPlaygroundSnapshot(id: string) {
    const { data } = await apiClient.get<{ snapshot: PlaygroundSnapshotDetail }>(
      `/labs/playground/${id}`,
    );
    return data.snapshot;
  },

  async createPlaygroundSnapshot(input: PlaygroundSnapshotInput) {
    const { data } = await apiClient.post<{ snapshot: PlaygroundSnapshotDetail }>(
      "/labs/playground",
      input,
    );
    return data.snapshot;
  },

  async updatePlaygroundSnapshot(id: string, input: PlaygroundSnapshotInput) {
    const { data } = await apiClient.put<{ snapshot: PlaygroundSnapshotDetail }>(
      `/labs/playground/${id}`,
      input,
    );
    return data.snapshot;
  },

  async deletePlaygroundSnapshot(id: string) {
    await apiClient.delete(`/labs/playground/${id}`);
  },

  async getTerminalState() {
    const { data } = await apiClient.get<TerminalStateView>("/labs/terminal");
    return data;
  },

  async runTerminalCommand(command: string) {
    const { data } = await apiClient.post<TerminalStateView>("/labs/terminal", {
      command,
    });
    return data;
  },

  async getGitState() {
    const { data } = await apiClient.get<GitStateView>("/labs/git");
    return data;
  },

  async runGitCommand(command: string) {
    const { data } = await apiClient.post<GitStateView>("/labs/git", { command });
    return data;
  },
};
