import { cn } from "../cn.js";

export function Spinner({
  className,
  label = "Cargando…",
}: {
  className?: string;
  label?: string;
}) {
  return (
    <span role="status" className="inline-flex items-center gap-2">
      <span
        className={cn(
          "border-t-brand-600 dark:border-t-brand-400 h-5 w-5 animate-spin rounded-full border-2 border-slate-300 dark:border-slate-700",
          className,
        )}
        aria-hidden="true"
      />
      <span className="sr-only">{label}</span>
    </span>
  );
}
