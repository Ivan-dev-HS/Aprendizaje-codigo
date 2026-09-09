import { Link, useLocation } from "react-router-dom";

const LINKS: { to: string; label: string }[] = [
  { to: "/admin", label: "Resumen" },
  { to: "/admin/analytics", label: "Analítica" },
  { to: "/admin/users", label: "Usuarios" },
  { to: "/admin/courses", label: "Cursos" },
  { to: "/admin/modules", label: "Módulos" },
  { to: "/admin/lessons", label: "Lecciones" },
  { to: "/admin/exercises", label: "Ejercicios" },
  { to: "/admin/projects", label: "Proyectos" },
  { to: "/admin/skills", label: "Skills" },
  { to: "/admin/achievements", label: "Logros" },
  { to: "/admin/interview-questions", label: "Preguntas de entrevista" },
  { to: "/admin/tickets", label: "Tickets" },
  { to: "/admin/feature-flags", label: "Feature flags" },
  { to: "/admin/audit-log", label: "Audit log" },
];

export function AdminNav() {
  const location = useLocation();
  return (
    <nav className="mb-6 flex flex-wrap gap-1 border-b border-slate-200 pb-4 dark:border-slate-800">
      {LINKS.map((link) => (
        <Link
          key={link.to}
          to={link.to}
          className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
            location.pathname === link.to
              ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
              : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
          }`}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
