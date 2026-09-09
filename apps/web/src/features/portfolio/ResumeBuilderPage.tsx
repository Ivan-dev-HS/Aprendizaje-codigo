import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  ResumeEducationItem,
  ResumeExperienceItem,
  ResumeLinkItem,
} from "@codeforge/types";
import { Alert, Button, Card } from "@codeforge/ui";
import { NavBar } from "../../app/NavBar";
import { resumeApi } from "./resume.api";

const PRINT_STYLE = `
@media print {
  body * { visibility: hidden; }
  #resume-preview, #resume-preview * { visibility: visible; }
  #resume-preview { position: absolute; top: 0; left: 0; width: 100%; padding: 0; }
}
`;

function emptyExperience(): ResumeExperienceItem {
  return { company: "", role: "", startDate: "", endDate: null, description: "" };
}
function emptyEducation(): ResumeEducationItem {
  return { institution: "", degree: "", startDate: "", endDate: null };
}
function emptyLink(): ResumeLinkItem {
  return { label: "", url: "" };
}

export function ResumeBuilderPage() {
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: ["resume-me"], queryFn: resumeApi.getMine });

  const [summary, setSummary] = useState("");
  const [experience, setExperience] = useState<ResumeExperienceItem[]>([]);
  const [education, setEducation] = useState<ResumeEducationItem[]>([]);
  const [links, setLinks] = useState<ResumeLinkItem[]>([]);

  useEffect(() => {
    if (!query.data) return;
    setSummary(query.data.summary ?? "");
    setExperience(query.data.experience);
    setEducation(query.data.education);
    setLinks(query.data.links);
  }, [query.data]);

  const saveMutation = useMutation({
    mutationFn: () => resumeApi.updateMine({ summary, experience, education, links }),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["resume-me"] }),
  });

  if (!query.data) {
    return (
      <div className="min-h-screen">
        <NavBar />
        <main className="mx-auto max-w-3xl px-4 py-10">
          <p className="text-sm">Cargando…</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <style>{PRINT_STYLE}</style>
      <div className="print:hidden">
        <NavBar />
      </div>
      <main className="mx-auto max-w-3xl px-4 py-10">
        <div className="mb-6 flex items-center justify-between print:hidden">
          <h1 className="text-2xl font-bold">CV Builder</h1>
          <Button variant="secondary" onClick={() => window.print()}>
            🖨 Imprimir / Guardar como PDF
          </Button>
        </div>

        <div className="print:hidden">
          <Card className="mb-6">
            <label className="mb-1 block text-sm font-medium" htmlFor="summary">
              Resumen profesional
            </label>
            <textarea
              id="summary"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              rows={3}
              className="mb-4 w-full rounded-lg border border-slate-300 bg-white p-2 text-sm dark:border-slate-700 dark:bg-slate-900"
            />

            <div className="mb-4">
              <div className="mb-2 flex items-center justify-between">
                <h2 className="font-semibold">Experiencia</h2>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setExperience((prev) => [...prev, emptyExperience()])}
                >
                  + Añadir
                </Button>
              </div>
              {experience.map((exp, i) => (
                <div
                  key={i}
                  className="mb-2 grid grid-cols-2 gap-2 rounded-lg border border-slate-200 p-2 text-sm dark:border-slate-800"
                >
                  <input
                    placeholder="Empresa"
                    value={exp.company}
                    onChange={(e) =>
                      setExperience((prev) =>
                        prev.map((x, j) =>
                          j === i ? { ...x, company: e.target.value } : x,
                        ),
                      )
                    }
                    className="rounded border border-slate-300 p-1.5 dark:border-slate-700 dark:bg-slate-900"
                  />
                  <input
                    placeholder="Puesto"
                    value={exp.role}
                    onChange={(e) =>
                      setExperience((prev) =>
                        prev.map((x, j) =>
                          j === i ? { ...x, role: e.target.value } : x,
                        ),
                      )
                    }
                    className="rounded border border-slate-300 p-1.5 dark:border-slate-700 dark:bg-slate-900"
                  />
                  <input
                    placeholder="Inicio (2025-01)"
                    value={exp.startDate}
                    onChange={(e) =>
                      setExperience((prev) =>
                        prev.map((x, j) =>
                          j === i ? { ...x, startDate: e.target.value } : x,
                        ),
                      )
                    }
                    className="rounded border border-slate-300 p-1.5 dark:border-slate-700 dark:bg-slate-900"
                  />
                  <input
                    placeholder="Fin (vacío = actual)"
                    value={exp.endDate ?? ""}
                    onChange={(e) =>
                      setExperience((prev) =>
                        prev.map((x, j) =>
                          j === i ? { ...x, endDate: e.target.value || null } : x,
                        ),
                      )
                    }
                    className="rounded border border-slate-300 p-1.5 dark:border-slate-700 dark:bg-slate-900"
                  />
                  <textarea
                    placeholder="Descripción"
                    value={exp.description}
                    onChange={(e) =>
                      setExperience((prev) =>
                        prev.map((x, j) =>
                          j === i ? { ...x, description: e.target.value } : x,
                        ),
                      )
                    }
                    className="col-span-2 rounded border border-slate-300 p-1.5 dark:border-slate-700 dark:bg-slate-900"
                  />
                  <button
                    onClick={() =>
                      setExperience((prev) => prev.filter((_, j) => j !== i))
                    }
                    className="col-span-2 text-left text-xs text-red-600 hover:underline dark:text-red-400"
                  >
                    Eliminar
                  </button>
                </div>
              ))}
            </div>

            <div className="mb-4">
              <div className="mb-2 flex items-center justify-between">
                <h2 className="font-semibold">Formación</h2>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setEducation((prev) => [...prev, emptyEducation()])}
                >
                  + Añadir
                </Button>
              </div>
              {education.map((edu, i) => (
                <div
                  key={i}
                  className="mb-2 grid grid-cols-2 gap-2 rounded-lg border border-slate-200 p-2 text-sm dark:border-slate-800"
                >
                  <input
                    placeholder="Institución"
                    value={edu.institution}
                    onChange={(e) =>
                      setEducation((prev) =>
                        prev.map((x, j) =>
                          j === i ? { ...x, institution: e.target.value } : x,
                        ),
                      )
                    }
                    className="rounded border border-slate-300 p-1.5 dark:border-slate-700 dark:bg-slate-900"
                  />
                  <input
                    placeholder="Título/Programa"
                    value={edu.degree}
                    onChange={(e) =>
                      setEducation((prev) =>
                        prev.map((x, j) =>
                          j === i ? { ...x, degree: e.target.value } : x,
                        ),
                      )
                    }
                    className="rounded border border-slate-300 p-1.5 dark:border-slate-700 dark:bg-slate-900"
                  />
                  <input
                    placeholder="Inicio"
                    value={edu.startDate}
                    onChange={(e) =>
                      setEducation((prev) =>
                        prev.map((x, j) =>
                          j === i ? { ...x, startDate: e.target.value } : x,
                        ),
                      )
                    }
                    className="rounded border border-slate-300 p-1.5 dark:border-slate-700 dark:bg-slate-900"
                  />
                  <input
                    placeholder="Fin (vacío = actual)"
                    value={edu.endDate ?? ""}
                    onChange={(e) =>
                      setEducation((prev) =>
                        prev.map((x, j) =>
                          j === i ? { ...x, endDate: e.target.value || null } : x,
                        ),
                      )
                    }
                    className="rounded border border-slate-300 p-1.5 dark:border-slate-700 dark:bg-slate-900"
                  />
                  <button
                    onClick={() => setEducation((prev) => prev.filter((_, j) => j !== i))}
                    className="col-span-2 text-left text-xs text-red-600 hover:underline dark:text-red-400"
                  >
                    Eliminar
                  </button>
                </div>
              ))}
            </div>

            <div className="mb-4">
              <div className="mb-2 flex items-center justify-between">
                <h2 className="font-semibold">Enlaces</h2>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setLinks((prev) => [...prev, emptyLink()])}
                >
                  + Añadir
                </Button>
              </div>
              {links.map((link, i) => (
                <div key={i} className="mb-2 grid grid-cols-2 gap-2 text-sm">
                  <input
                    placeholder="Etiqueta (GitHub)"
                    value={link.label}
                    onChange={(e) =>
                      setLinks((prev) =>
                        prev.map((x, j) =>
                          j === i ? { ...x, label: e.target.value } : x,
                        ),
                      )
                    }
                    className="rounded border border-slate-300 p-1.5 dark:border-slate-700 dark:bg-slate-900"
                  />
                  <input
                    placeholder="https://..."
                    value={link.url}
                    onChange={(e) =>
                      setLinks((prev) =>
                        prev.map((x, j) => (j === i ? { ...x, url: e.target.value } : x)),
                      )
                    }
                    className="rounded border border-slate-300 p-1.5 dark:border-slate-700 dark:bg-slate-900"
                  />
                </div>
              ))}
            </div>

            <Button
              onClick={() => saveMutation.mutate()}
              isLoading={saveMutation.isPending}
            >
              Guardar
            </Button>
            {saveMutation.isSuccess && (
              <Alert variant="success" className="mt-3">
                Guardado.
              </Alert>
            )}
          </Card>
        </div>

        <h2 className="mb-3 text-lg font-semibold print:hidden">Vista previa</h2>
        <div
          id="resume-preview"
          className="rounded-lg border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900 print:border-0 print:p-0"
        >
          <h1 className="text-2xl font-bold">{query.data.displayName}</h1>
          {summary && <p className="mt-2 text-sm">{summary}</p>}

          {experience.length > 0 && (
            <div className="mt-4">
              <h2 className="mb-2 font-semibold">Experiencia</h2>
              {experience.map((exp, i) => (
                <div key={i} className="mb-2 text-sm">
                  <p className="font-medium">
                    {exp.role} — {exp.company}
                  </p>
                  <p className="text-xs text-slate-500">
                    {exp.startDate} – {exp.endDate ?? "Actualidad"}
                  </p>
                  <p>{exp.description}</p>
                </div>
              ))}
            </div>
          )}

          {education.length > 0 && (
            <div className="mt-4">
              <h2 className="mb-2 font-semibold">Formación</h2>
              {education.map((edu, i) => (
                <div key={i} className="mb-1 text-sm">
                  <p className="font-medium">
                    {edu.degree} — {edu.institution}
                  </p>
                  <p className="text-xs text-slate-500">
                    {edu.startDate} – {edu.endDate ?? "Actualidad"}
                  </p>
                </div>
              ))}
            </div>
          )}

          {query.data.skills.length > 0 && (
            <div className="mt-4">
              <h2 className="mb-2 font-semibold">Skills</h2>
              <p className="text-sm">
                {query.data.skills.map((s) => s.name).join(" · ")}
              </p>
            </div>
          )}

          {query.data.projects.length > 0 && (
            <div className="mt-4">
              <h2 className="mb-2 font-semibold">Proyectos</h2>
              {query.data.projects.map((p) => (
                <div key={p.slug} className="mb-1 text-sm">
                  <p className="font-medium">{p.title}</p>
                  <p className="text-xs text-slate-500">{p.brief}</p>
                </div>
              ))}
            </div>
          )}

          {links.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-3 text-sm">
              {links.map((l) => (
                <a
                  key={l.url}
                  href={l.url}
                  className="text-brand-600 dark:text-brand-400"
                >
                  {l.label}
                </a>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
