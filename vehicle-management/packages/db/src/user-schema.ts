// schema.ts
import { relations } from "drizzle-orm";
import {
  index,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

import { user } from "./auth-schema";
import { AUDIT } from "./common-schema";
import { files } from "./files-schema";
import { user_document_kinds } from "./meta-schema";
import { organizations } from "./organization-schema";

/**
 * app_users - User profile extension for auth users
 * Stores user-specific profile data independent of organization
 */
export const app_users = pgTable("app_users", {
  user_id: text("user_id")
    .primaryKey()
    .references(() => user.id, { onDelete: "cascade" }),

  driver_license_no: varchar("driver_license_no", { length: 128 }),
  emp_id: varchar("emp_id", { length: 128 }),

  active_organization_id: integer("active_organization_id").references(
    () => organizations.id,
    { onDelete: "set null" },
  ),

  ...AUDIT,
});

export const user_bank_details = pgTable("user_bank_details", {
  id: serial("id").primaryKey(),
  user_id: text("user_id")
    .notNull()
    .references(() => app_users.user_id, { onDelete: "cascade" }),
  account_holder: varchar("account_holder", { length: 256 }),
  account_number: varchar("account_number", { length: 64 }),
  ifsc: varchar("ifsc", { length: 32 }),
  bank_name: varchar("bank_name", { length: 128 }),
  branch_name: varchar("branch_name", { length: 128 }),
  ...AUDIT,
});

export const user_docs = pgTable(
  "user_docs",
  {
    id: serial("id").primaryKey(),
    user_id: text("user_id")
      .notNull()
      .references(() => app_users.user_id, { onDelete: "cascade" }),
    doc_kind_id: integer("doc_kind_id")
      .notNull()
      .references(() => user_document_kinds.id, { onDelete: "restrict" }),
    file_id: integer("file_id").references(() => files.id, {
      onDelete: "set null",
    }),
    valid_from: timestamp("valid_from"),
    valid_to: timestamp("valid_to"),
    expiry_date: timestamp("expiry_date"), // NEW
    ...AUDIT,
  },
  (table) => [
    index("user_docs_user_id_valid_to_idx").on(table.user_id, table.valid_to),
  ],
);

export const appUsersRelations = relations(app_users, ({ one, many }) => ({
  authUser: one(user, {
    fields: [app_users.user_id],
    references: [user.id],
  }),
  activeOrganization: one(organizations, {
    fields: [app_users.active_organization_id],
    references: [organizations.id],
  }),
  bankDetails: many(user_bank_details),
  documents: many(user_docs),
}));

export const userBankDetailsRelations = relations(
  user_bank_details,
  ({ one }) => ({
    user: one(app_users, {
      fields: [user_bank_details.user_id],
      references: [app_users.user_id],
    }),
  }),
);

export const userDocsRelations = relations(user_docs, ({ one }) => ({
  user: one(app_users, {
    fields: [user_docs.user_id],
    references: [app_users.user_id],
  }),
  docKind: one(user_document_kinds, {
    fields: [user_docs.doc_kind_id],
    references: [user_document_kinds.id],
  }),
  file: one(files, {
    fields: [user_docs.file_id],
    references: [files.id],
  }),
}));
