-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('CITIZEN', 'CIVIC_EDITOR', 'LEGAL_VALIDATOR', 'ADMIN', 'SUPER_ADMIN');

-- CreateEnum
CREATE TYPE "ElectionType" AS ENUM ('GENERAL', 'STATE', 'LOCAL', 'BY_ELECTION', 'REFERENDUM');

-- CreateEnum
CREATE TYPE "ElectionStatus" AS ENUM ('UPCOMING', 'REGISTRATION_OPEN', 'REGISTRATION_CLOSED', 'VOTING_TODAY', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "VolatilityClass" AS ENUM ('STABLE', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "SourceCategory" AS ENUM ('ELECTION_COMMISSION', 'VOTER_PORTAL', 'LEGAL_STATUTE', 'OFFICIAL_FORM', 'EMERGENCY_CONTACT', 'INTERNATIONAL_REFERENCE');

-- CreateEnum
CREATE TYPE "LinkStatus" AS ENUM ('HEALTHY', 'REDIRECT', 'LINK_ROT');

-- CreateEnum
CREATE TYPE "ReadinessDomain" AS ENUM ('REGISTRATION', 'DOCUMENTATION', 'DEADLINE_AWARENESS', 'LOCATION', 'EMERGENCY_PREPARED');

-- CreateEnum
CREATE TYPE "ChecklistStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'NOT_APPLICABLE');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('REGISTRATION_DEADLINE', 'ELECTION_REMINDER', 'REGISTRATION_CONFIRMED', 'CHECKLIST_REMINDER', 'SYSTEM_ALERT', 'CIVIC_UPDATE');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "passwordHash" TEXT,
    "googleId" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'CITIZEN',
    "preferredLanguage" TEXT NOT NULL DEFAULT 'en',
    "preferredCountry" TEXT,
    "preferredPersona" TEXT,
    "elderlyMode" BOOLEAN NOT NULL DEFAULT false,
    "jargonMode" TEXT NOT NULL DEFAULT 'plain',
    "highContrast" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "userAgent" TEXT,
    "ipCountry" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "countries" (
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nativeName" TEXT,
    "flagEmoji" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "hasStates" BOOLEAN NOT NULL DEFAULT false,
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "countries_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "states" (
    "id" TEXT NOT NULL,
    "countryCode" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "states_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "elections" (
    "id" TEXT NOT NULL,
    "countryCode" TEXT NOT NULL,
    "electionType" "ElectionType" NOT NULL,
    "name" TEXT NOT NULL,
    "electionDate" TIMESTAMP(3) NOT NULL,
    "registrationDeadline" TIMESTAMP(3),
    "postalDeadline" TIMESTAMP(3),
    "status" "ElectionStatus" NOT NULL DEFAULT 'UPCOMING',
    "volatility" "VolatilityClass" NOT NULL DEFAULT 'HIGH',
    "officialSource" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "verifiedAt" TIMESTAMP(3),

    CONSTRAINT "elections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "civic_axioms" (
    "id" TEXT NOT NULL,
    "countryCode" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "subcategory" TEXT,
    "key" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "plainContent" TEXT,
    "volatility" "VolatilityClass" NOT NULL DEFAULT 'STABLE',
    "sourceId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "effectiveFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "effectiveTo" TIMESTAMP(3),
    "verifiedAt" TIMESTAMP(3),
    "verifiedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "civic_axioms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "official_sources" (
    "id" TEXT NOT NULL,
    "countryCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "shortName" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "category" "SourceCategory" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "linkStatus" "LinkStatus" NOT NULL DEFAULT 'HEALTHY',
    "lastChecked" TIMESTAMP(3),
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "official_sources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "emergency_resolutions" (
    "id" TEXT NOT NULL,
    "countryCode" TEXT NOT NULL,
    "scenario" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "cureWindow" TEXT NOT NULL,
    "steps" JSONB NOT NULL,
    "helpline" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "emergency_resolutions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "checklist_items" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "countryCode" TEXT NOT NULL,
    "itemKey" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "domain" "ReadinessDomain" NOT NULL,
    "status" "ChecklistStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "checklist_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "query_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "sessionId" TEXT,
    "countryCode" TEXT,
    "personaCode" TEXT,
    "queryIntent" TEXT,
    "promptHash" TEXT NOT NULL,
    "confidenceScore" DOUBLE PRECISION,
    "responseMode" TEXT,
    "volatilityClass" TEXT,
    "latencyMs" INTEGER,
    "tokensUsed" INTEGER,
    "wasHallucination" BOOLEAN NOT NULL DEFAULT false,
    "wasSafetyBlocked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "query_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "isEmailed" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "readAt" TIMESTAMP(3),

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "actorId" TEXT,
    "actorRole" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT,
    "entityId" TEXT,
    "before" JSONB,
    "after" JSONB,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_googleId_key" ON "users"("googleId");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_googleId_idx" ON "users"("googleId");

-- CreateIndex
CREATE INDEX "users_preferredCountry_idx" ON "users"("preferredCountry");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_refreshToken_key" ON "sessions"("refreshToken");

-- CreateIndex
CREATE INDEX "sessions_userId_idx" ON "sessions"("userId");

-- CreateIndex
CREATE INDEX "sessions_refreshToken_idx" ON "sessions"("refreshToken");

-- CreateIndex
CREATE INDEX "states_countryCode_idx" ON "states"("countryCode");

-- CreateIndex
CREATE UNIQUE INDEX "states_countryCode_code_key" ON "states"("countryCode", "code");

-- CreateIndex
CREATE INDEX "elections_countryCode_idx" ON "elections"("countryCode");

-- CreateIndex
CREATE INDEX "elections_electionDate_idx" ON "elections"("electionDate");

-- CreateIndex
CREATE INDEX "elections_status_idx" ON "elections"("status");

-- CreateIndex
CREATE INDEX "civic_axioms_countryCode_category_idx" ON "civic_axioms"("countryCode", "category");

-- CreateIndex
CREATE INDEX "civic_axioms_countryCode_volatility_idx" ON "civic_axioms"("countryCode", "volatility");

-- CreateIndex
CREATE INDEX "civic_axioms_key_idx" ON "civic_axioms"("key");

-- CreateIndex
CREATE UNIQUE INDEX "civic_axioms_countryCode_key_key" ON "civic_axioms"("countryCode", "key");

-- CreateIndex
CREATE INDEX "official_sources_countryCode_idx" ON "official_sources"("countryCode");

-- CreateIndex
CREATE INDEX "official_sources_category_idx" ON "official_sources"("category");

-- CreateIndex
CREATE INDEX "emergency_resolutions_countryCode_scenario_idx" ON "emergency_resolutions"("countryCode", "scenario");

-- CreateIndex
CREATE UNIQUE INDEX "emergency_resolutions_countryCode_scenario_key" ON "emergency_resolutions"("countryCode", "scenario");

-- CreateIndex
CREATE INDEX "checklist_items_userId_countryCode_idx" ON "checklist_items"("userId", "countryCode");

-- CreateIndex
CREATE UNIQUE INDEX "checklist_items_userId_itemKey_key" ON "checklist_items"("userId", "itemKey");

-- CreateIndex
CREATE INDEX "query_logs_userId_idx" ON "query_logs"("userId");

-- CreateIndex
CREATE INDEX "query_logs_countryCode_personaCode_idx" ON "query_logs"("countryCode", "personaCode");

-- CreateIndex
CREATE INDEX "query_logs_createdAt_idx" ON "query_logs"("createdAt");

-- CreateIndex
CREATE INDEX "query_logs_wasHallucination_idx" ON "query_logs"("wasHallucination");

-- CreateIndex
CREATE INDEX "notifications_userId_isRead_idx" ON "notifications"("userId", "isRead");

-- CreateIndex
CREATE INDEX "notifications_createdAt_idx" ON "notifications"("createdAt");

-- CreateIndex
CREATE INDEX "audit_logs_actorId_idx" ON "audit_logs"("actorId");

-- CreateIndex
CREATE INDEX "audit_logs_entityType_entityId_idx" ON "audit_logs"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "audit_logs_action_idx" ON "audit_logs"("action");

-- CreateIndex
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "states" ADD CONSTRAINT "states_countryCode_fkey" FOREIGN KEY ("countryCode") REFERENCES "countries"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "elections" ADD CONSTRAINT "elections_countryCode_fkey" FOREIGN KEY ("countryCode") REFERENCES "countries"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "civic_axioms" ADD CONSTRAINT "civic_axioms_countryCode_fkey" FOREIGN KEY ("countryCode") REFERENCES "countries"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "civic_axioms" ADD CONSTRAINT "civic_axioms_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "official_sources"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "official_sources" ADD CONSTRAINT "official_sources_countryCode_fkey" FOREIGN KEY ("countryCode") REFERENCES "countries"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "emergency_resolutions" ADD CONSTRAINT "emergency_resolutions_countryCode_fkey" FOREIGN KEY ("countryCode") REFERENCES "countries"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checklist_items" ADD CONSTRAINT "checklist_items_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "query_logs" ADD CONSTRAINT "query_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
