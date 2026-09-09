/*
  Warnings:

  - Added the required column `candidateIssues` to the `PullRequest` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "XpSource" ADD VALUE 'CODE_REVIEW';

-- AlterTable
ALTER TABLE "PullRequest" ADD COLUMN     "candidateIssues" JSONB NOT NULL;
