import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

import {
  app_users,
  user as authUsers,
  organization_invitation_statuses,
  organization_invitations,
  organization_member_roles,
  organization_members,
  organization_statuses,
  organization_tiers,
  organizations,
} from "@fleetio/db/schema";

import { createdUpdatedAuditFields } from "./utils";

/* ---------------------------------
   Organization creation validators
   --------------------------------- */

export const organizationInsertSchema = createInsertSchema(organizations, {
  name: z.string().min(3).max(256),
  slug: z
    .string()
    .min(3)
    .max(128)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/i,
      "Slug can only contain letters, numbers, and hyphens.",
    ),
  description: z.string().max(2000).optional(),
  gstin: z.string().max(32).optional(),
  pan: z.string().max(32).optional(),
  incorporation_name: z.string().max(256).optional(),
  incorporation_address: z.string().optional(),
  state_code: z.string().max(8).optional(),
  hsn_code: z.string().max(32).optional(),
  logo_url: z.url().max(512).optional(),
  metadata: z.record(z.any(), z.any()).optional().nullable(),
  max_users: z.number().int().positive().optional().nullable(),
  max_vehicles: z.number().int().positive().optional().nullable(),
  max_trips_per_month: z.number().int().positive().optional().nullable(),
  tier_id: z.number().int().positive(),
  status_id: z.number().int().positive(),
});

export const createOrganizationInputSchema = organizationInsertSchema.omit({
  id: true,
  owner_id: true,
  created_at: true,
  updated_at: true,
  deleted_at: true,
  created_by: true,
  updated_by: true,
  deleted_by: true,
  is_active: true,
});

export type CreateOrganizationInput = z.infer<
  typeof createOrganizationInputSchema
>;

/* ----------------------------------------
   Organization member onboarding validators
   ---------------------------------------- */

const authUserInsertSchema = createInsertSchema(authUsers, {
  name: z.string().min(2).max(256),
  email: z.email(),
  phoneNumber: z.string().max(32).optional(),
  image: z.url().max(2048).optional(),
});

export const createOrganizationMemberUserSchema = authUserInsertSchema.pick({
  name: true,
  email: true,
  phoneNumber: true,
  image: true,
});

const appUserInsertSchema = createInsertSchema(app_users, {
  driver_license_no: z.string().max(128).optional(),
  emp_id: z.string().max(128).optional(),
});

export const createOrganizationMemberProfileSchema = appUserInsertSchema.omit({
  user_id: true,
  created_at: true,
  updated_at: true,
  deleted_at: true,
  created_by: true,
  updated_by: true,
  deleted_by: true,
});

const organizationMemberInsertSchema = createInsertSchema(
  organization_members,
  {
    designation: z.string().max(256).optional(),
    department: z.string().max(256).optional(),
    invited_by: z.string().optional(),
  },
);

export const createOrganizationMemberRecordSchema =
  organizationMemberInsertSchema
    .omit({
      id: true,
      user_id: true,
      created_at: true,
      updated_at: true,
      deleted_at: true,
      created_by: true,
      updated_by: true,
      deleted_by: true,
      joined_at: true,
      is_active: true,
    })
    .extend({
      organizationId: z.number().int().positive(),
    });

export const createOrganizationMemberInputSchema = z.object({
  user: createOrganizationMemberUserSchema,
  profile: createOrganizationMemberProfileSchema.optional(),
  member: createOrganizationMemberRecordSchema,
  roleIds: z
    .array(z.number().int().positive())
    .min(1, "Provide at least one role")
    .optional(),
});

export type CreateOrganizationMemberInput = z.infer<
  typeof createOrganizationMemberInputSchema
>;

/* ----------------------------------------
   Organization member management validators
   ---------------------------------------- */

export const updateOrganizationMemberRolesSchema = z.object({
  memberId: z.number().int().positive(),
  roleIds: z.array(z.number().int().positive()),
});

export const bulkUpdateOrganizationMemberRolesSchema = z.object({
  organizationId: z.number().int().positive(),
  updates: z.array(updateOrganizationMemberRolesSchema),
});

export const deleteOrganizationMemberSchema = z.object({
  organizationId: z.number().int().positive(),
  memberIds: z.array(z.number().int().positive()),
});

export const listOrganizationMembersSchema = z.object({
  organizationId: z.number().int().positive(),
});

