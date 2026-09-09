import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@codeforge/ui";
import { NavBar } from "../../app/NavBar";
import { companyApi } from "./company.api";

export function CodeReviewsPage() {
  const query = useQuery({
    queryKey: ["pull-requests"],
    queryFn: () => companyApi.listPullRequests(),
  });

  return (
    <div className="min-h-screen">
      <NavBar />
      <main className="mx-auto max-w-3xl px-4 py-10">
        <Link
          to="/company"
          className="text-brand-600 dark:text-brand-400 text-sm hover:underline"
        >
          ← Tablero
        </Link>
        <h1 className="mb-1 mt-2 text-2xl font-bold">Practicar code review</h1>
        <p className="mb-6 text-sm text-slate-600 dark:text-slate-400">
          Revisa el Pull Request de un compañero: encuentra bugs, problemas de seguridad y
          rendimiento antes de aprobar.
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          {query.data?.map((pr) => (
            <Link key={pr.id} to={`/company/code-reviews/${pr.id}`}>
              <Card className="hover:border-brand-400 dark:hover:border-brand-600 h-full transition">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {pr.ticketCode}
                </p>
                <h2 className="font-semibold">{pr.title}</h2>
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                  por {pr.author.displayName}
                </p>
              </Card>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
