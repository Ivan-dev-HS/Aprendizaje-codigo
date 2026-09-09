export interface JsRunResult {
  outputs: string[];
  errors: string[];
  timedOut: boolean;
  truncated: boolean;
  durationMs: number;
}

export interface SqlRunResult {
  columns: string[];
  rows: Record<string, unknown>[];
  rowCount: number;
  truncated: boolean;
  durationMs: number;
}

export interface SqlLabDatasetSummary {
  slug: string;
  title: string;
  description: string;
  schemaSql: string;
}

export interface PlaygroundSnapshotSummary {
  id: string;
  title: string;
  updatedAt: string;
}

export interface PlaygroundSnapshotDetail extends PlaygroundSnapshotSummary {
  html: string;
  css: string;
  js: string;
  createdAt: string;
}

/** Nodo del sistema de archivos virtual de la Terminal Lab (sección 21). */
export interface VirtualFsNode {
  type: "dir" | "file";
  content?: string;
  children?: Record<string, VirtualFsNode>;
}

export interface TerminalHistoryEntry {
  command: string;
  output: string[];
  isError: boolean;
}

export interface TerminalStateView {
  cwd: string;
  history: TerminalHistoryEntry[];
}

/** Grafo simulado de la Git Lab (sección 22): no es un repositorio git real. */
export interface GitCommit {
  id: string;
  parentIds: string[];
  message: string;
  branch: string;
  createdAt: string;
}

export interface GitStateView {
  commits: GitCommit[];
  branches: Record<string, string>;
  head: { type: "branch"; name: string } | { type: "detached"; commitId: string };
  staged: string[];
  history: TerminalHistoryEntry[];
}
