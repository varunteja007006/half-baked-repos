// schema.ts
import {
  boolean,
  integer,
  json,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

import { AUDIT } from "./common-schema";

export const cron_jobs = pgTable("cron_jobs", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 256 }).notNull(),
  description: text("description"),
  cron_expr: varchar("cron_expr", { length: 128 }).notNull(), // standard cron expression
  timezone: varchar("timezone", { length: 64 }).default("UTC"),

  // scheduling / run bookkeeping
  enabled: boolean("enabled").default(true).notNull(),
  next_run_at: timestamp("next_run_at"), // plan to query by this
  last_run_at: timestamp("last_run_at"),
  last_duration_ms: integer("last_duration_ms"),

  // execution state & retries
  last_status: varchar("last_status", { length: 64 }), // e.g. SUCCESS, FAILED, RUNNING
  attempt_count: integer("attempt_count").default(0).notNull(),
  max_attempts: integer("max_attempts").default(3).notNull(),
  backoff_seconds: integer("backoff_seconds").default(60),

  // locking for multi-worker environments
  locked_at: timestamp("locked_at"),
  locked_by: integer("locked_by"), // worker id or pid; nullable
  run_count: integer("run_count").default(0).notNull(),

  // diagnostics / payload
  last_error: text("last_error"),
  last_result: json("last_result"),
  payload: json("payload"),

  // soft-delete + audit fields
  ...AUDIT,
});
