-- CreateTable
CREATE TABLE "IqResult" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "sessionId" TEXT NOT NULL,
    "iqScore" INTEGER NOT NULL,
    "friScore" INTEGER NOT NULL,
    "qriScore" INTEGER NOT NULL,
    "vciScore" INTEGER NOT NULL,
    "vsiScore" INTEGER NOT NULL,
    "wmiScore" INTEGER NOT NULL,
    "percentile" INTEGER NOT NULL,
    "answers" JSONB NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IqResult_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "IqResult_userId_idx" ON "IqResult"("userId");

-- CreateIndex
CREATE INDEX "IqResult_sessionId_idx" ON "IqResult"("sessionId");
