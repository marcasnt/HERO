CREATE TYPE "user_role" AS ENUM ('coach', 'client');
CREATE TYPE "client_status" AS ENUM ('active', 'paused', 'archived');
CREATE TYPE "media_kind" AS ENUM ('profile', 'progress');
CREATE TYPE "workout_status" AS ENUM ('scheduled', 'in_progress', 'completed', 'partial', 'skipped');

CREATE TABLE "users" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" text NOT NULL,
  "email" text,
  "role" "user_role" NOT NULL DEFAULT 'client',
  "disabled" boolean NOT NULL DEFAULT false,
  "created_at" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE "coach_clients" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "coach_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "client_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "status" "client_status" NOT NULL DEFAULT 'active',
  "objective" text,
  "private_notes" text,
  "started_at" timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX "coach_client_unique" ON "coach_clients" ("coach_id", "client_id");

CREATE TABLE "sessions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "token_hash" text NOT NULL UNIQUE,
  "expires_at" timestamptz NOT NULL,
  "created_at" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE "program_templates" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "coach_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "name" text NOT NULL,
  "description" text,
  "definition" jsonb NOT NULL,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE "program_assignments" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "coach_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "client_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "template_id" uuid REFERENCES "program_templates"("id") ON DELETE SET NULL,
  "name" text NOT NULL,
  "version" integer NOT NULL DEFAULT 1,
  "definition" jsonb NOT NULL,
  "starts_on" timestamptz NOT NULL,
  "ends_on" timestamptz,
  "active" boolean NOT NULL DEFAULT true,
  "created_at" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE "workout_sessions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "client_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "assignment_id" uuid REFERENCES "program_assignments"("id") ON DELETE SET NULL,
  "scheduled_at" timestamptz,
  "started_at" timestamptz,
  "completed_at" timestamptz,
  "status" "workout_status" NOT NULL DEFAULT 'scheduled',
  "execution" jsonb NOT NULL DEFAULT '{}'::jsonb,
  "client_feedback" text,
  "updated_at" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE "measurements" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "client_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "measured_at" timestamptz NOT NULL DEFAULT now(),
  "values" jsonb NOT NULL,
  "notes" text
);

CREATE TABLE "media_assets" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "owner_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "kind" "media_kind" NOT NULL,
  "blob_url" text NOT NULL UNIQUE,
  "pathname" text NOT NULL UNIQUE,
  "content_type" text NOT NULL,
  "size" integer NOT NULL,
  "captured_at" timestamptz,
  "notes" text,
  "created_at" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE "weekly_checkins" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "client_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "submitted_at" timestamptz NOT NULL DEFAULT now(),
  "answers" jsonb NOT NULL,
  "coach_reply" text,
  "reviewed_at" timestamptz
);

CREATE INDEX "workout_client_updated_idx" ON "workout_sessions" ("client_id", "updated_at" DESC);
CREATE INDEX "media_owner_created_idx" ON "media_assets" ("owner_id", "created_at" DESC);
