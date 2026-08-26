import {
  boolean,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const userRole = pgEnum("user_role", ["coach", "client"]);
export const clientStatus = pgEnum("client_status", ["active", "paused", "archived"]);
export const mediaKind = pgEnum("media_kind", ["profile", "progress"]);
export const workoutStatus = pgEnum("workout_status", ["scheduled", "in_progress", "completed", "partial", "skipped"]);
export const inviteStatus = pgEnum("invite_status", ["pending", "accepted", "revoked"]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  clerkId: text("clerk_id").notNull().unique(),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  bio: text("bio"),
  role: userRole("role").notNull().default("client"),
  disabled: boolean("disabled").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const clientInvites = pgTable("client_invites", {
  id: uuid("id").primaryKey().defaultRandom(),
  coachId: uuid("coach_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  email: text("email"),
  status: inviteStatus("status").notNull().default("pending"),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  acceptedBy: uuid("accepted_by").references(() => users.id, { onDelete: "set null" }),
  acceptedAt: timestamp("accepted_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const coachClients = pgTable("coach_clients", {
  id: uuid("id").primaryKey().defaultRandom(),
  coachId: uuid("coach_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  clientId: uuid("client_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  status: clientStatus("status").notNull().default("active"),
  objective: text("objective"),
  privateNotes: text("private_notes"),
  startedAt: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [uniqueIndex("coach_client_unique").on(table.coachId, table.clientId)]);

export const sessions = pgTable("sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  tokenHash: text("token_hash").notNull().unique(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const programTemplates = pgTable("program_templates", {
  id: uuid("id").primaryKey().defaultRandom(),
  coachId: uuid("coach_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  definition: jsonb("definition").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const programAssignments = pgTable("program_assignments", {
  id: uuid("id").primaryKey().defaultRandom(),
  coachId: uuid("coach_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  clientId: uuid("client_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  templateId: uuid("template_id").references(() => programTemplates.id, { onDelete: "set null" }),
  name: text("name").notNull(),
  version: integer("version").notNull().default(1),
  definition: jsonb("definition").notNull(),
  startsOn: timestamp("starts_on", { withTimezone: true }).notNull(),
  endsOn: timestamp("ends_on", { withTimezone: true }),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const workoutSessions = pgTable("workout_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  clientId: uuid("client_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  assignmentId: uuid("assignment_id").references(() => programAssignments.id, { onDelete: "set null" }),
  scheduledAt: timestamp("scheduled_at", { withTimezone: true }),
  startedAt: timestamp("started_at", { withTimezone: true }),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  status: workoutStatus("status").notNull().default("scheduled"),
  execution: jsonb("execution").notNull().default({}),
  clientFeedback: text("client_feedback"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const measurements = pgTable("measurements", {
  id: uuid("id").primaryKey().defaultRandom(),
  clientId: uuid("client_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  measuredAt: timestamp("measured_at", { withTimezone: true }).notNull().defaultNow(),
  values: jsonb("values").notNull(),
  notes: text("notes"),
});

export const mediaAssets = pgTable("media_assets", {
  id: uuid("id").primaryKey().defaultRandom(),
  ownerId: uuid("owner_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  kind: mediaKind("kind").notNull(),
  blobUrl: text("blob_url").notNull().unique(),
  pathname: text("pathname").notNull().unique(),
  contentType: text("content_type").notNull(),
  size: integer("size").notNull(),
  capturedAt: timestamp("captured_at", { withTimezone: true }),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const weeklyCheckins = pgTable("weekly_checkins", {
  id: uuid("id").primaryKey().defaultRandom(),
  clientId: uuid("client_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  submittedAt: timestamp("submitted_at", { withTimezone: true }).notNull().defaultNow(),
  answers: jsonb("answers").notNull(),
  coachReply: text("coach_reply"),
  reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
});

export const messages = pgTable("messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  senderId: uuid("sender_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  recipientId: uuid("recipient_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  body: text("body").notNull(),
  readAt: timestamp("read_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  body: text("body"),
  href: text("href"),
  readAt: timestamp("read_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
