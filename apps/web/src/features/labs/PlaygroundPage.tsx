import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Alert, Button, Card } from "@codeforge/ui";
import { NavBar } from "../../app/NavBar";
import { CodeEditor } from "./CodeEditor";
import { buildPreviewHtml } from "./preview-html";
import { labsApi } from "./labs.api";

const DEFAULT_HTML =
  "<h1>Hola, CodeForge</h1>\n<p>Edita el HTML, CSS y JS y mira el resultado.</p>";
const DEFAULT_CSS =
  "body {\n  font-family: sans-serif;\n  padding: 1rem;\n}\n\nh1 {\n  color: #4338ca;\n}";
const DEFAULT_JS = "console.log('Hola desde el Playground');";

type Tab = "html" | "css" | "js";

export function PlaygroundPage() {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("Sin título");
  const [html, setHtml] = useState(DEFAULT_HTML);
  const [css, setCss] = useState(DEFAULT_CSS);
  const [js, setJs] = useState(DEFAULT_JS);
  const [tab, setTab] = useState<Tab>("html");
  const [snapshotId, setSnapshotId] = useState<string | null>(null);
  const [preview, setPreview] = useState(() =>
    buildPreviewHtml(DEFAULT_HTML, DEFAULT_CSS, DEFAULT_JS),
  );

  useEffect(() => {
    const timer = setTimeout(() => setPreview(buildPreviewHtml(html, css, js)), 400);
    return () => clearTimeout(timer);
  }, [html, css, js]);

  const snapshotsQuery = useQuery({
    queryKey: ["playground-snapshots"],
    queryFn: () => labsApi.listPlaygroundSnapshots(),
  });

  const saveMutation = useMutation({
    mutationFn: () =>
      snapshotId
        ? labsApi.updatePlaygroundSnapshot(snapshotId, { title, html, css, js })
        : labsApi.createPlaygroundSnapshot({ title, html, css, js }),
    onSuccess: (snapshot) => {
      setSnapshotId(snapshot.id);
      void queryClient.invalidateQueries({ queryKey: ["playground-snapshots"] });
    },
  });

  const loadMutation = useMutation({
    mutationFn: (id: string) => labsApi.getPlaygroundSnapshot(id),
    onSuccess: (snapshot) => {
      setSnapshotId(snapshot.id);
      setTitle(snapshot.title);
      setHtml(snapshot.html);
      setCss(snapshot.css);
      setJs(snapshot.js);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => labsApi.deletePlaygroundSnapshot(id),
    onSuccess: (_data, id) => {
      if (snapshotId === id) setSnapshotId(null);
      void queryClient.invalidateQueries({ queryKey: ["playground-snapshots"] });
    },
  });

  function startNew() {
    setSnapshotId(null);
    setTitle("Sin título");
    setHtml(DEFAULT_HTML);
    setCss(DEFAULT_CSS);
    setJs(DEFAULT_JS);
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: "html", label: "HTML" },
    { id: "css", label: "CSS" },
    { id: "js", label: "JS" },
  ];

  return (
    <div className="min-h-screen">
      <NavBar />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="mb-1 text-2xl font-bold">Playground HTML / CSS / JS</h1>
        <p className="mb-6 text-slate-600 dark:text-slate-400">
          Escribe código y observa el resultado en vivo. El preview se ejecuta aislado
          (sandbox), sin acceso a tu sesión de CodeForge.
        </p>

        <div className="mb-4 flex flex-wrap items-center gap-2">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-900"
            aria-label="Título del snapshot"
          />
          <Button
            size="sm"
            onClick={() => saveMutation.mutate()}
            isLoading={saveMutation.isPending}
          >
            {snapshotId ? "Guardar cambios" : "Guardar como nuevo"}
          </Button>
          <Button size="sm" variant="secondary" onClick={startNew}>
            Nuevo
          </Button>
          {snapshotId && (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => deleteMutation.mutate(snapshotId)}
              isLoading={deleteMutation.isPending}
            >
              Eliminar
            </Button>
          )}
        </div>

        {saveMutation.isSuccess && (
          <Alert variant="success" className="mb-4">
            Guardado.
          </Alert>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <div className="mb-2 flex gap-1">
              {tabs.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`rounded-t-lg px-4 py-1.5 text-sm font-medium ${
                    tab === t.id
                      ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                      : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
            {tab === "html" && (
              <CodeEditor
                language="html"
                value={html}
                onChange={setHtml}
                ariaLabel="Editor HTML"
              />
            )}
            {tab === "css" && (
              <CodeEditor
                language="css"
                value={css}
                onChange={setCss}
                ariaLabel="Editor CSS"
              />
            )}
            {tab === "js" && (
              <CodeEditor
                language="javascript"
                value={js}
                onChange={setJs}
                ariaLabel="Editor JavaScript"
              />
            )}
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-slate-600 dark:text-slate-400">
              Vista previa
            </p>
            <iframe
              title="Vista previa"
              sandbox="allow-scripts"
              srcDoc={preview}
              className="h-[352px] w-full rounded-lg border border-slate-300 bg-white dark:border-slate-700"
            />
          </div>
        </div>

        <Card className="mt-8">
          <h2 className="mb-3 font-semibold">Tus snapshots guardados</h2>
          {snapshotsQuery.data?.length === 0 && (
            <p className="text-sm text-slate-500">
              Todavía no has guardado ningún snapshot.
            </p>
          )}
          <ul className="space-y-1">
            {snapshotsQuery.data?.map((s) => (
              <li key={s.id}>
                <button
                  onClick={() => loadMutation.mutate(s.id)}
                  className="text-brand-600 dark:text-brand-400 text-sm hover:underline"
                >
                  {s.title} — {new Date(s.updatedAt).toLocaleString()}
                </button>
              </li>
            ))}
          </ul>
        </Card>
      </main>
    </div>
  );
}
