import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import type { Difficulty } from "@codeforge/types";
import { NavBar } from "../../app/NavBar";
import { GAME_THEMES, type GameThemeName } from "../../app/game-theme";
import { exercisesApi } from "./exercises.api";
import { skillsApi } from "./skills.api";

const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  EASY: "Fácil",
  MEDIUM: "Media",
  HARD: "Difícil",
};

const DIFFICULTY_THEME: Record<Difficulty, GameThemeName> = {
  EASY: "emerald",
  MEDIUM: "amber",
  HARD: "rose",
};

export function ExercisesPage() {
  const [skillSlug, setSkillSlug] = useState<string>("");
  const [difficulty, setDifficulty] = useState<Difficulty | "">("");

  const skillsQuery = useQuery({ queryKey: ["skills"], queryFn: skillsApi.list });
  const exercisesQuery = useQuery({
    queryKey: ["exercises", skillSlug, difficulty],
    queryFn: () =>
      exercisesApi.list({
        skillSlug: skillSlug || undefined,
        difficulty: difficulty || undefined,
        pageSize: 50,
      }),
  });

  return (
    <div className="min-h-screen">
      <NavBar />
      <main className="mx-auto max-w-4xl px-4 py-10">
        <h1 className="font-display mb-2 text-2xl font-bold">Ejercicios</h1>
        <p className="mb-6 text-sm text-slate-600 dark:text-slate-400">
          Practica conceptos concretos: cada ejercicio otorga XP la primera vez que lo
          aciertas.
        </p>

        <div className="mb-6 flex flex-wrap gap-3">
          <select
            value={skillSlug}
            onChange={(e) => setSkillSlug(e.target.value)}
            className="rounded-full border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
          >
            <option value="">Todas las skills</option>
            {skillsQuery.data?.map((s) => (
              <option key={s.slug} value={s.slug}>
                {s.name}
              </option>
            ))}
          </select>

          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as Difficulty | "")}
            className="rounded-full border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
          >
            <option value="">Todas las dificultades</option>
            <option value="EASY">Fácil</option>
            <option value="MEDIUM">Media</option>
            <option value="HARD">Difícil</option>
          </select>
        </div>

        {exercisesQuery.isLoading && <p className="text-sm">Cargando ejercicios…</p>}
        {exercisesQuery.data && exercisesQuery.data.items.length === 0 && (
          <p className="text-sm text-slate-600 dark:text-slate-400">
            No hay ejercicios con estos filtros todavía.
          </p>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          {exercisesQuery.data?.items.map((ex, i) => {
            const t = GAME_THEMES[DIFFICULTY_THEME[ex.difficulty]];
            return (
              <Link key={ex.id} to={`/exercises/${ex.id}`} className="block h-full">
                <div
                  className={`game-btn animate-pop-in h-full cursor-pointer rounded-3xl border-2 p-5 ${t.card} ${t.shadowVar}`}
                  style={{ animationDelay: `${i * 40}ms` }}
                >
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <span
                      className={`font-display rounded-full px-2.5 py-0.5 text-xs font-bold ${t.badge}`}
                    >
                      {DIFFICULTY_LABELS[ex.difficulty]} · {ex.points} XP
                    </span>
                    {ex.isCompleted && <span title="Completado">✅</span>}
                  </div>
                  <h2 className="font-display font-bold">{ex.title}</h2>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                    {ex.description}
                  </p>
                  <p className="mt-2 text-xs text-slate-600 dark:text-slate-500">
                    {ex.skill.name}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
}
