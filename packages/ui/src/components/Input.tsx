import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "../cn.js";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, hasError, ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      className={cn(
        "h-10 w-full rounded-lg border bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 dark:bg-slate-900 dark:text-slate-100",
        hasError
          ? "border-red-400 focus:border-red-500"
          : "focus:border-brand-500 border-slate-300 dark:border-slate-700",
        "focus:ring-brand-500/30 outline-none transition-colors focus:ring-2",
        className,
      )}
      aria-invalid={hasError || undefined}
      {...props}
    />
  );
});
