// schema.ts
import { relations } from "drizzle-orm";
import {
  index,
  integer,
  json,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

import { user } from "./auth-schema";
import { AUDIT } from "./common-schema";
import { approval_statuses, payment_methods } from "./meta-schema";
import { organizations } from "./organization-schema";
import { trips } from "./trips-schema";

export const payments = pgTable(
  "payments",
  {
    id: serial("id").primaryKey(),

    // Organization/Tenant
    organization_id: integer("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }), // FK -> organizations

    trip_id: integer("trip_id").references(() => trips.id, {
      onDelete: "set null",
    }),
    amount: integer("amount").notNull(),
    currency: varchar("currency", { length: 8 }).default("INR"),
    method_id: integer("method_id").references(() => payment_methods.id, {
      onDelete: "set null",
    }),
    status_id: integer("status_id").references(() => approval_statuses.id, {
      onDelete: "set null",
    }),
    paid_at: timestamp("paid_at"),
    metadata: json("metadata"),

    // Reconciliation fields
    transaction_reference: varchar("transaction_reference", { length: 128 }), // bank/processor ref
    description: text("description"), // payment reason/notes
    failure_reason: text("failure_reason"), // why payment failed (for retries)

    user_id: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "restrict" }),
    ...AUDIT,
  },
  (table) => [
    index("payments_organization_id_created_at_idx").on(
      table.organization_id,
      table.created_at,
    ),
  ],
);

export const paymentsRelations = relations(payments, ({ one }) => ({
  organization: one(organizations, {
    fields: [payments.organization_id],
    references: [organizations.id],
  }),
  trip: one(trips, {
    fields: [payments.trip_id],
    references: [trips.id],
  }),
  method: one(payment_methods, {
    fields: [payments.method_id],
    references: [payment_methods.id],
  }),
  status: one(approval_statuses, {
    fields: [payments.status_id],
    references: [approval_statuses.id],
  }),
  user: one(user, {
    fields: [payments.user_id],
    references: [user.id],
  }),
}));
