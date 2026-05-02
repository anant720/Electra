-- =============================================================================
-- ELECTRA — Supabase Production Migration
-- Run this entire file in: Supabase Dashboard → SQL Editor → Run
-- =============================================================================

-- ─── 1. SCHEMAS ──────────────────────────────────────────────────────────────
CREATE SCHEMA IF NOT EXISTS civic;
CREATE SCHEMA IF NOT EXISTS users;
CREATE SCHEMA IF NOT EXISTS governance;
CREATE SCHEMA IF NOT EXISTS ai_ops;
CREATE SCHEMA IF NOT EXISTS ops;

-- ─── 2. TRIGGER FUNCTION (updated_at) ────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- CIVIC SCHEMA
-- =============================================================================

CREATE TABLE IF NOT EXISTS civic.regions (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code        VARCHAR(20)  NOT NULL UNIQUE,
    name        VARCHAR(100) NOT NULL,
    description TEXT,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS civic.countries (
    id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code                     CHAR(3)      NOT NULL UNIQUE,
    name                     VARCHAR(100) NOT NULL,
    name_local               VARCHAR(100),
    region_id                UUID         NOT NULL REFERENCES civic.regions(id),
    flag_emoji               VARCHAR(10),
    governance_type          VARCHAR(100) NOT NULL,
    head_of_state_role       VARCHAR(100),
    head_of_government_role  VARCHAR(100),
    authority_name           VARCHAR(200) NOT NULL,
    authority_abbr           VARCHAR(20),
    authority_portal         VARCHAR(500),
    voter_helpline           VARCHAR(50),
    voting_age               SMALLINT     NOT NULL DEFAULT 18 CHECK (voting_age BETWEEN 16 AND 25),
    compulsory_voting        BOOLEAN      NOT NULL DEFAULT FALSE,
    compulsory_fine_amount   NUMERIC(10,2),
    compulsory_fine_currency CHAR(3),
    registration_model       VARCHAR(20)  NOT NULL CHECK (registration_model IN ('opt-in','automatic','compulsory')),
    electoral_system_lower   VARCHAR(100),
    electoral_system_upper   VARCHAR(100),
    complexity_score         SMALLINT     CHECK (complexity_score BETWEEN 1 AND 10),
    legal_volatility_score   SMALLINT     CHECK (legal_volatility_score BETWEEN 1 AND 10),
    is_mvp                   BOOLEAN      NOT NULL DEFAULT FALSE,
    is_active                BOOLEAN      NOT NULL DEFAULT TRUE,
    deleted_at               TIMESTAMPTZ,
    created_at               TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at               TIMESTAMPTZ  NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_countries_region ON civic.countries(region_id);
CREATE INDEX IF NOT EXISTS idx_countries_mvp    ON civic.countries(is_mvp) WHERE is_mvp = TRUE;

CREATE TABLE IF NOT EXISTS civic.jurisdictions (
    id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    country_id                UUID         NOT NULL REFERENCES civic.countries(id),
    parent_id                 UUID         REFERENCES civic.jurisdictions(id),
    name                      VARCHAR(200) NOT NULL,
    name_local                VARCHAR(200),
    level                     VARCHAR(30)  NOT NULL CHECK (level IN ('State','Province','Territory','District','County','Constituency','Precinct','Ward','Division')),
    code                      VARCHAR(20),
    population                BIGINT,
    has_separate_authority    BOOLEAN      NOT NULL DEFAULT FALSE,
    separate_authority_name   VARCHAR(200),
    separate_authority_portal VARCHAR(500),
    metadata                  JSONB        DEFAULT '{}',
    is_active                 BOOLEAN      NOT NULL DEFAULT TRUE,
    deleted_at                TIMESTAMPTZ,
    created_at                TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at                TIMESTAMPTZ  NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_jurisdictions_country ON civic.jurisdictions(country_id);
CREATE INDEX IF NOT EXISTS idx_jurisdictions_parent  ON civic.jurisdictions(parent_id);

CREATE TABLE IF NOT EXISTS civic.election_types (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    country_id            UUID         NOT NULL REFERENCES civic.countries(id),
    code                  VARCHAR(50)  NOT NULL,
    name                  VARCHAR(200) NOT NULL,
    category              VARCHAR(30)  NOT NULL CHECK (category IN ('National','State','Local','Primary','Special','Referendum','By-election','Overseas')),
    electoral_system      VARCHAR(100),
    total_seats           INTEGER      CHECK (total_seats > 0),
    frequency_years       SMALLINT,
    term_years            SMALLINT,
    managed_by            VARCHAR(200),
    voting_system_details JSONB        DEFAULT '{}',
    is_active             BOOLEAN      NOT NULL DEFAULT TRUE,
    deleted_at            TIMESTAMPTZ,
    created_at            TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at            TIMESTAMPTZ  NOT NULL DEFAULT now(),
    UNIQUE(country_id, code)
);

CREATE TABLE IF NOT EXISTS civic.election_events (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    election_type_id      UUID         NOT NULL REFERENCES civic.election_types(id),
    jurisdiction_id       UUID         REFERENCES civic.jurisdictions(id),
    name                  VARCHAR(200) NOT NULL,
    election_date         DATE,
    registration_opens    DATE,
    registration_deadline DATE,
    nomination_deadline   DATE,
    campaign_start        DATE,
    campaign_end          DATE,
    counting_date         DATE,
    certification_date    DATE,
    status                VARCHAR(20)  NOT NULL DEFAULT 'Scheduled' CHECK (status IN ('Announced','Scheduled','Active','Counting','Certified','Disputed','Cancelled')),
    technologies_deployed TEXT[]       NOT NULL DEFAULT '{}',
    special_provisions    JSONB        DEFAULT '{}',
    volatility_class      VARCHAR(6)   NOT NULL DEFAULT 'HIGH' CHECK (volatility_class IN ('STABLE','MEDIUM','HIGH')),
    last_verified_at      TIMESTAMPTZ,
    is_active             BOOLEAN      NOT NULL DEFAULT TRUE,
    deleted_at            TIMESTAMPTZ,
    created_at            TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at            TIMESTAMPTZ  NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_events_date   ON civic.election_events(election_date) WHERE election_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_events_status ON civic.election_events(status);

CREATE TABLE IF NOT EXISTS civic.election_stages (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id     UUID         NOT NULL REFERENCES civic.election_events(id) ON DELETE CASCADE,
    stage_number SMALLINT     NOT NULL CHECK (stage_number BETWEEN 1 AND 11),
    name         VARCHAR(100) NOT NULL,
    status       VARCHAR(10)  NOT NULL DEFAULT 'Upcoming' CHECK (status IN ('Past','Active','Upcoming')),
    key_date     DATE,
    plain_desc   TEXT,
    user_action  TEXT,
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT now(),
    UNIQUE(event_id, stage_number)
);

CREATE TABLE IF NOT EXISTS civic.voter_requirements (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    country_id       UUID        NOT NULL REFERENCES civic.countries(id),
    jurisdiction_id  UUID        REFERENCES civic.jurisdictions(id),
    req_type         VARCHAR(30) NOT NULL CHECK (req_type IN ('Age','Citizenship','Residency','ID','Registration','Enrollment')),
    description      TEXT        NOT NULL,
    plain_desc       TEXT,
    is_mandatory     BOOLEAN     NOT NULL DEFAULT TRUE,
    has_alternatives BOOLEAN     NOT NULL DEFAULT FALSE,
    alternatives_desc TEXT,
    volatility_class VARCHAR(6)  NOT NULL DEFAULT 'MEDIUM' CHECK (volatility_class IN ('STABLE','MEDIUM','HIGH')),
    effective_from   DATE,
    effective_to     DATE,
    is_active        BOOLEAN     NOT NULL DEFAULT TRUE,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_req_country ON civic.voter_requirements(country_id);

CREATE TABLE IF NOT EXISTS civic.official_documents (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    country_id       UUID         NOT NULL REFERENCES civic.countries(id),
    code             VARCHAR(50)  NOT NULL,
    name             VARCHAR(200) NOT NULL,
    purpose          TEXT         NOT NULL,
    target_personas  TEXT[]       NOT NULL DEFAULT '{}',
    download_url     VARCHAR(500),
    portal_url       VARCHAR(500),
    processing_min   SMALLINT,
    processing_max   SMALLINT,
    required_docs    TEXT[]       NOT NULL DEFAULT '{}',
    volatility_class VARCHAR(6)   NOT NULL DEFAULT 'MEDIUM' CHECK (volatility_class IN ('STABLE','MEDIUM','HIGH')),
    last_verified_at TIMESTAMPTZ,
    is_active        BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at       TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at       TIMESTAMPTZ  NOT NULL DEFAULT now(),
    UNIQUE(country_id, code)
);

CREATE TABLE IF NOT EXISTS civic.personas (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code            VARCHAR(5)   NOT NULL UNIQUE,
    name            VARCHAR(100) NOT NULL,
    short_label     VARCHAR(50)  NOT NULL,
    primary_emotion VARCHAR(200),
    core_fear       TEXT,
    guidance_mode   VARCHAR(30)  NOT NULL DEFAULT 'standard',
    reading_level   VARCHAR(30)  NOT NULL DEFAULT 'plain',
    checklist_type  VARCHAR(100),
    is_active       BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS civic.persona_blockers (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id   UUID         NOT NULL REFERENCES civic.personas(id),
    blocker_type VARCHAR(15)  NOT NULL CHECK (blocker_type IN ('operational','emotional')),
    text         TEXT         NOT NULL,
    sort_order   SMALLINT     NOT NULL DEFAULT 0,
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS civic.scenarios (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code            VARCHAR(5)   NOT NULL UNIQUE,
    title           VARCHAR(200) NOT NULL,
    severity        VARCHAR(10)  NOT NULL CHECK (severity IN ('CRITICAL','HIGH','MEDIUM','LOW')),
    timing          VARCHAR(50),
    trigger_phrases TEXT[]       NOT NULL DEFAULT '{}',
    is_emergency    BOOLEAN      NOT NULL DEFAULT FALSE,
    is_active       BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS civic.resolution_paths (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scenario_id      UUID         NOT NULL REFERENCES civic.scenarios(id),
    country_id       UUID         NOT NULL REFERENCES civic.countries(id),
    step_number      SMALLINT     NOT NULL,
    step_text        TEXT         NOT NULL,
    step_type        VARCHAR(15)  NOT NULL DEFAULT 'action' CHECK (step_type IN ('action','legal_script','contact','post_election','note')),
    official_contact VARCHAR(200),
    created_at       TIMESTAMPTZ  NOT NULL DEFAULT now(),
    UNIQUE(scenario_id, country_id, step_number)
);
CREATE INDEX IF NOT EXISTS idx_resolution_country ON civic.resolution_paths(country_id);

-- =============================================================================
-- USERS SCHEMA
-- =============================================================================

CREATE TABLE IF NOT EXISTS users.users (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email             VARCHAR(320) NOT NULL UNIQUE,
    password_hash     VARCHAR(100),
    role              VARCHAR(20)  NOT NULL DEFAULT 'REGISTERED_USER' CHECK (role IN ('GUEST','REGISTERED_USER','CIVIC_EDITOR','LEGAL_VALIDATOR','ADMIN','SUPER_ADMIN')),
    email_verified    BOOLEAN      NOT NULL DEFAULT FALSE,
    email_verified_at TIMESTAMPTZ,
    oauth_provider    VARCHAR(20),
    oauth_id          VARCHAR(200),
    firebase_uid      VARCHAR(128) UNIQUE,
    preferred_country CHAR(3),
    preferred_persona VARCHAR(5),
    preferred_language CHAR(5)     NOT NULL DEFAULT 'en',
    elderly_mode      BOOLEAN      NOT NULL DEFAULT FALSE,
    high_contrast     BOOLEAN      NOT NULL DEFAULT FALSE,
    consent_given_at  TIMESTAMPTZ,
    consent_version   VARCHAR(10),
    mfa_enabled       BOOLEAN      NOT NULL DEFAULT FALSE,
    mfa_secret_enc    TEXT,
    login_attempts    SMALLINT     NOT NULL DEFAULT 0,
    locked_until      TIMESTAMPTZ,
    is_active         BOOLEAN      NOT NULL DEFAULT TRUE,
    deleted_at        TIMESTAMPTZ,
    created_at        TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at        TIMESTAMPTZ  NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_users_email       ON users.users(email);
CREATE INDEX IF NOT EXISTS idx_users_firebase    ON users.users(firebase_uid) WHERE firebase_uid IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_active      ON users.users(is_active) WHERE is_active = TRUE;

CREATE TABLE IF NOT EXISTS users.sessions (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID         NOT NULL REFERENCES users.users(id) ON DELETE CASCADE,
    token_hash  VARCHAR(100) NOT NULL UNIQUE,
    user_agent  VARCHAR(500),
    ip_address  INET,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT now(),
    expires_at  TIMESTAMPTZ  NOT NULL,
    revoked_at  TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_sessions_user   ON users.sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_active ON users.sessions(token_hash) WHERE revoked_at IS NULL;

CREATE TABLE IF NOT EXISTS users.readiness_scores (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID         REFERENCES users.users(id),
    session_token   VARCHAR(100),
    persona_code    CHAR(3)      NOT NULL,
    country_code    CHAR(3)      NOT NULL,
    score           SMALLINT     NOT NULL DEFAULT 0 CHECK (score BETWEEN 0 AND 100),
    completed_items TEXT[]       NOT NULL DEFAULT '{}',
    total_items     SMALLINT     NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_readiness_user    ON users.readiness_scores(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_readiness_country ON users.readiness_scores(country_code);

CREATE TABLE IF NOT EXISTS users.checklist_items (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id      UUID         NOT NULL REFERENCES users.users(id) ON DELETE CASCADE,
    country_code CHAR(3)      NOT NULL,
    item_key     VARCHAR(20)  NOT NULL,
    label        TEXT         NOT NULL,
    domain       VARCHAR(30)  NOT NULL CHECK (domain IN ('REGISTRATION','DOCUMENTATION','DEADLINE_AWARENESS','LOCATION','EMERGENCY_PREPARED')),
    status       VARCHAR(15)  NOT NULL DEFAULT 'NOT_STARTED' CHECK (status IN ('NOT_STARTED','IN_PROGRESS','COMPLETED','NOT_APPLICABLE')),
    completed_at TIMESTAMPTZ,
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at   TIMESTAMPTZ  NOT NULL DEFAULT now(),
    UNIQUE(user_id, item_key)
);
CREATE INDEX IF NOT EXISTS idx_checklist_user ON users.checklist_items(user_id, country_code);

CREATE TABLE IF NOT EXISTS users.notification_preferences (
    id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id              UUID        NOT NULL REFERENCES users.users(id) ON DELETE CASCADE UNIQUE,
    email_enabled        BOOLEAN     NOT NULL DEFAULT TRUE,
    sms_enabled          BOOLEAN     NOT NULL DEFAULT FALSE,
    push_enabled         BOOLEAN     NOT NULL DEFAULT FALSE,
    subscribed_elections UUID[]      NOT NULL DEFAULT '{}',
    reminder_lead_days   SMALLINT[]  NOT NULL DEFAULT '{30,14,7,3,1}',
    legal_alerts         BOOLEAN     NOT NULL DEFAULT TRUE,
    updated_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================================================
-- GOVERNANCE SCHEMA
-- =============================================================================

CREATE TABLE IF NOT EXISTS governance.source_registry (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code             VARCHAR(20)  NOT NULL UNIQUE,
    country_id       UUID         REFERENCES civic.countries(id),
    category         VARCHAR(30)  NOT NULL CHECK (category IN ('ELECTION_COMMISSION','VOTER_PORTAL','LEGAL_STATUTE','OFFICIAL_FORM','EMERGENCY_CONTACT','INTERNATIONAL_REFERENCE')),
    name             VARCHAR(300) NOT NULL,
    url              VARCHAR(500),
    phone            VARCHAR(50),
    volatility_class VARCHAR(6)   NOT NULL DEFAULT 'STABLE' CHECK (volatility_class IN ('STABLE','MEDIUM','HIGH')),
    last_verified_at TIMESTAMPTZ,
    link_status      VARCHAR(15)  NOT NULL DEFAULT 'HEALTHY' CHECK (link_status IN ('HEALTHY','REDIRECT','LINK_ROT','UNAVAILABLE','UNVERIFIED')),
    is_verified      BOOLEAN      NOT NULL DEFAULT TRUE,
    is_active        BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at       TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at       TIMESTAMPTZ  NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_sources_country ON governance.source_registry(country_id);

CREATE TABLE IF NOT EXISTS governance.civic_axioms (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code             VARCHAR(30)  NOT NULL UNIQUE,
    country_id       UUID         NOT NULL REFERENCES civic.countries(id),
    category         VARCHAR(20)  NOT NULL CHECK (category IN ('ELIGIBILITY','REGISTRATION','PROCESS','EMERGENCY','JARGON','MYTH')),
    subcategory      VARCHAR(50),
    fact             TEXT         NOT NULL,
    plain_fact       TEXT,
    volatility_class VARCHAR(6)   NOT NULL DEFAULT 'STABLE' CHECK (volatility_class IN ('STABLE','MEDIUM','HIGH')),
    source_id        UUID         REFERENCES governance.source_registry(id),
    last_verified_at TIMESTAMPTZ  NOT NULL DEFAULT now(),
    effective_from   DATE,
    effective_to     DATE,
    is_active        BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at       TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at       TIMESTAMPTZ  NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_axioms_country  ON governance.civic_axioms(country_id);
CREATE INDEX IF NOT EXISTS idx_axioms_category ON governance.civic_axioms(country_id, category);

CREATE TABLE IF NOT EXISTS governance.audit_logs (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id      UUID         REFERENCES users.users(id),
    session_hash VARCHAR(100),
    action       VARCHAR(50)  NOT NULL,
    entity_type  VARCHAR(50),
    entity_id    UUID,
    old_value    JSONB,
    new_value    JSONB,
    ip_hash      VARCHAR(100),
    user_agent   VARCHAR(500),
    metadata     JSONB        DEFAULT '{}',
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_audit_user    ON governance.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_action  ON governance.audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_created ON governance.audit_logs(created_at);

CREATE TABLE IF NOT EXISTS governance.data_change_approvals (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proposed_by      UUID         NOT NULL REFERENCES users.users(id),
    entity_schema    VARCHAR(50)  NOT NULL,
    entity_table     VARCHAR(50)  NOT NULL,
    entity_id        UUID         NOT NULL,
    field_name       VARCHAR(100) NOT NULL,
    old_value        JSONB,
    proposed_value   JSONB        NOT NULL,
    change_reason    TEXT         NOT NULL,
    volatility_class VARCHAR(6),
    status           VARCHAR(20)  NOT NULL DEFAULT 'PENDING_REVIEW' CHECK (status IN ('PENDING_REVIEW','APPROVED','REJECTED','REVISION_REQUESTED')),
    reviewed_by      UUID         REFERENCES users.users(id),
    reviewed_at      TIMESTAMPTZ,
    review_notes     TEXT,
    applied_at       TIMESTAMPTZ,
    created_at       TIMESTAMPTZ  NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_approvals_status ON governance.data_change_approvals(status);

-- =============================================================================
-- AI_OPS SCHEMA
-- =============================================================================

CREATE TABLE IF NOT EXISTS ai_ops.query_logs (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_hash     VARCHAR(100) NOT NULL,
    user_id          UUID         REFERENCES users.users(id),
    country_code     CHAR(3),
    persona_code     VARCHAR(5),
    query_intent     VARCHAR(30)  CHECK (query_intent IN ('REGISTRATION','TIMELINE','TROUBLESHOOT','FAQ','EMERGENCY','JARGON','MYTH_CHECK')),
    confidence_score NUMERIC(4,3),
    safety_passed    BOOLEAN      NOT NULL DEFAULT TRUE,
    safety_issues    TEXT[]       DEFAULT '{}',
    model_used       VARCHAR(50),
    response_ms      INTEGER,
    emergency_mode   BOOLEAN      NOT NULL DEFAULT FALSE,
    was_hallucination BOOLEAN     NOT NULL DEFAULT FALSE,
    created_at       TIMESTAMPTZ  NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_ai_country  ON ai_ops.query_logs(country_code);
CREATE INDEX IF NOT EXISTS idx_ai_created  ON ai_ops.query_logs(created_at);

-- =============================================================================
-- OPS SCHEMA
-- =============================================================================

CREATE TABLE IF NOT EXISTS ops.notification_jobs (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_type      VARCHAR(30)  NOT NULL,
    user_id       UUID         REFERENCES users.users(id),
    event_id      UUID         REFERENCES civic.election_events(id),
    payload       JSONB        NOT NULL,
    status        VARCHAR(10)  NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING','SENT','FAILED','CANCELLED')),
    scheduled_for TIMESTAMPTZ  NOT NULL,
    sent_at       TIMESTAMPTZ,
    attempts      SMALLINT     NOT NULL DEFAULT 0,
    error_message TEXT,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_notif_pending ON ops.notification_jobs(status, scheduled_for) WHERE status = 'PENDING';

CREATE TABLE IF NOT EXISTS ops.system_incidents (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    incident_type VARCHAR(30)  NOT NULL,
    severity      VARCHAR(10)  NOT NULL CHECK (severity IN ('CRITICAL','HIGH','MEDIUM','LOW')),
    description   TEXT         NOT NULL,
    affected_area VARCHAR(50),
    status        VARCHAR(15)  NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE','RESOLVED','MONITORING')),
    started_at    TIMESTAMPTZ  NOT NULL DEFAULT now(),
    resolved_at   TIMESTAMPTZ,
    metadata      JSONB        DEFAULT '{}'
);

-- =============================================================================
-- UPDATED_AT TRIGGERS
-- =============================================================================
DO $$
DECLARE t RECORD;
BEGIN
  FOR t IN
    SELECT schemaname, tablename FROM pg_tables
    WHERE schemaname IN ('civic','users','governance')
      AND tablename NOT IN ('persona_blockers','election_stages','resolution_paths','audit_logs','query_logs','notification_jobs','system_incidents','data_change_approvals')
  LOOP
    EXECUTE format(
      'DROP TRIGGER IF EXISTS trg_%1$s_updated_at ON %2$s.%1$s;
       CREATE TRIGGER trg_%1$s_updated_at
       BEFORE UPDATE ON %2$s.%1$s
       FOR EACH ROW EXECUTE FUNCTION update_updated_at();',
      t.tablename, t.schemaname
    );
  END LOOP;
END $$;

-- =============================================================================
-- ROW LEVEL SECURITY (Supabase-compatible)
-- =============================================================================
ALTER TABLE users.users              ENABLE ROW LEVEL SECURITY;
ALTER TABLE users.sessions           ENABLE ROW LEVEL SECURITY;
ALTER TABLE users.checklist_items    ENABLE ROW LEVEL SECURITY;
ALTER TABLE users.readiness_scores   ENABLE ROW LEVEL SECURITY;

-- Public civic data readable by all (anon + authenticated)
ALTER TABLE civic.countries          ENABLE ROW LEVEL SECURITY;
ALTER TABLE civic.election_events    ENABLE ROW LEVEL SECURITY;
ALTER TABLE governance.civic_axioms  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read countries"       ON civic.countries         FOR SELECT USING (TRUE);
CREATE POLICY "Public read elections"       ON civic.election_events   FOR SELECT USING (TRUE);
CREATE POLICY "Public read civic axioms"    ON governance.civic_axioms FOR SELECT USING (TRUE);

-- Users only access their own rows
CREATE POLICY "Users own data"      ON users.users           FOR ALL  USING (auth.uid()::text = firebase_uid);
CREATE POLICY "Users own sessions"  ON users.sessions        FOR ALL  USING (user_id IN (SELECT id FROM users.users WHERE firebase_uid = auth.uid()::text));
CREATE POLICY "Users own checklist" ON users.checklist_items FOR ALL  USING (user_id IN (SELECT id FROM users.users WHERE firebase_uid = auth.uid()::text));
CREATE POLICY "Users own readiness" ON users.readiness_scores FOR ALL USING (user_id IN (SELECT id FROM users.users WHERE firebase_uid = auth.uid()::text));

-- =============================================================================
-- DONE
-- =============================================================================
SELECT 'ELECTRA schema migration complete ✓' AS status;
