import type {
  GitStateView,
  JsRunResult,
  PlaygroundSnapshotDetail,
  PlaygroundSnapshotSummary,
  SqlLabDatasetSummary,
  SqlRunResult,
  TerminalHistoryEntry,
  TerminalStateView,
} from "@codeforge/types";
import type {
  GitCommandInput,
  SavePlaygroundSnapshotInput,
  TerminalCommandInput,
} from "@codeforge/validators";
import { HttpError } from "../../lib/http-error.js";
import { execRunJs, execRunSql } from "./exec-client.js";
import {
  commitsSorted,
  createInitialGitState,
  runGitCommand,
  type GitState,
} from "./git-engine.js";
import { labsRepository } from "./labs.repository.js";
import {
  createInitialTerminalState,
  runTerminalCommand,
  type TerminalState,
} from "./terminal-engine.js";

const MAX_HISTORY_ENTRIES = 200;

export const labsService = {
  async runJs(code: string): Promise<JsRunResult> {
    return execRunJs(code);
  },

  async runSql(sql: string): Promise<SqlRunResult> {
    return execRunSql(sql);
  },

  listSqlDatasets(): Promise<SqlLabDatasetSummary[]> {
    return labsRepository.listSqlDatasets();
  },

  listPlaygroundSnapshots(userId: string): Promise<PlaygroundSnapshotSummary[]> {
    return labsRepository
      .listPlaygroundSnapshots(userId)
      .then((rows) =>
        rows.map((r) => ({
          id: r.id,
          title: r.title,
          updatedAt: r.updatedAt.toISOString(),
        })),
      );
  },

  async getPlaygroundSnapshot(
    userId: string,
    id: string,
  ): Promise<PlaygroundSnapshotDetail> {
    const snapshot = await labsRepository.findPlaygroundSnapshot(userId, id);
    if (!snapshot) throw HttpError.notFound("Snapshot no encontrado.");
    return {
      id: snapshot.id,
      title: snapshot.title,
      html: snapshot.html,
      css: snapshot.css,
      js: snapshot.js,
      createdAt: snapshot.createdAt.toISOString(),
      updatedAt: snapshot.updatedAt.toISOString(),
    };
  },

  async savePlaygroundSnapshot(
    userId: string,
    input: SavePlaygroundSnapshotInput,
    existingId?: string,
  ): Promise<PlaygroundSnapshotDetail> {
    const snapshot = existingId
      ? await (async () => {
          const existing = await labsRepository.findPlaygroundSnapshot(
            userId,
            existingId,
          );
          if (!existing) throw HttpError.notFound("Snapshot no encontrado.");
          return labsRepository.updatePlaygroundSnapshot(existingId, input);
        })()
      : await labsRepository.createPlaygroundSnapshot(userId, input);

    return {
      id: snapshot.id,
      title: snapshot.title,
      html: snapshot.html,
      css: snapshot.css,
      js: snapshot.js,
      createdAt: snapshot.createdAt.toISOString(),
      updatedAt: snapshot.updatedAt.toISOString(),
    };
  },

  async deletePlaygroundSnapshot(userId: string, id: string): Promise<void> {
    const existing = await labsRepository.findPlaygroundSnapshot(userId, id);
    if (!existing) throw HttpError.notFound("Snapshot no encontrado.");
    await labsRepository.deletePlaygroundSnapshot(id);
  },

  async getTerminalState(userId: string): Promise<TerminalStateView> {
    const stored = await labsRepository.findTerminalState(userId);
    if (!stored) {
      const initial = createInitialTerminalState();
      return { cwd: initial.cwd, history: [] };
    }
    const state = stored.filesystem as unknown as TerminalState;
    const history = stored.history as unknown as TerminalHistoryEntry[];
    return { cwd: state.cwd, history };
  },

  async runTerminalCommand(
    userId: string,
    input: TerminalCommandInput,
  ): Promise<TerminalStateView> {
    const stored = await labsRepository.findTerminalState(userId);
    const state: TerminalState = stored
      ? (stored.filesystem as unknown as TerminalState)
      : createInitialTerminalState();
    const history: TerminalHistoryEntry[] = stored
      ? (stored.history as unknown as TerminalHistoryEntry[])
      : [];

    if (input.command.trim() === "clear") {
      await labsRepository.upsertTerminalState(userId, state, []);
      return { cwd: state.cwd, history: [] };
    }

    const { state: nextState, entry } = runTerminalCommand(state, input.command);
    const nextHistory = [...history, entry].slice(-MAX_HISTORY_ENTRIES);

    await labsRepository.upsertTerminalState(userId, nextState, nextHistory);

    return { cwd: nextState.cwd, history: nextHistory };
  },

  async getGitState(userId: string): Promise<GitStateView> {
    const stored = await labsRepository.findGitState(userId);
    if (!stored) {
      const initial = createInitialGitState();
      return {
        commits: [],
        branches: initial.branches,
        head: initial.head,
        staged: initial.staged,
        history: [],
      };
    }
    const stateWithHistory = stored.repoState as unknown as GitState & {
      history: TerminalHistoryEntry[];
    };
    return {
      commits: commitsSorted(stateWithHistory),
      branches: stateWithHistory.branches,
      head: stateWithHistory.head,
      staged: stateWithHistory.staged,
      history: stateWithHistory.history,
    };
  },

  async runGitCommand(userId: string, input: GitCommandInput): Promise<GitStateView> {
    const stored = await labsRepository.findGitState(userId);
    const stateWithHistory = stored
      ? (stored.repoState as unknown as GitState & { history: TerminalHistoryEntry[] })
      : { ...createInitialGitState(), history: [] as TerminalHistoryEntry[] };

    if (input.command.trim() === "clear") {
      const cleared = { ...stateWithHistory, history: [] };
      await labsRepository.upsertGitState(userId, cleared);
      return {
        commits: commitsSorted(stateWithHistory),
        branches: stateWithHistory.branches,
        head: stateWithHistory.head,
        staged: stateWithHistory.staged,
        history: [],
      };
    }

    const { state: nextState, entry } = runGitCommand(stateWithHistory, input.command);
    const nextHistory = [...stateWithHistory.history, entry].slice(-MAX_HISTORY_ENTRIES);
    const toPersist = { ...nextState, history: nextHistory };

    await labsRepository.upsertGitState(userId, toPersist);

    return {
      commits: commitsSorted(nextState),
      branches: nextState.branches,
      head: nextState.head,
      staged: nextState.staged,
      history: nextHistory,
    };
  },
};
