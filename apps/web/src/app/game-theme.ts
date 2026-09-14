/**
 * Paleta "ficha de juego" compartida por Dashboard, NavBar y las páginas
 * que adoptan el mismo estilo: fondo saturado + borde grueso a juego +
 * color de la sombra sólida (--game-shadow, ver .game-panel/.game-btn en
 * index.css) con su variante para modo oscuro.
 */
export const GAME_THEMES = {
  indigo: {
    card: "border-indigo-300 bg-gradient-to-br from-indigo-100 to-violet-200 dark:border-indigo-800 dark:from-indigo-950/50 dark:to-violet-900/30",
    badge: "bg-gradient-to-br from-indigo-400 to-violet-500 text-white",
    bar: "bg-gradient-to-r from-indigo-400 to-violet-500",
    shadowVar: "[--game-shadow:#a5b4fc] dark:[--game-shadow:#4338ca]",
  },
  orange: {
    card: "border-orange-300 bg-gradient-to-br from-orange-100 to-red-200 dark:border-orange-800 dark:from-orange-950/50 dark:to-red-900/30",
    badge: "bg-gradient-to-br from-orange-400 to-red-500 text-white",
    bar: "bg-gradient-to-r from-orange-400 to-red-500",
    shadowVar: "[--game-shadow:#fdba74] dark:[--game-shadow:#c2410c]",
  },
  emerald: {
    card: "border-emerald-300 bg-gradient-to-br from-emerald-100 to-teal-200 dark:border-emerald-800 dark:from-emerald-950/50 dark:to-teal-900/30",
    badge: "bg-gradient-to-br from-emerald-400 to-teal-500 text-white",
    bar: "bg-gradient-to-r from-emerald-400 to-teal-500",
    shadowVar: "[--game-shadow:#6ee7b7] dark:[--game-shadow:#047857]",
  },
  amber: {
    card: "border-amber-300 bg-amber-100 dark:border-amber-800 dark:bg-amber-950/30",
    badge: "bg-gradient-to-br from-amber-300 to-yellow-500 text-white",
    bar: "bg-gradient-to-r from-amber-400 to-yellow-500",
    shadowVar: "[--game-shadow:#fcd34d] dark:[--game-shadow:#b45309]",
  },
  purple: {
    card: "border-purple-300 bg-purple-100 dark:border-purple-800 dark:bg-purple-950/30",
    badge: "bg-gradient-to-br from-purple-400 to-fuchsia-500 text-white",
    bar: "bg-gradient-to-r from-purple-400 to-fuchsia-500",
    shadowVar: "[--game-shadow:#d8b4fe] dark:[--game-shadow:#7e22ce]",
  },
  teal: {
    card: "border-teal-300 bg-teal-100 dark:border-teal-800 dark:bg-teal-950/30",
    badge: "bg-gradient-to-br from-teal-400 to-cyan-500 text-white",
    bar: "bg-gradient-to-r from-teal-400 to-cyan-500",
    shadowVar: "[--game-shadow:#5eead4] dark:[--game-shadow:#0f766e]",
  },
  rose: {
    card: "border-rose-300 bg-rose-100 dark:border-rose-800 dark:bg-rose-950/30",
    badge: "bg-gradient-to-br from-rose-400 to-pink-500 text-white",
    bar: "bg-gradient-to-r from-rose-400 to-pink-500",
    shadowVar: "[--game-shadow:#fda4af] dark:[--game-shadow:#be123c]",
  },
  slate: {
    card: "border-slate-300 bg-slate-100 dark:border-slate-700 dark:bg-slate-800/60",
    badge: "bg-gradient-to-br from-slate-400 to-slate-500 text-white",
    bar: "bg-gradient-to-r from-slate-400 to-slate-500",
    shadowVar: "[--game-shadow:#cbd5e1] dark:[--game-shadow:#334155]",
  },
} as const;

export type GameThemeName = keyof typeof GAME_THEMES;
