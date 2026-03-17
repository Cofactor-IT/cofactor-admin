ALTER TABLE "User"
ADD COLUMN "lastVisitAt" TIMESTAMP(3);

CREATE INDEX "User_lastVisitAt_idx" ON "User"("lastVisitAt");
