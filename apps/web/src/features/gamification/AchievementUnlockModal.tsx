import type { AchievementSummary } from "@codeforge/types";
import { CelebrationOverlay } from "./CelebrationOverlay";

export function AchievementUnlockModal({
  achievement,
  onClose,
}: {
  achievement: AchievementSummary;
  onClose: () => void;
}) {
  return (
    <CelebrationOverlay onClose={onClose} closeLabel="Genial">
      <p className="text-5xl" aria-hidden="true">
        {achievement.icon}
      </p>
      <h2 className="mt-3 text-xl font-bold">¡Logro desbloqueado!</h2>
      <p className="mt-1 font-medium">{achievement.title}</p>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
        {achievement.description}
      </p>
      {achievement.xpReward > 0 && (
        <p className="mt-2 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
          +{achievement.xpReward} XP
        </p>
      )}
    </CelebrationOverlay>
  );
}
