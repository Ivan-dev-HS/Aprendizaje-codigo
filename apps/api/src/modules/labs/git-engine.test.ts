import { describe, expect, it } from "vitest";
import { createInitialGitState, runGitCommand, type GitState } from "./git-engine.js";

function run(state: GitState, command: string) {
  return runGitCommand(state, command);
}

describe("git-engine", () => {
  it("git init crea la rama main sin commits; falla si ya está inicializado", () => {
    const state = createInitialGitState();
    const initResult = run(state, "git init");
    expect(initResult.entry.isError).toBe(false);
    expect(run(initResult.state, "git init").entry.isError).toBe(true);
  });

  it("add + commit crean el primer commit y avanzan la rama actual", () => {
    let state = createInitialGitState();
    state = run(state, "git init").state;

    const noStaged = run(state, 'git commit -m "vacío"');
    expect(noStaged.entry.isError).toBe(true);

    state = run(state, "git add index.html").state;
    const commit = run(state, 'git commit -m "primer commit"');
    expect(commit.entry.isError).toBe(false);
    state = commit.state;

    expect(state.staged).toEqual([]);
    expect(Object.keys(state.commits)).toHaveLength(1);
    expect(state.branches.main).toBe(Object.keys(state.commits)[0]);
  });

  it("branch crea una rama en el commit actual; checkout cambia de rama", () => {
    let state = createInitialGitState();
    state = run(state, "git init").state;
    state = run(state, "git add a.txt").state;
    state = run(state, 'git commit -m "c1"').state;

    const branch = run(state, "git branch feature");
    expect(branch.entry.isError).toBe(false);
    state = branch.state;
    expect(state.branches.feature).toBe(state.branches.main);

    const checkout = run(state, "git checkout feature");
    expect(checkout.entry.isError).toBe(false);
    expect(checkout.state.head).toEqual({ type: "branch", name: "feature" });
  });

  it("checkout -b crea y cambia de rama en un solo paso", () => {
    let state = createInitialGitState();
    state = run(state, "git init").state;
    state = run(state, "git add a.txt").state;
    state = run(state, 'git commit -m "c1"').state;

    const result = run(state, "git checkout -b feature");
    expect(result.entry.isError).toBe(false);
    expect(result.state.head).toEqual({ type: "branch", name: "feature" });
    expect(result.state.branches.feature).toBeDefined();
  });

  it("merge hace fast-forward cuando no hay divergencia", () => {
    let state = createInitialGitState();
    state = run(state, "git init").state;
    state = run(state, "git add a.txt").state;
    state = run(state, 'git commit -m "c1"').state;
    state = run(state, "git checkout -b feature").state;
    state = run(state, "git add b.txt").state;
    state = run(state, 'git commit -m "c2 en feature"').state;
    state = run(state, "git checkout main").state;

    const merge = run(state, "git merge feature");
    expect(merge.entry.isError).toBe(false);
    expect(merge.entry.output[0]).toMatch(/Fast-forward/);
    expect(run(merge.state, "git branch").entry.output).toBeDefined();
    expect(merge.state.branches.main).toBe(merge.state.branches.feature);
  });

  it("merge crea un commit de fusión con dos padres cuando las ramas divergen", () => {
    let state = createInitialGitState();
    state = run(state, "git init").state;
    state = run(state, "git add a.txt").state;
    state = run(state, 'git commit -m "base"').state;
    state = run(state, "git checkout -b feature").state;
    state = run(state, "git add b.txt").state;
    state = run(state, 'git commit -m "en feature"').state;
    state = run(state, "git checkout main").state;
    state = run(state, "git add c.txt").state;
    state = run(state, 'git commit -m "en main"').state;

    const merge = run(state, "git merge feature");
    expect(merge.entry.isError).toBe(false);
    expect(merge.entry.output[0]).toMatch(/Merge commit/);

    const mergeCommitId = merge.state.branches.main as string;
    const mergeCommit = merge.state.commits[mergeCommitId];
    expect(mergeCommit?.parentIds).toHaveLength(2);
  });

  it("log --oneline lista los commits alcanzables desde HEAD", () => {
    let state = createInitialGitState();
    state = run(state, "git init").state;
    state = run(state, "git add a.txt").state;
    state = run(state, 'git commit -m "c1"').state;
    state = run(state, "git add b.txt").state;
    state = run(state, 'git commit -m "c2"').state;

    const log = run(state, "git log --oneline");
    expect(log.entry.output).toHaveLength(2);
    expect(log.entry.output[0]).toContain("c2");
    expect(log.entry.output[1]).toContain("c1");
  });

  it("branch -d falla sobre la rama actual y funciona sobre otra rama", () => {
    let state = createInitialGitState();
    state = run(state, "git init").state;
    state = run(state, "git add a.txt").state;
    state = run(state, 'git commit -m "c1"').state;
    state = run(state, "git branch feature").state;

    const failSelf = run(state, "git branch -d main");
    expect(failSelf.entry.isError).toBe(true);

    const ok = run(state, "git branch -d feature");
    expect(ok.entry.isError).toBe(false);
    expect(ok.state.branches.feature).toBeUndefined();
  });

  it("comandos no soportados devuelven isError sin lanzar excepción", () => {
    const state = createInitialGitState();
    expect(run(state, "git rebase main").entry.isError).toBe(true);
    expect(run(state, "docker ps").entry.isError).toBe(true);
  });
});
