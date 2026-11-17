// schema.ts
import { relations } from "drizzle-orm";
import {
  boolean,
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
import { companies } from "./company-schema";
import { files } from "./files-schema";
import {
  organization_invitation_statuses,
  organization_statuses,
  organization_tiers,
  roles,
} from "./meta-schema";

/**
 * Acts as the root tenant entity for data isolation
 */
export const organizations = pgTable("organizations", {
  id: serial("id").primaryKey(),

  // Core org identity
  name: varchar("name", { length: 256 }).notNull(),
  slug: varchar("slug", { length: 128 }).notNull().unique(), // URL-friendly identifier
  description: text("description"),

  // Business info
  gstin: varchar("gstin", { length: 32 }),
  pan: varchar("pan", { length: 32 }),
  incorporation_name: varchar("incorporation_name", { length: 256 }),
  incorporation_address: text("incorporation_address"),
  state_code: varchar("state_code", { length: 8 }),
  hsn_code: varchar("hsn_code", { length: 32 }),

  // Branding & metadata
  logo_url: varchar("logo_url", { length: 512 }),
  metadata: json("metadata"), // org-specific settings, preferences, etc.

  // Ownership & status
  owner_id: text("owner_id")
    .notNull()
    .references(() => user.id, { onDelete: "restrict" }), // Primary owner
  status_id: integer("status_id")
    .notNull()
    .references(() => organization_statuses.id, { onDelete: "restrict" }),
  is_active: boolean("is_active").default(true).notNull(),

  // Subscription / tier info (optional, can expand later)
  tier_id: integer("tier_id")
    .notNull()
    .references(() => organization_tiers.id, { onDelete: "restrict" }),
  max_users: integer("max_users"), // null = unlimited
  max_vehicles: integer("max_vehicles"),
  max_trips_per_month: integer("max_trips_per_month"),

  // audit columns
  ...AUDIT,
});

/**
 * organization_members - junction table for users in organizations
 * Enables a user to belong to multiple organizations with different roles in each
 */
export const organization_members = pgTable(
  "organization_members",
  {
    id: serial("id").primaryKey(),

    // Relationships
    organization_id: integer("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),

    user_id: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),

    // Member-specific metadata
    designation: varchar("designation", { length: 256 }), // e.g., "Fleet Manager", "Driver"
    department: varchar("department", { length: 256 }), // e.g., "Operations", "Finance"
    is_active: boolean("is_active").default(true).notNull(),
    joined_at: timestamp("joined_at").defaultNow().notNull(),
    invited_by: text("invited_by"), // which user invited this member

    // audit columns
    ...AUDIT,
  },
  (table) => [index("organization_members_user_id_idx").on(table.user_id)],
);

/**
 * organization_member_roles - junction table for members with multiple roles
 * Enables a user to have multiple roles within a single organization
 * Example: User can be both "Admin" and "Finance" in the same org
 */
export const organization_member_roles = pgTable("organization_member_roles", {
  id: serial("id").primaryKey(),

  // Relationships to organization_members
  organization_member_id: integer("organization_member_id")
    .notNull()
    .references(() => organization_members.id, { onDelete: "cascade" }),

  // Role FK
  role_id: integer("role_id")
    .notNull()
    .references(() => roles.id, { onDelete: "restrict" }),

  // audit columns
  ...AUDIT,
});

/**
 * organization_invitations - track pending invitations to join an org
 * Allows admins to invite users via email before they create an account
 */
export const organization_invitations = pgTable("organization_invitations", {
  id: serial("id").primaryKey(),

  organization_id: integer("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),

  email: varchar("email", { length: 256 }).notNull(),
  role_id: integer("role_id")
    .notNull()
    .references(() => roles.id, { onDelete: "restrict" }),

  status_id: integer("status_id")
    .notNull()
    .references(() => organization_invitation_statuses.id, {
      onDelete: "restrict",
    }),
  invited_by: text("invited_by").references(() => user.id),
  invited_at: timestamp("invited_at").defaultNow().notNull(),
  expires_at: timestamp("expires_at").notNull(), // e.g., 7 days from now
  accepted_at: timestamp("accepted_at"),
  accepted_by: text("accepted_by"),

  ...AUDIT,
});

export const organizationRelations = relations(
  organizations,
  ({ many, one }) => ({
    members: many(organization_members),
    invitations: many(organization_invitations),
    files: many(files),
    companies: many(companies),
    owner: one(user, {
      fields: [organizations.owner_id],
      references: [user.id],
    }),
    status: one(organization_statuses, {
      fields: [organizations.status_id],
      references: [organization_statuses.id],
    }),
    tier: one(organization_tiers, {
      fields: [organizations.tier_id],
      references: [organization_tiers.id],
    }),
  }),
);

export const organizationMembersRelations = relations(
  organization_members,
  ({ one, many }) => ({
    organization: one(organizations, {
      fields: [organization_members.organization_id],
      references: [organizations.id],
    }),
    user: one(user, {
      fields: [organization_members.user_id],
      references: [user.id],
    }),
    memberRoles: many(organization_member_roles),
  }),
);

export const organizationMemberRolesRelations = relations(
  organization_member_roles,
  ({ one }) => ({
    member: one(organization_members, {
      fields: [organization_member_roles.organization_member_id],
      references: [organization_members.id],
    }),
    role: one(roles, {
      fields: [organization_member_roles.role_id],
      references: [roles.id],
    }),
  }),
);

export const organizationInvitationsRelations = relations(
  organization_invitations,
  ({ one }) => ({
    organization: one(organizations, {
      fields: [organization_invitations.organization_id],
      references: [organizations.id],
    }),
    invitedByUser: one(user, {
      fields: [organization_invitations.invited_by],
      references: [user.id],
    }),
    acceptedByUser: one(user, {
      fields: [organization_invitations.accepted_by],
      references: [user.id],
    }),
    role: one(roles, {
      fields: [organization_invitations.role_id],
      references: [roles.id],
    }),
    status: one(organization_invitation_statuses, {
      fields: [organization_invitations.status_id],
      references: [organization_invitation_statuses.id],
    }),
  }),
);

export const userOrganizationRelations = relations(user, ({ many }) => ({
  organizations: many(organization_members),
  ownedOrganizations: many(organizations),
}));
