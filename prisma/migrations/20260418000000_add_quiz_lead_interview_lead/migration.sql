-- CreateTable
CREATE TABLE "QuizLead" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "whatsapp" TEXT NOT NULL,
    "country" TEXT,
    "quizAnswers" JSONB NOT NULL,
    "recommendedMajors" TEXT[],
    "recommendedUniversities" TEXT[],
    "leadSource" TEXT NOT NULL DEFAULT 'quiz',
    "status" TEXT NOT NULL DEFAULT 'new',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuizLead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InterviewLead" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "whatsapp" TEXT NOT NULL,
    "serviceType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'new',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InterviewLead_pkey" PRIMARY KEY ("id")
);
