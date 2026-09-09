import { CelebrationOverlay } from "./CelebrationOverlay";

export function LevelUpModal({ level, onClose }: { level: number; onClose: () => void }) {
  return (
    <CelebrationOverlay onClose={onClose} closeLabel="¡Seguir aprendiendo!">
      <p className="text-5xl" aria-hidden="true">
        🚀
      </p>
      <h2 className="mt-3 text-xl font-bold">¡Subiste de nivel!</h2>
      <p className="mt-1 text-slate-600 dark:text-slate-400">
        Ahora eres <span className="font-semibold">Nivel {level}</span>. Sigue así.
      </p>
    </CelebrationOverlay>
  );
}
