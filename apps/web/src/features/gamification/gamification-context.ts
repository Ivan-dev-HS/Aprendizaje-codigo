import { createContext, useContext } from "react";
import type { GamificationSummary } from "@codeforge/types";

export interface GamificationContextValue {
  summary: GamificationSummary | undefined;
}

export const GamificationContext = createContext<GamificationContextValue>({
  summary: undefined,
});

export function useGamification() {
  return useContext(GamificationContext);
}
