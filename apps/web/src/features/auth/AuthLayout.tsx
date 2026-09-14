import type { ReactNode } from "react";
import { Card } from "@codeforge/ui";

/** Envoltorio compartido por login/registro/recuperación de contraseña. */
export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-indigo-50 via-white to-white px-4 py-12 dark:from-indigo-950/40 dark:via-slate-950 dark:to-slate-950">
      <Card
        className={`game-panel w-full max-w-md rounded-3xl border-2 border-indigo-100 [--game-shadow:theme(colors.indigo.200)] dark:border-indigo-900 dark:[--game-shadow:theme(colors.indigo.900)]`}
      >
        {children}
      </Card>
    </main>
  );
}
