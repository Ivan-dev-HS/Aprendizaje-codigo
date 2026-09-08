interface LockableModule {
  id: string;
  order: number;
  lessons: Array<{ id: string }>;
}

/**
 * Sección 10 de SPEC.md: "No permitir avanzar automáticamente cuando existan
 * requisitos importantes sin completar." Regla simple y explícita: el primer
 * módulo de un curso siempre está desbloqueado; los siguientes se desbloquean
 * cuando TODAS las lecciones del módulo anterior están completadas por el
 * usuario. Un módulo sin lecciones no bloquea al siguiente.
 */
export function computeModuleLocks(
  modules: LockableModule[],
  completedLessonIds: Set<string>,
): Map<string, boolean> {
  const sorted = [...modules].sort((a, b) => a.order - b.order);
  const locks = new Map<string, boolean>();
  let previousComplete = true;

  for (const mod of sorted) {
    locks.set(mod.id, !previousComplete);
    previousComplete =
      mod.lessons.length === 0 || mod.lessons.every((l) => completedLessonIds.has(l.id));
  }

  return locks;
}
