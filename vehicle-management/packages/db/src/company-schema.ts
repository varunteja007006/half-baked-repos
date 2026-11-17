// schema.ts
import { relations } from "drizzle-orm";
import { integer, pgTable, serial, text, varchar } from "drizzle-orm/pg-core";

import { AUDIT } from "./common-schema";
import { company_types } from "./meta-schema";
import { organizations } from "./organization-schema";

/**
 * companies table - represents a company profile within an organization
 * Now linked to organizations via organization_id
 */
export const companies = pgTable("companies", {
  id: serial("id").primaryKey(),

  // Organization/Tenant
  organization_id: integer("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }), // FK -> organizations

  name: varchar("name", { length: 256 }).notNull(), // required display name
  incorporation_name: varchar("incorporation_name", { length: 256 }),
  incorporation_address: text("incorporation_address"),
  gstin: varchar("gstin", { length: 32 }),
  state_code: varchar("state_code", { length: 8 }),
  hsn_code: varchar("hsn_code", { length: 32 }),
  type_id: integer("type_id")
    .notNull()
    .references(() => company_types.id, { onDelete: "restrict" }), // FK -> company_types
  address: text("address"),
  ...AUDIT,
});

export const companiesRelations = relations(companies, ({ one }) => ({
  organization: one(organizations, {
    fields: [companies.organization_id],
    references: [organizations.id],
  }),
  type: one(company_types, {
    fields: [companies.type_id],
    references: [company_types.id],
  }),
}));
