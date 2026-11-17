// schema.ts
import { text, timestamp } from "drizzle-orm/pg-core";

/**
 * Reusable audit columns. Spread this into each table's column object.
 * Using text for user refs to match Better Auth user IDs.
 */
export const AUDIT = {
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
  deleted_at: timestamp("deleted_at"),
  created_by: text("created_by"),
  updated_by: text("updated_by"),
  deleted_by: text("deleted_by"),
};
