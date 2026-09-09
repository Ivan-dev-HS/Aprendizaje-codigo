import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Alert, Button, Card } from "@codeforge/ui";
import { NavBar } from "../../app/NavBar";
import { CodeEditor } from "./CodeEditor";
import { labsApi } from "./labs.api";

const DEFAULT_CODE = `// Escribe JavaScript y pulsa "Ejecutar".
function factorial(n) {
  return n <= 1 ? 1 : n * factorial(n - 1);
}

console.log(factorial(5));
`;

export function JsLabPage() {
  const [code, setCode] = useState(DEFAULT_CODE);

  const runMutation = useMutation({
    mutationFn: () => labsApi.runJs(code),
  });

  const result = runMutation.data;

  return (
    <div className="min-h-screen">
      <NavBar />
      <main className="mx-auto max-w-4xl px-4 py-8">
        <h1 className="mb-1 text-2xl font-bold">JavaScript Lab</h1>
        <p className="mb-6 text-slate-600 dark:text-slate-400">
          Tu código se ejecuta en un servicio aislado (worker thread + sandbox de VM),
          nunca en el proceso principal de la API.
        </p>

        <CodeEditor
          language="javascript"
          value={code}
          onChange={setCode}
          height="360px"
          ariaLabel="Editor de JavaScript"
        />

        <div className="mt-4">
          <Button onClick={() => runMutation.mutate()} isLoading={runMutation.isPending}>
            ▶ Ejecutar
          </Button>
        </div>

        {runMutation.isError && (
          <Alert variant="error" className="mt-4">
            No se pudo ejecutar el código. Inténtalo de nuevo.
          </Alert>
        )}

        {result && (
          <Card className="mt-4">
            {result.timedOut && (
              <Alert variant="warning" className="mb-3">
                El código tardó demasiado en ejecutarse y fue interrumpido.
              </Alert>
            )}
            {result.truncated && (
              <Alert variant="warning" className="mb-3">
                La salida se truncó por superar el límite de tamaño.
              </Alert>
            )}
            <p className="mb-1 text-sm font-medium text-slate-600 dark:text-slate-400">
              Salida (console.log):
            </p>
            <pre className="mb-3 min-h-[2rem] overflow-x-auto rounded-lg bg-slate-900 p-3 text-sm text-slate-100">
              {result.outputs.length ? result.outputs.join("\n") : "(sin salida)"}
            </pre>
            {result.errors.length > 0 && (
              <>
                <p className="mb-1 text-sm font-medium text-red-600 dark:text-red-400">
                  Errores:
                </p>
                <pre className="overflow-x-auto rounded-lg bg-red-950 p-3 text-sm text-red-200">
                  {result.errors.join("\n")}
                </pre>
              </>
            )}
            <p className="mt-3 text-xs text-slate-400">
              Duración: {result.durationMs} ms
            </p>
          </Card>
        )}
      </main>
    </div>
  );
}
