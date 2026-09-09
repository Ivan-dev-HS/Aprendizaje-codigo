import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Alert, Button, Card } from "@codeforge/ui";
import { NavBar } from "../../app/NavBar";
import { PortfolioPreview } from "./PortfolioPreview";
import { portfolioApi } from "./portfolio.api";

export function PortfolioEditorPage() {
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: ["portfolio-me"], queryFn: portfolioApi.getMine });

  const [isPublic, setIsPublic] = useState(false);
  const [headline, setHeadline] = useState("");
  const [theme, setTheme] = useState<"default" | "minimal" | "dark">("default");

  useEffect(() => {
    if (!query.data) return;
    setIsPublic(query.data.settings.isPublic);
    setHeadline(query.data.settings.headline ?? "");
    setTheme((query.data.settings.theme as "default" | "minimal" | "dark") ?? "default");
  }, [query.data]);

  const saveMutation = useMutation({
    mutationFn: () => portfolioApi.updateMine({ isPublic, headline, theme }),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["portfolio-me"] }),
  });

  const preview = query.data?.preview;

  return (
    <div className="min-h-screen">
      <NavBar />
      <main className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="mb-1 text-2xl font-bold">Tu portfolio público</h1>
        <p className="mb-6 text-slate-600 dark:text-slate-400">
          Se compone automáticamente con tus skills, proyectos completados y datos de tu
          CV.
        </p>

        <Card className="mb-6">
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-medium">
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
              />
              Publicar mi portfolio
            </label>
            <div>
              <label className="mb-1 block text-sm font-medium" htmlFor="headline">
                Titular
              </label>
              <input
                id="headline"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="Aspirante a desarrolladora frontend"
                className="w-full rounded-lg border border-slate-300 bg-white p-2 text-sm dark:border-slate-700 dark:bg-slate-900"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium" htmlFor="theme">
                Tema
              </label>
              <select
                id="theme"
                value={theme}
                onChange={(e) =>
                  setTheme(e.target.value as "default" | "minimal" | "dark")
                }
                className="w-full rounded-lg border border-slate-300 bg-white p-2 text-sm dark:border-slate-700 dark:bg-slate-900"
              >
                <option value="default">Por defecto</option>
                <option value="minimal">Minimalista</option>
                <option value="dark">Oscuro</option>
              </select>
            </div>
            <Button
              onClick={() => saveMutation.mutate()}
              isLoading={saveMutation.isPending}
            >
              Guardar
            </Button>
            {saveMutation.isSuccess && <Alert variant="success">Guardado.</Alert>}
            {isPublic && preview && (
              <p className="text-sm">
                Tu portfolio es público en{" "}
                <Link
                  to={`/portfolio/${preview.username}`}
                  className="text-brand-600 dark:text-brand-400 hover:underline"
                >
                  /portfolio/{preview.username}
                </Link>
              </p>
            )}
          </div>
        </Card>

        {preview && (
          <>
            <h2 className="mb-3 text-lg font-semibold">Vista previa</h2>
            <PortfolioPreview portfolio={preview} />
          </>
        )}
      </main>
    </div>
  );
}
