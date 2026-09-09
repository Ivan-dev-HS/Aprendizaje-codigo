-- AlterTable
ALTER TABLE "InterviewAnswer" ADD COLUMN     "communicationScore" INTEGER,
ADD COLUMN     "confidenceScore" INTEGER,
ADD COLUMN     "problemSolvingScore" INTEGER,
ADD COLUMN     "technicalScore" INTEGER;

-- AlterTable
ALTER TABLE "InterviewQuestion" ADD COLUMN     "slug" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "InterviewQuestion_slug_key" ON "InterviewQuestion"("slug");
