-- CreateEnum
CREATE TYPE "IndicatorType" AS ENUM ('URL', 'DOMAIN', 'IP');

-- CreateEnum
CREATE TYPE "InvestigationStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'PARTIAL', 'FAILED');

-- CreateEnum
CREATE TYPE "RiskLevel" AS ENUM ('UNKNOWN', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "ThreatProvider" AS ENUM ('VIRUSTOTAL', 'URLHAUS', 'ABUSEIPDB');

-- CreateEnum
CREATE TYPE "ProviderStatus" AS ENUM ('PENDING', 'SUCCESS', 'FAILED', 'RATE_LIMITED', 'TIMEOUT', 'SKIPPED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ThreatIndicator" (
    "id" TEXT NOT NULL,
    "type" "IndicatorType" NOT NULL,
    "originalValue" TEXT NOT NULL,
    "normalizedValue" TEXT NOT NULL,
    "firstSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastInvestigatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ThreatIndicator_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Investigation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "indicatorId" TEXT NOT NULL,
    "status" "InvestigationStatus" NOT NULL DEFAULT 'PENDING',
    "riskScore" INTEGER,
    "riskLevel" "RiskLevel" NOT NULL DEFAULT 'UNKNOWN',
    "summary" TEXT,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Investigation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProviderResult" (
    "id" TEXT NOT NULL,
    "investigationId" TEXT NOT NULL,
    "provider" "ThreatProvider" NOT NULL,
    "status" "ProviderStatus" NOT NULL DEFAULT 'PENDING',
    "rawResponse" JSONB,
    "normalizedData" JSONB,
    "detectionCount" INTEGER,
    "totalEngines" INTEGER,
    "errorCode" TEXT,
    "errorMessage" TEXT,
    "cacheHit" BOOLEAN NOT NULL DEFAULT false,
    "fetchedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProviderResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RiskAssessment" (
    "id" TEXT NOT NULL,
    "investigationId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "level" "RiskLevel" NOT NULL,
    "explanation" JSONB NOT NULL,
    "algorithmVersion" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RiskAssessment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ThreatCache" (
    "id" TEXT NOT NULL,
    "indicatorId" TEXT NOT NULL,
    "provider" "ThreatProvider" NOT NULL,
    "response" JSONB NOT NULL,
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ThreatCache_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_createdAt_idx" ON "User"("createdAt");

-- CreateIndex
CREATE INDEX "ThreatIndicator_type_lastInvestigatedAt_idx" ON "ThreatIndicator"("type", "lastInvestigatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "ThreatIndicator_type_normalizedValue_key" ON "ThreatIndicator"("type", "normalizedValue");

-- CreateIndex
CREATE INDEX "Investigation_userId_createdAt_idx" ON "Investigation"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Investigation_indicatorId_createdAt_idx" ON "Investigation"("indicatorId", "createdAt");

-- CreateIndex
CREATE INDEX "Investigation_status_createdAt_idx" ON "Investigation"("status", "createdAt");

-- CreateIndex
CREATE INDEX "Investigation_riskLevel_createdAt_idx" ON "Investigation"("riskLevel", "createdAt");

-- CreateIndex
CREATE INDEX "ProviderResult_provider_status_createdAt_idx" ON "ProviderResult"("provider", "status", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ProviderResult_investigationId_provider_key" ON "ProviderResult"("investigationId", "provider");

-- CreateIndex
CREATE INDEX "RiskAssessment_investigationId_createdAt_idx" ON "RiskAssessment"("investigationId", "createdAt");

-- CreateIndex
CREATE INDEX "ThreatCache_expiresAt_idx" ON "ThreatCache"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "ThreatCache_indicatorId_provider_key" ON "ThreatCache"("indicatorId", "provider");

-- CreateIndex
CREATE INDEX "AuditLog_userId_createdAt_idx" ON "AuditLog"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_action_createdAt_idx" ON "AuditLog"("action", "createdAt");

-- AddForeignKey
ALTER TABLE "Investigation" ADD CONSTRAINT "Investigation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Investigation" ADD CONSTRAINT "Investigation_indicatorId_fkey" FOREIGN KEY ("indicatorId") REFERENCES "ThreatIndicator"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProviderResult" ADD CONSTRAINT "ProviderResult_investigationId_fkey" FOREIGN KEY ("investigationId") REFERENCES "Investigation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RiskAssessment" ADD CONSTRAINT "RiskAssessment_investigationId_fkey" FOREIGN KEY ("investigationId") REFERENCES "Investigation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ThreatCache" ADD CONSTRAINT "ThreatCache_indicatorId_fkey" FOREIGN KEY ("indicatorId") REFERENCES "ThreatIndicator"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
