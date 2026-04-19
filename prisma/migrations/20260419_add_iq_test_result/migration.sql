-- CreateTable
CREATE TABLE "IqTestResult" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "whatsapp" TEXT NOT NULL,
    "iqScore" INTEGER NOT NULL,
    "percentile" INTEGER NOT NULL,
    "versionNumber" INTEGER NOT NULL,
    "totalTimeMs" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IqTestResult_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "IqTestResult_email_idx" ON "IqTestResult"("email");

-- CreateIndex
CREATE INDEX "IqTestResult_createdAt_idx" ON "IqTestResult"("createdAt");
