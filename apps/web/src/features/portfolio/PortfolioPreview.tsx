import type { PortfolioView } from "@codeforge/types";
import { Card } from "@codeforge/ui";

export function PortfolioPreview({ portfolio }: { portfolio: PortfolioView }) {
  return (
    <Card>
      <div className="flex items-center gap-4">
        {portfolio.avatarUrl ? (
          <img
            src={portfolio.avatarUrl}
            alt={portfolio.displayName}
            className="h-16 w-16 rounded-full object-cover"
          />
        ) : (
          <div className="bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300 flex h-16 w-16 items-center justify-center rounded-full text-xl font-bold">
            {portfolio.displayName.slice(0, 1).toUpperCase()}
          </div>
        )}
        <div>
          <h2 className="text-xl font-bold">{portfolio.displayName}</h2>
          {portfolio.headline && (
            <p className="text-slate-600 dark:text-slate-400">{portfolio.headline}</p>
          )}
          <p className="text-xs text-slate-500 dark:text-slate-500">
            Nivel {portfolio.level} · {portfolio.totalXp} XP
          </p>
        </div>
      </div>

      {portfolio.bio && <p className="mt-4 text-sm">{portfolio.bio}</p>}

      {portfolio.skills.length > 0 && (
        <div className="mt-4">
          <h3 className="mb-2 text-sm font-semibold">Skills</h3>
          <div className="flex flex-wrap gap-2">
            {portfolio.skills.map((s) => (
              <span
                key={s.slug}
                className="rounded-full bg-slate-100 px-3 py-1 text-xs dark:bg-slate-800"
              >
                {s.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {portfolio.projects.length > 0 && (
        <div className="mt-4">
          <h3 className="mb-2 text-sm font-semibold">Proyectos</h3>
          <div className="space-y-3">
            {portfolio.projects.map((p) => (
              <div
                key={p.slug}
                className="rounded-lg border border-slate-200 p-3 text-sm dark:border-slate-800"
              >
                <p className="font-medium">{p.title}</p>
                <p className="text-slate-600 dark:text-slate-400">{p.brief}</p>
                <div className="mt-2 flex flex-wrap gap-2 text-xs">
                  {p.githubUrl && (
                    <a
                      href={p.githubUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-brand-600 dark:text-brand-400 hover:underline"
                    >
                      GitHub
                    </a>
                  )}
                  {p.demoUrl && (
                    <a
                      href={p.demoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-brand-600 dark:text-brand-400 hover:underline"
                    >
                      Demo
                    </a>
                  )}
                  {p.technologies.map((t) => (
                    <span
                      key={t}
                      className="rounded bg-slate-100 px-2 py-0.5 dark:bg-slate-800"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {portfolio.achievements.length > 0 && (
        <div className="mt-4">
          <h3 className="mb-2 text-sm font-semibold">Logros</h3>
          <div className="flex flex-wrap gap-2">
            {portfolio.achievements.map((a) => (
              <span
                key={a.slug}
                title={a.title}
                className="flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs dark:bg-slate-800"
              >
                <span aria-hidden="true">{a.icon}</span> {a.title}
              </span>
            ))}
          </div>
        </div>
      )}

      {portfolio.education.length > 0 && (
        <div className="mt-4">
          <h3 className="mb-2 text-sm font-semibold">Formación</h3>
          <ul className="space-y-1 text-sm">
            {portfolio.education.map((e, i) => (
              <li key={i}>
                {e.degree} — {e.institution}
              </li>
            ))}
          </ul>
        </div>
      )}

      {portfolio.links.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-3 text-sm">
          {portfolio.links.map((l) => (
            <a
              key={l.url}
              href={l.url}
              target="_blank"
              rel="noreferrer"
              className="text-brand-600 dark:text-brand-400 hover:underline"
            >
              {l.label}
            </a>
          ))}
        </div>
      )}
    </Card>
  );
}
