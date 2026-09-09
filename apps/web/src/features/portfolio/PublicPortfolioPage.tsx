import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Spinner } from "@codeforge/ui";
import { PortfolioPreview } from "./PortfolioPreview";
import { portfolioApi } from "./portfolio.api";

export function PublicPortfolioPage() {
  const { username } = useParams<{ username: string }>();
  const query = useQuery({
    queryKey: ["public-portfolio", username],
    queryFn: () => portfolioApi.getPublic(username as string),
    enabled: !!username,
    retry: false,
  });

  useEffect(() => {
    if (!query.data) return;
    document.title = `${query.data.displayName} — Portfolio · CodeForge`;
    const description = document.querySelector('meta[name="description"]');
    const content =
      query.data.headline ?? `Portfolio de ${query.data.displayName} en CodeForge.`;
    if (description) description.setAttribute("content", content);
    return () => {
      document.title = "CodeForge";
    };
  }, [query.data]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <main className="mx-auto max-w-3xl px-4 py-10">
        {query.isLoading && (
          <div className="flex justify-center py-20">
            <Spinner label="Cargando portfolio…" />
          </div>
        )}
        {query.isError && (
          <p className="py-20 text-center text-slate-600 dark:text-slate-400">
            Este portfolio no existe o no es público.
          </p>
        )}
        {query.data && <PortfolioPreview portfolio={query.data} />}
      </main>
    </div>
  );
}
