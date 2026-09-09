import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { searchApi } from "./search.api";

const TYPE_LABELS: Record<string, string> = {
  COURSE: "Curso",
  LESSON: "Lección",
  EXERCISE: "Ejercicio",
  CASE: "Caso real",
  PROJECT: "Proyecto",
  INTERVIEW: "Entrevista",
};

export function SearchBar() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const searchQuery = useQuery({
    queryKey: ["search", query],
    queryFn: () => searchApi.search(query),
    enabled: query.trim().length >= 2,
  });

  function goTo(link: string) {
    setOpen(false);
    setQuery("");
    navigate(link);
  }

  return (
    <div className="relative w-full max-w-xs">
      <input
        type="search"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder="Buscar cursos, ejercicios…"
        aria-label="Búsqueda global"
        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-900"
      />

      {open && query.trim().length >= 2 && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 right-0 z-20 mt-1 max-h-96 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-lg dark:border-slate-800 dark:bg-slate-900">
            {searchQuery.isLoading && (
              <p className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">
                Buscando…
              </p>
            )}
            {searchQuery.data?.length === 0 && (
              <p className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">
                Sin resultados para "{query}".
              </p>
            )}
            {searchQuery.data?.map((item) => (
              <button
                key={`${item.type}-${item.id}`}
                onClick={() => goTo(item.link)}
                className="flex w-full items-center justify-between border-b border-slate-50 px-4 py-2 text-left text-sm last:border-0 hover:bg-slate-50 dark:border-slate-800/50 dark:hover:bg-slate-800/50"
              >
                <span>{item.title}</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {TYPE_LABELS[item.type] ?? item.type}
                </span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
