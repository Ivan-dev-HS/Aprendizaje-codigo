import { prisma } from "@codeforge/database";
import type { StandupEntrySummary } from "@codeforge/types";
import type { SubmitStandupInput } from "@codeforge/validators";
import { calculateCommunicationScore } from "./communication-score.js";

function toSummary(entry: {
  id: string;
  date: Date;
  yesterday: string;
  today: string;
  blockers: string | null;
  communicationScore: number | null;
}): StandupEntrySummary {
  return {
    id: entry.id,
    date: entry.date.toISOString(),
    yesterday: entry.yesterday,
    today: entry.today,
    blockers: entry.blockers,
    communicationScore: entry.communicationScore,
  };
}

export const standupsService = {
  async submit(userId: string, input: SubmitStandupInput): Promise<StandupEntrySummary> {
    const communicationScore = calculateCommunicationScore(
      input.yesterday,
      input.today,
      input.blockers,
    );
    const entry = await prisma.standupEntry.create({
      data: {
        userId,
        yesterday: input.yesterday,
        today: input.today,
        blockers: input.blockers,
        communicationScore,
      },
    });
    return toSummary(entry);
  },

  async listMine(userId: string): Promise<StandupEntrySummary[]> {
    const entries = await prisma.standupEntry.findMany({
      where: { userId },
      orderBy: { date: "desc" },
      take: 30,
    });
    return entries.map(toSummary);
  },
};
