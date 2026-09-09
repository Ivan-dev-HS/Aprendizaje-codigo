import { useState } from "react";
import { useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Alert, Button, Card, Input, Label } from "@codeforge/ui";
import { NavBar } from "../../app/NavBar";
import { AdminNav } from "./AdminNav";
import { createAdminCrudApi } from "./admin.api";
import { ADMIN_ENTITIES, type AdminFieldConfig } from "./entity-configs";

type EntityRecord = Record<string, unknown> & { id: string };

function defaultFormValues(
  fields: AdminFieldConfig[],
  item?: EntityRecord,
): Record<string, string> {
  const values: Record<string, string> = {};
  for (const field of fields) {
    const raw = item?.[field.name];
    if (field.type === "boolean") {
      values[field.name] = raw ? "true" : "false";
    } else if (field.type === "json") {
      values[field.name] = raw !== undefined ? JSON.stringify(raw, null, 2) : "";
    } else {
      values[field.name] = raw !== undefined && raw !== null ? String(raw) : "";
    }
  }
  return values;
}

function buildPayload(fields: AdminFieldConfig[], values: Record<string, string>) {
  const payload: Record<string, unknown> = {};
  for (const field of fields) {
    const raw = values[field.name] ?? "";
    if (field.type === "json") {
      if (raw.trim() === "") {
        if (field.required) throw new Error(`"${field.label}" es un JSON obligatorio.`);
        continue;
      }
      try {
        payload[field.name] = JSON.parse(raw);
      } catch {
        throw new Error(`"${field.label}" no es JSON válido.`);
      }
    } else if (field.type === "number") {
      if (raw.trim() === "") {
        if (field.required) throw new Error(`"${field.label}" es obligatorio.`);
        continue;
      }
      payload[field.name] = Number(raw);
    } else if (field.type === "boolean") {
      payload[field.name] = raw === "true";
    } else {
      if (raw.trim() === "" && field.required) {
        throw new Error(`"${field.label}" es obligatorio.`);
      }
      if (raw.trim() !== "") payload[field.name] = raw;
    }
  }
  return payload;
}

export function GenericEntityAdminPage() {
  const { entity } = useParams<{ entity: string }>();
  const config = entity ? ADMIN_ENTITIES[entity] : undefined;
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<EntityRecord | "new" | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const api = config ? createAdminCrudApi<EntityRecord>(config.basePath) : null;

  const listQuery = useQuery({
    queryKey: ["admin", entity, page, q],
    queryFn: () => api!.list({ page, pageSize: 20, q: q || undefined }),
    enabled: !!api,
  });

  const saveMutation = useMutation({
    mutationFn: (input: Record<string, unknown>) =>
      editing && editing !== "new" ? api!.update(editing.id, input) : api!.create(input),
    onSuccess: () => {
      setEditing(null);
      setFormError(null);
      void queryClient.invalidateQueries({ queryKey: ["admin", entity] });
    },
    onError: (err) => {
      setFormError(
        (err as { response?: { data?: { error?: { message?: string } } } }).response?.data
          ?.error?.message ?? "No se pudo guardar.",
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api!.remove(id),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["admin", entity] }),
  });

  if (!config) {
    return (
      <div className="min-h-screen">
        <NavBar />
        <main className="mx-auto max-w-5xl px-4 py-10">
          <p className="text-sm">Sección de administración desconocida.</p>
        </main>
      </div>
    );
  }

  function openForm(item: EntityRecord | "new") {
    setFormError(null);
    setEditing(item);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const values: Record<string, string> = {};
    for (const field of config!.fields)
      values[field.name] = String(form.get(field.name) ?? "");
    try {
      const payload = buildPayload(config!.fields, values);
      saveMutation.mutate(payload);
    } catch (err) {
      setFormError((err as Error).message);
    }
  }

  const initialValues = defaultFormValues(
    config.fields,
    editing && editing !== "new" ? editing : undefined,
  );

  return (
    <div className="min-h-screen">
      <NavBar />
      <main className="mx-auto max-w-6xl px-4 py-10">
        <AdminNav />
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">{config.title}</h1>
          <Button onClick={() => openForm("new")}>+ Nuevo</Button>
        </div>

        <Input
          placeholder="Buscar…"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setPage(1);
          }}
          className="mb-4 max-w-xs"
        />

        {editing && (
          <Card className="mb-6">
            <h2 className="mb-3 font-semibold">
              {editing === "new" ? "Nuevo" : "Editar"} {config.title.toLowerCase()}
            </h2>
            {formError && (
              <Alert variant="error" className="mb-3">
                {formError}
              </Alert>
            )}
            <form onSubmit={handleSubmit} className="space-y-3">
              {config.fields.map((field) => (
                <div key={field.name}>
                  <Label htmlFor={field.name}>
                    {field.label}
                    {field.required && " *"}
                  </Label>
                  {field.type === "textarea" || field.type === "json" ? (
                    <textarea
                      id={field.name}
                      name={field.name}
                      defaultValue={initialValues[field.name]}
                      rows={field.type === "json" ? 6 : 3}
                      className="w-full rounded-lg border border-slate-300 bg-white p-2 font-mono text-sm dark:border-slate-700 dark:bg-slate-900"
                    />
                  ) : field.type === "select" ? (
                    <select
                      id={field.name}
                      name={field.name}
                      defaultValue={initialValues[field.name]}
                      className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-900"
                    >
                      <option value="">—</option>
                      {field.options?.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  ) : field.type === "boolean" ? (
                    <select
                      id={field.name}
                      name={field.name}
                      defaultValue={initialValues[field.name]}
                      className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-900"
                    >
                      <option value="true">Sí</option>
                      <option value="false">No</option>
                    </select>
                  ) : (
                    <Input
                      id={field.name}
                      name={field.name}
                      type={field.type === "number" ? "number" : "text"}
                      defaultValue={initialValues[field.name]}
                    />
                  )}
                </div>
              ))}
              <div className="flex gap-2">
                <Button type="submit" isLoading={saveMutation.isPending}>
                  Guardar
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setEditing(null)}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </Card>
        )}

        <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900">
              <tr>
                {config.columns.map((col) => (
                  <th key={col.key} className="px-3 py-2 font-medium">
                    {col.label}
                  </th>
                ))}
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody>
              {listQuery.data?.items.map((item) => (
                <tr
                  key={item.id}
                  className="border-t border-slate-100 dark:border-slate-800"
                >
                  {config.columns.map((col) => (
                    <td key={col.key} className="max-w-xs truncate px-3 py-2">
                      {String(item[col.key] ?? "")}
                    </td>
                  ))}
                  <td className="flex gap-2 px-3 py-2">
                    <button
                      onClick={() => openForm(item)}
                      className="text-brand-600 dark:text-brand-400 hover:underline"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => {
                        if (
                          confirm(
                            "¿Borrar este elemento? Esta acción no se puede deshacer.",
                          )
                        )
                          deleteMutation.mutate(item.id);
                      }}
                      className="text-red-600 hover:underline dark:text-red-400"
                    >
                      Borrar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {listQuery.data && listQuery.data.meta.totalPages > 1 && (
          <div className="mt-4 flex items-center gap-3 text-sm">
            <Button
              variant="secondary"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              ← Anterior
            </Button>
            <span>
              Página {page} de {listQuery.data.meta.totalPages}
            </span>
            <Button
              variant="secondary"
              size="sm"
              disabled={page >= listQuery.data.meta.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Siguiente →
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
