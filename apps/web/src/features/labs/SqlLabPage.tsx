import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Alert, Button, Card } from "@codeforge/ui";
import { NavBar } from "../../app/NavBar";
import { CodeEditor } from "./CodeEditor";
import { labsApi } from "./labs.api";

const DEFAULT_SQL = "SELECT * FROM sandbox.customers ORDER BY id LIMIT 10;";

export function SqlLabPage() {
  const [sql, setSql] = useState(DEFAULT_SQL);

  const datasetsQuery = useQuery({
    queryKey: ["sql-lab-datasets"],
    queryFn: () => labsApi.listSqlDatasets(),
  });

  const runMutation = useMutation({
    mutationFn: () => labsApi.runSql(sql),
  });

  const result = runMutation.data;
  const errorMessage = (
    runMutation.error as
      { response?: { data?: { error?: { message?: string } } } } | undefined
  )?.response?.data?.error?.message;

  return (
    <div className="min-h-screen">
      <NavBar />
      <main className="mx-auto max-w-5xl px-4 py-8">
        <h1 className="mb-1 text-2xl font-bold">SQL Lab</h1>
        <p className="mb-6 text-slate-600 dark:text-slate-400">
          Solo se permiten consultas <code>SELECT</code> sobre un dataset de solo lectura
          (esquema <code>sandbox</code>).
        </p>

        {datasetsQuery.data?.map((dataset) => (
          <Card key={dataset.slug} className="mb-6">
            <h2 className="font-semibold">{dataset.title}</h2>
            <p className="mb-2 text-sm text-slate-600 dark:text-slate-400">
              {dataset.description}
            </p>
            <pre className="overflow-x-auto rounded-lg bg-slate-900 p-3 text-xs text-slate-100">
              {dataset.schemaSql.trim()}
            </pre>
          </Card>
        ))}

        <CodeEditor
          language="sql"
          value={sql}
          onChange={setSql}
          height="160px"
          ariaLabel="Editor SQL"
        />

        <div className="mt-4">
          <Button onClick={() => runMutation.mutate()} isLoading={runMutation.isPending}>
            ▶ Ejecutar consulta
          </Button>
        </div>

        {runMutation.isError && (
          <Alert variant="error" className="mt-4">
            {errorMessage ?? "No se pudo ejecutar la consulta."}
          </Alert>
        )}

        {result && (
          <Card className="mt-4 overflow-x-auto">
            {result.truncated && (
              <Alert variant="warning" className="mb-3">
                Se muestran solo las primeras filas (resultado truncado).
              </Alert>
            )}
            {result.rows.length === 0 ? (
              <p className="text-sm text-slate-500">La consulta no devolvió filas.</p>
            ) : (
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800">
                    {result.columns.map((col) => (
                      <th key={col} className="px-3 py-2 font-medium">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {result.rows.map((row, i) => (
                    <tr
                      key={i}
                      className="border-b border-slate-100 dark:border-slate-900"
                    >
                      {result.columns.map((col) => (
                        <td key={col} className="px-3 py-2">
                          {String(row[col])}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <p className="mt-3 text-xs text-slate-400">
              {result.rowCount} fila(s) · {result.durationMs} ms
            </p>
          </Card>
        )}
      </main>
    </div>
  );
}