const organizationInvitationInsertSchema = createInsertSchema(
  organization_invitations,
  {
    email: z.email(),
    expires_at: z.date(),
    invited_at: z.date().optional(),
    accepted_at: z.date().optional(),
  },
);

export const createOrganizationInvitationSchema =
  organizationInvitationInsertSchema.omit({
    id: true,
    ...createdUpdatedAuditFields,
  });

export type CreateOrganizationInvitationInput = z.infer<
  typeof createOrganizationInvitationSchema
>;

export const updateOrganizationInvitationSchema =
  createOrganizationInvitationSchema
    .partial()
    .extend({ id: z.number().int().positive() })
    .refine((data) => {
      const { id: _, ...rest } = data;
      return Object.keys(rest).length > 0;
    }, "Provide at least one field to update.");

export type UpdateOrganizationInvitationInput = z.infer<
  typeof updateOrganizationInvitationSchema
>;

const organizationMemberRoleInsertSchema = createInsertSchema(
  organization_member_roles,
);

export const createOrganizationMemberRoleSchema =
  organizationMemberRoleInsertSchema.omit({
    id: true,
    ...createdUpdatedAuditFields,
  });

export type CreateOrganizationMemberRoleInput = z.infer<
  typeof createOrganizationMemberRoleSchema
>;

/* ---- Organization statuses ---- */

export const organizationStatusInsertSchema = createInsertSchema(
  organization_statuses,
  {
    code: z
      .string()
      .min(2)
      .max(64)
      .regex(/^[a-z0-9_-]+$/i, {
        message:
          "Code can only contain letters, numbers, hyphens, or underscores.",
      })
      .transform((val) => val.toUpperCase()),
    label: z.string().min(2).max(128),
    description: z.string().max(2000).optional(),
  },
);

export const createOrganizationStatusSchema =
  organizationStatusInsertSchema.omit({
    id: true,
    ...createdUpdatedAuditFields,
  });

export type CreateOrganizationStatusInput = z.infer<
  typeof createOrganizationStatusSchema
>;

export const updateOrganizationStatusSchema = createOrganizationStatusSchema
  .partial()
  .extend({ id: z.number().int().positive() })
  .refine((data) => {
    const { id: _, ...rest } = data;
    return Object.keys(rest).length > 0;
  }, "Provide at least one field to update.");

export type UpdateOrganizationStatusInput = z.infer<
  typeof updateOrganizationStatusSchema
>;

/* ---- Organization tiers ---- */

const organizationTierInsertSchema = createInsertSchema(organization_tiers, {
  code: z
    .string()
    .min(2)
    .max(64)
    .regex(/^[a-z0-9_-]+$/i, {
      message:
        "Code can only contain letters, numbers, hyphens, or underscores.",
    })
    .transform((val) => val.toUpperCase()),
  label: z.string().min(2).max(128),
  description: z.string().max(2000).optional(),
});

export const createOrganizationTierSchema = organizationTierInsertSchema.omit({
  id: true,
  ...createdUpdatedAuditFields,
});

export type CreateOrganizationTierInput = z.infer<
  typeof createOrganizationTierSchema
>;

export const updateOrganizationTierSchema = createOrganizationTierSchema
  .partial()
  .extend({ id: z.number().int().positive() });

export type UpdateOrganizationTierInput = z.infer<
  typeof updateOrganizationTierSchema
>;

/* ---- Organization invitation statuses ---- */

const organizationInvitationStatusInsertSchema = createInsertSchema(
  organization_invitation_statuses,
  {
    code: z
      .string()
      .min(2)
      .max(64)
      .regex(/^[a-z0-9_-]+$/i, {
        message:
          "Code can only contain letters, numbers, hyphens, or underscores.",
      }),
    label: z.string().min(2).max(128),
    description: z.string().max(2000).optional(),
  },
);

export const createOrganizationInvitationStatusSchema =
  organizationInvitationStatusInsertSchema.omit({
    id: true,
    ...createdUpdatedAuditFields,
  });

export type CreateOrganizationInvitationStatusInput = z.infer<
  typeof createOrganizationInvitationStatusSchema
>;

export const updateOrganizationInvitationStatusSchema =
  createOrganizationInvitationStatusSchema
    .partial()
    .extend({ id: z.number().int().positive() })
    .refine((data) => {
      const { id: _, ...rest } = data;
      return Object.values(rest).length > 0;
    }, "Provide at least one field to update.");

export type UpdateOrganizationInvitationStatusInput = z.infer<
  typeof updateOrganizationInvitationStatusSchema
>;
