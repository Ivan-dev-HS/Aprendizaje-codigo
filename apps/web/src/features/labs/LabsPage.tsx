import { Link } from "react-router-dom";
import { Card } from "@codeforge/ui";
import { NavBar } from "../../app/NavBar";

const LABS = [
  {
    to: "/labs/playground",
    title: "Playground HTML/CSS/JS",
    description:
      "Edita HTML, CSS y JavaScript con vista previa en vivo. Guarda tus snapshots.",
    icon: "🎨",
  },
  {
    to: "/labs/javascript",
    title: "JavaScript Lab",
    description: "Escribe y ejecuta JavaScript real en un servicio de ejecución aislado.",
    icon: "⚡",
  },
  {
    to: "/labs/sql",
    title: "SQL Lab",
    description:
      "Practica SELECT, JOIN y GROUP BY contra un dataset real de solo lectura.",
    icon: "🗄️",
  },
  {
    to: "/labs/terminal",
    title: "Terminal Lab",
    description: "Un sistema de archivos virtual: ls, cd, mkdir, cat, echo, rm, cp, mv…",
    icon: "💻",
  },
  {
    to: "/labs/git",
    title: "Git Lab",
    description: "Aprende commits, ramas y merges con un grafo de Git simulado.",
    icon: "🌿",
  },
];

export function LabsPage() {
  return (
    <div className="min-h-screen">
      <NavBar />
      <main className="mx-auto max-w-5xl px-4 py-8">
        <h1 className="mb-1 text-2xl font-bold">Labs</h1>
        <p className="mb-6 text-slate-600 dark:text-slate-400">
          Herramientas interactivas para practicar sin salir de CodeForge.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          {LABS.map((lab) => (
            <Link key={lab.to} to={lab.to}>
              <Card className="hover:border-brand-400 dark:hover:border-brand-600 h-full transition">
                <div className="mb-2 text-2xl">{lab.icon}</div>
                <h2 className="font-semibold">{lab.title}</h2>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                  {lab.description}
                </p>
              </Card>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
