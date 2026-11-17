// schema.ts
import { integer, pgTable, serial, text, varchar } from "drizzle-orm/pg-core";

import { AUDIT } from "./common-schema";

/* -------------------------
   Lookup / enums (simple)
   ------------------------- */

// Driver, Admin, Manager
export const roles = pgTable("roles", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 64 }).notNull().unique(),
  name: varchar("name", { length: 128 }).notNull(),
  description: text("description"),
  imageUrl: varchar("image_url", { length: 512 }), // enough space for normal URLs
  ...AUDIT,
});

export const organization_statuses = pgTable("organization_statuses", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 64 }).notNull().unique(),
  label: varchar("label", { length: 128 }).notNull(),
  description: text("description"),
  ...AUDIT,
});

export const organization_tiers = pgTable("organization_tiers", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 64 }).notNull().unique(),
  label: varchar("label", { length: 128 }).notNull(),
  description: text("description"),
  ...AUDIT,
});

export const organization_invitation_statuses = pgTable(
  "organization_invitation_statuses",
  {
    id: serial("id").primaryKey(),
    code: varchar("code", { length: 64 }).notNull().unique(),
    label: varchar("label", { length: 128 }).notNull(),
    description: text("description"),
    ...AUDIT,
  },
);

/**
 * trip_statuses - Trip lifecycle status codes
 * Expected workflow:
 *   DRAFT → ASSIGNED → IN_TRANSIT → COMPLETED/CANCELLED
 *
 * DRAFT: Trip created but not yet assigned
 * ASSIGNED: Driver assigned to the trip
 * IN_TRANSIT: Trip journey has started
 * COMPLETED: Trip successfully finished
 * CANCELLED: Trip was cancelled
 */
export const trip_statuses = pgTable("trip_statuses", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 64 }).notNull().unique(),
  label: varchar("label", { length: 128 }).notNull(),
  description: text("description"),
  order: integer("order"), // Maintains workflow sequence
  ...AUDIT,
});

export const trip_file_document_types = pgTable("trip_file_document_types", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 64 }).notNull().unique(),
  name: varchar("name", { length: 128 }).notNull(),
  description: text("description"),
  ...AUDIT,
});

// Regular, Adhoc
export const trip_types = pgTable("trip_types", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 64 }).notNull().unique(),
  name: varchar("name", { length: 128 }).notNull(),
  description: text("description"),
  ...AUDIT,
});

// aadhar, pan, dl (driving license), insurance
export const user_document_kinds = pgTable("user_document_kinds", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 64 }).notNull().unique(),
  name: varchar("name", { length: 128 }).notNull(),
  ...AUDIT,
});

export const vehicle_document_kinds = pgTable("vehicle_document_kinds", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 64 }).notNull().unique(),
  name: varchar("name", { length: 128 }).notNull(),
  ...AUDIT,
});

export const vehicle_types = pgTable("vehicle_types", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 64 }).notNull().unique(),
  name: varchar("name", { length: 128 }).notNull(),
  ...AUDIT,
});

export const payment_methods = pgTable("payment_methods", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 64 }).notNull().unique(),
  name: varchar("name", { length: 128 }).notNull(),
  ...AUDIT,
});

export const payment_statuses = pgTable("payment_statuses", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 64 }).notNull().unique(),
  name: varchar("name", { length: 128 }).notNull(),
  ...AUDIT,
});

export const account_types = pgTable("account_types", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 64 }).notNull().unique(),
  name: varchar("name", { length: 128 }).notNull(),
  ...AUDIT,
});

export const bank_account_types = pgTable("bank_account_types", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 64 }).notNull().unique(),
  name: varchar("name", { length: 128 }).notNull(),
  ...AUDIT,
});

export const company_types = pgTable("company_types", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 64 }).notNull().unique(),
  name: varchar("name", { length: 128 }).notNull(),
  ...AUDIT,
});

export const priority_levels = pgTable("priority_levels", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 64 }).notNull().unique(),
  name: varchar("name", { length: 64 }).notNull(),
  level: integer("level"),
  ...AUDIT,
});

export const approval_statuses = pgTable("approval_statuses", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 64 }).notNull().unique(),
  name: varchar("name", { length: 64 }).notNull(),
  ...AUDIT,
});

export const fuel_types = pgTable("fuel_types", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 64 }).notNull().unique(),
  name: varchar("name", { length: 64 }).notNull(),
  ...AUDIT,
});

// local, zonal, national
export const lane_types = pgTable("lane_types", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 64 }).notNull().unique(),
  name: varchar("name", { length: 128 }).notNull(),
  description: text("description"),
  ...AUDIT,
});

// Size of the cargo
export const fleet_sizes = pgTable("fleet_sizes", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 64 }).notNull().unique(),
  size_label: integer("size_label").notNull(), // e.g. 17, 20, 24, 32
  description: varchar("description", { length: 256 }),
  ...AUDIT,
});
