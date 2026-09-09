import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, Spinner } from "@codeforge/ui";
import { NavBar } from "../../app/NavBar";
import { labsApi } from "./labs.api";

export function GitLabPage() {
  const queryClient = useQueryClient();
  const [command, setCommand] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const stateQuery = useQuery({
    queryKey: ["git-state"],
    queryFn: () => labsApi.getGitState(),
  });

  const runMutation = useMutation({
    mutationFn: (cmd: string) => labsApi.runGitCommand(cmd),
    onSuccess: (state) => {
      queryClient.setQueryData(["git-state"], state);
    },
  });

  const state = stateQuery.data;

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [state?.history.length]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = command.trim();
    if (!trimmed || runMutation.isPending) return;
    runMutation.mutate(trimmed);
    setCommand("");
  }

  const commitsDesc = state ? [...state.commits].reverse() : [];

  return (
    <div className="min-h-screen">
      <NavBar />
      <main className="mx-auto max-w-5xl px-4 py-8">
        <h1 className="mb-1 text-2xl font-bold">Git Lab</h1>
        <p className="mb-6 text-slate-600 dark:text-slate-400">
          Simulador del modelo de commits/ramas/merge de Git. Empieza con{" "}
          <code>git init</code>. Comandos: init, status, add, commit -m, log --oneline,
          branch, branch -d, checkout, checkout -b, switch, merge.
        </p>

        {stateQuery.isLoading ? (
          <Spinner label="Cargando…" />
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            <div
              className="rounded-lg border border-slate-700 bg-slate-950 p-4 font-mono text-sm text-slate-100"
              onClick={() => inputRef.current?.focus()}
            >
              <div ref={scrollRef} className="max-h-[420px] overflow-y-auto">
                {state?.history.map((entry, i) => (
                  <div key={i} className="mb-2">
                    <div className="text-emerald-400">$ {entry.command}</div>
                    {entry.output.map((line, j) => (
                      <div
                        key={j}
                        className={entry.isError ? "text-red-400" : "text-slate-200"}
                      >
                        {line}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
              <form onSubmit={submit} className="flex items-center gap-2">
                <span className="text-emerald-400">$</span>
                <input
                  ref={inputRef}
                  value={command}
                  onChange={(e) => setCommand(e.target.value)}
                  disabled={runMutation.isPending}
                  autoFocus
                  autoComplete="off"
                  spellCheck={false}
                  aria-label="Comando git"
                  className="flex-1 bg-transparent outline-none"
                />
              </form>
            </div>

            <Card>
              <h2 className="mb-3 font-semibold">Historial de commits</h2>
              {commitsDesc.length === 0 && (
                <p className="text-sm text-slate-500">
                  Todavía no hay commits. Prueba: git init, git add archivo.txt, git
                  commit -m "mensaje".
                </p>
              )}
              <ul className="space-y-3">
                {commitsDesc.map((commit) => {
                  const branchNames = state
                    ? Object.entries(state.branches)
                        .filter(([, id]) => id === commit.id)
                        .map(([name]) => name)
                    : [];
                  const isHead =
                    state?.head.type === "detached" && state.head.commitId === commit.id;
                  return (
                    <li
                      key={commit.id}
                      className="rounded-lg border border-slate-200 p-3 text-sm dark:border-slate-800"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <code className="text-brand-600 dark:text-brand-400 font-mono">
                          {commit.id.slice(0, 7)}
                        </code>
                        {branchNames.map((name) => (
                          <span
                            key={name}
                            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                              state?.head.type === "branch" && state.head.name === name
                                ? "bg-brand-600 text-white"
                                : "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                            }`}
                          >
                            {name}
                            {state?.head.type === "branch" &&
                              state.head.name === name &&
                              " (HEAD)"}
                          </span>
                        ))}
                        {isHead && (
                          <span className="bg-brand-600 rounded-full px-2 py-0.5 text-xs font-medium text-white">
                            HEAD
                          </span>
                        )}
                        {commit.parentIds.length > 1 && (
                          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                            merge
                          </span>
                        )}
                      </div>
                      <p className="mt-1">{commit.message}</p>
                    </li>
                  );
                })}
              </ul>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
