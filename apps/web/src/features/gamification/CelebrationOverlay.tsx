import type { ReactNode } from "react";
import { Button } from "@codeforge/ui";

const CONFETTI = ["🎉", "✨", "🎊", "⭐", "🔥"];

export function CelebrationOverlay({
  children,
  onClose,
  closeLabel,
}: {
  children: ReactNode;
  onClose: () => void;
  closeLabel: string;
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
    >
      <div className="animate-pop-in relative w-full max-w-sm overflow-hidden rounded-2xl bg-white p-6 text-center shadow-xl dark:bg-slate-900">
        <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-around">
          {CONFETTI.map((emoji, i) => (
            <span
              key={i}
              className="animate-confetti text-xl"
              style={{ animationDelay: `${i * 0.12}s` }}
              aria-hidden="true"
            >
              {emoji}
            </span>
          ))}
        </div>
        {children}
        <Button className="mt-5 w-full" onClick={onClose}>
          {closeLabel}
        </Button>
      </div>
    </div>
  );
}
