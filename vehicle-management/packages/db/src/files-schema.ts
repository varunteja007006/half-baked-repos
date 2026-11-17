// schema.ts
import { relations } from "drizzle-orm";
import {
  integer,
  json,
  pgTable,
  serial,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

import { AUDIT } from "./common-schema";
import { organizations } from "./organization-schema";

export const files = pgTable("files", {
  id: serial("id").primaryKey(),

  // Organization/Tenant (can be null for system-wide files)
  organization_id: integer("organization_id").references(
    () => organizations.id,
    { onDelete: "cascade" },
  ),

  bucket: varchar("bucket", { length: 128 }),
  key: varchar("key", { length: 512 }).notNull(),
  filename: varchar("filename", { length: 512 }),
  mime_type: varchar("mime_type", { length: 128 }),
  size: integer("size"),
  expiry_date: timestamp("expiry_date"),
  metadata: json("metadata"),
  ...AUDIT,
});

export const filesRelations = relations(files, ({ one }) => ({
  organization: one(organizations, {
    fields: [files.organization_id],
    references: [organizations.id],
  }),
}));
