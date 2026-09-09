import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Spinner } from "@codeforge/ui";
import { NavBar } from "../../app/NavBar";
import { labsApi } from "./labs.api";

export function TerminalLabPage() {
  const queryClient = useQueryClient();
  const [command, setCommand] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const stateQuery = useQuery({
    queryKey: ["terminal-state"],
    queryFn: () => labsApi.getTerminalState(),
  });

  const runMutation = useMutation({
    mutationFn: (cmd: string) => labsApi.runTerminalCommand(cmd),
    onSuccess: (state) => {
      queryClient.setQueryData(["terminal-state"], state);
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

  return (
    <div className="min-h-screen">
      <NavBar />
      <main className="mx-auto max-w-4xl px-4 py-8">
        <h1 className="mb-1 text-2xl font-bold">Terminal Lab</h1>
        <p className="mb-6 text-slate-600 dark:text-slate-400">
          Un sistema de archivos virtual persistente. Escribe <code>help</code> para ver
          los comandos disponibles.
        </p>

        {stateQuery.isLoading ? (
          <Spinner label="Cargando terminal…" />
        ) : (
          <div
            className="rounded-lg border border-slate-700 bg-slate-950 p-4 font-mono text-sm text-slate-100"
            onClick={() => inputRef.current?.focus()}
          >
            <div ref={scrollRef} className="max-h-[420px] overflow-y-auto">
              {state?.history.map((entry, i) => (
                <div key={i} className="mb-2">
                  <div className="text-emerald-400">
                    user@codeforge:{state.cwd}$ {entry.command}
                  </div>
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
              <span className="text-emerald-400">user@codeforge:{state?.cwd}$</span>
              <input
                ref={inputRef}
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                disabled={runMutation.isPending}
                autoFocus
                autoComplete="off"
                spellCheck={false}
                aria-label="Comando de terminal"
                className="flex-1 bg-transparent outline-none"
              />
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
