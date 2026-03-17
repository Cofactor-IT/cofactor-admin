-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'IT_ADMIN';

-- AlterTable
ALTER TABLE "User" ADD COLUMN "gdprDelegate" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "User_gdprDelegate_idx" ON "User"("gdprDelegate");
