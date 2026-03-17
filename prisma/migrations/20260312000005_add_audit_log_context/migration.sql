ALTER TABLE "AuditLog"
ADD COLUMN "userEmail" TEXT,
ADD COLUMN "status" TEXT NOT NULL DEFAULT 'SUCCESS',
ADD COLUMN "error" TEXT;

CREATE INDEX "AuditLog_userEmail_idx" ON "AuditLog"("userEmail");
CREATE INDEX "AuditLog_status_idx" ON "AuditLog"("status");
