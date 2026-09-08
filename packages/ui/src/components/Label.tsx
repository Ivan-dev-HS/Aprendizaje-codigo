import type { LabelHTMLAttributes } from "react";
import { cn } from "../cn.js";

export function Label({ className, ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn(
        "mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300",
        className,
      )}
      {...props}
    />
  );
}

export function FieldError({ children }: { children?: string }) {
  if (!children) return null;
  return (
    <p role="alert" className="mt-1.5 text-sm text-red-600 dark:text-red-400">
      {children}
    </p>
  );
}
