import { randomUUID } from "node:crypto";
import type { TRPCRouterRecord } from "@trpc/server";
import { TRPCError } from "@trpc/server";

import type { app_users } from "@fleetio/db/schema";
import type { CreateOrganizationMemberInput } from "@fleetio/validators";
import { and, eq, inArray, isNull } from "@fleetio/db";
import {
  user as authUsers,
  organization_member_roles,
  organization_members,
} from "@fleetio/db/schema";
import {
  bulkUpdateOrganizationMemberRolesSchema,
  createOrganizationMemberInputSchema,
  deleteOrganizationMemberSchema,
  listOrganizationMembersSchema,
} from "@fleetio/validators";

import { orgScopedProcedure, protectedProcedure } from "../trpc";

export const organizationMemberRouter = {
  // create: protectedProcedure
  //   .input(createOrganizationMemberInputSchema)
  //   .mutation(async ({ ctx, input }) => {
  //     const email = input.user.email.trim().toLowerCase();
  //     const existingUser = await ctx.db.query.user.findFirst({
  //       where: eq(authUsers.email, email),
  //       columns: { id: true },
  //     });
  //     if (existingUser) {
  //       throw new TRPCError({
  //         code: "CONFLICT",
  //         message:
  //           "A user with this email already exists. Invite them instead.",
  //       });
  //     }
  //     const actorId = ctx.session.user.id;
  //     const newUserId = randomUUID();
  //     const result = await ctx.db.transaction(async (tx) => {
  //       const [createdUser] = await tx
  //         .insert(authUsers)
  //         .values({
  //           id: newUserId,
  //           name: input.user.name.trim(),
  //           email,
  //           phoneNumber: input.user.phoneNumber?.trim() || null,
  //           image: input.user.image?.trim() || null,
  //         })
  //         .returning();
  //       if (!createdUser) {
  //         throw new TRPCError({
  //           code: "INTERNAL_SERVER_ERROR",
  //           message: "Failed to create user record.",
  //         });
  //       }
  //       let createdProfile: AppUserSelect | null = null;
  //       if (hasProfileData(input.profile)) {
  //         const [profile] = await tx
  //           .insert(app_users)
  //           .values({
  //             // ...input.profile,
  //             user_id: newUserId,
  //             created_by: actorId,
  //             updated_by: actorId,
  //           })
  //           .returning();
  //         createdProfile = profile ?? null;
  //       }
  //       const [createdMember] = await tx
  //         .insert(organization_members)
  //         .values({
  //           designation: input.member.designation,
  //           department: input.member.department,
  //           invited_by: input.member.invited_by,
  //           organization_id: input.member.organizationId,
  //           user_id: newUserId,
  //           is_active: true,
  //           created_by: actorId,
  //           updated_by: actorId,
  //         })
  //         .returning();
  //       if (!createdMember) {
  //         throw new TRPCError({
  //           code: "INTERNAL_SERVER_ERROR",
  //           message: "Failed to create organization member record.",
  //         });
  //       }
  //       if (input.roleIds?.length) {
  //         await tx.insert(organization_member_roles).values(
  //           input.roleIds.map((roleId) => ({
  //             organization_member_id: createdMember.id,
  //             role_id: roleId,
  //             created_by: actorId,
  //             updated_by: actorId,
  //           })),
  //         );
  //       }
  //       return {
  //         user: createdUser,
  //         profile: createdProfile,
  //         member: createdMember,
  //       };
  //     });
  //     return result;
  //   }),
  // updateRoles: protectedProcedure
  //   .input(bulkUpdateOrganizationMemberRolesSchema)
  //   .mutation(async ({ ctx, input }) => {
  //     const { db } = ctx;
  //     const actorId = ctx.session.user.id;
  //     await db.transaction(async (tx) => {
  //       for (const update of input.updates) {
  //         const { memberId, roleIds } = update;
  //         // Verify member belongs to the organization
  //         const member = await tx.query.organization_members.findFirst({
  //           where: and(
  //             eq(organization_members.id, memberId),
  //             eq(organization_members.organization_id, input.organizationId),
  //           ),
  //         });
  //         if (!member) {
  //           continue; // Skip if member not found in this org
  //         }
  //         // Get all existing roles for this member (including soft deleted ones)
  //         const existingRoles =
  //           await tx.query.organization_member_roles.findMany({
  //             where: eq(
  //               organization_member_roles.organization_member_id,
  //               memberId,
  //             ),
  //             with: { role: true },
  //           });
  //         const existingRoleIds = new Set(
  //           existingRoles.filter((r) => !r.deleted_at).map((r) => r.role_id),
  //         );
  //         const targetRoleIds = new Set(roleIds);
  //         // Roles to add: in target but not in existing active
  //         const rolesToAdd = roleIds.filter((id) => !existingRoleIds.has(id));
  //         // Roles to remove: in existing active but not in target
  //         const rolesToRemove = existingRoles.filter(
  //           (r) => !r.deleted_at && !targetRoleIds.has(r.role_id),
  //         );
  //         // Process removals (Soft Delete)
  //         if (rolesToRemove.length > 0) {
  //           await tx
  //             .update(organization_member_roles)
  //             .set({
  //               deleted_at: new Date(),
  //               deleted_by: actorId,
  //               updated_at: new Date(),
  //               updated_by: actorId,
  //             })
  //             .where(
  //               inArray(
  //                 organization_member_roles.id,
  //                 rolesToRemove.map((r) => r.id),
  //               ),
  //             );
  //         }
  //         // Process additions
  //         for (const roleId of rolesToAdd) {
  //           // Check if we have a soft-deleted record for this role
  //           const softDeletedRole = existingRoles.find(
  //             (r) => r.role_id === roleId && r.deleted_at,
  //           );
  //           if (softDeletedRole) {
  //             // Restore
  //             await tx
  //               .update(organization_member_roles)
  //               .set({
  //                 deleted_at: null,
  //                 deleted_by: null,
  //                 updated_at: new Date(),
  //                 updated_by: actorId,
  //               })
  //               .where(eq(organization_member_roles.id, softDeletedRole.id));
  //           } else {
  //             // Create new
  //             await tx.insert(organization_member_roles).values({
  //               organization_member_id: memberId,
  //               role_id: roleId,
  //               created_by: actorId,
  //               updated_by: actorId,
  //             });
  //           }
  //         }
  //       }
  //     });
  //     return { success: true };
  //   }),

  // delete: protectedProcedure
  //   .input(deleteOrganizationMemberSchema)
  //   .mutation(async ({ ctx, input }) => {
  //     const { db } = ctx;
  //     const actorId = ctx.session.user.id;
  //     await db.transaction(async (tx) => {
  //       // Soft delete members (ensure they belong to the org)
  //       await tx
  //         .update(organization_members)
  //         .set({
  //           deleted_at: new Date(),
  //           deleted_by: actorId,
  //           updated_at: new Date(),
  //           updated_by: actorId,
  //           is_active: false,
  //         })
  //         .where(
  //           and(
  //             inArray(organization_members.id, input.memberIds),
  //             eq(organization_members.organization_id, input.organizationId),
  //           ),
  //         );
  //       // Soft delete their roles
  //       // We first find the valid members that were just deleted (or were already deleted but we want to ensure roles are gone)
  //       // Actually, simpler to just find roles for these members.
  //       // But we should strictly only touch roles of members in this org.
  //       // The previous query only updates members in this org.
  //       // So we can fetch the members again or just trust the input IDs combined with org check?
  //       // Safer to query roles where member.organizationId is correct.
  //       const membersRoles = await tx.query.organization_member_roles.findMany({
  //         with: {
  //           member: true,
  //           role: true,
  //         },
  //         where: inArray(
  //           organization_member_roles.organization_member_id,
  //           input.memberIds,
  //         ),
  //       });
  //       // Filter roles that belong to members of this org
  //       const rolesToDelete = membersRoles.filter(
  //         (r) => r.member.organization_id === input.organizationId,
  //       );
  //       const activeRoles = rolesToDelete.filter((r) => !r.deleted_at);
  //       if (activeRoles.length > 0) {
  //         await tx
  //           .update(organization_member_roles)
  //           .set({
  //             deleted_at: new Date(),
  //             deleted_by: actorId,
  //             updated_at: new Date(),
  //             updated_by: actorId,
  //           })
  //           .where(
  //             inArray(
  //               organization_member_roles.id,
  //               activeRoles.map((r) => r.id),
  //             ),
  //           );
  //       }
  //     });
  //     return { success: true };
  //   }),

  // selfOrgDetails: protectedProcedure.query(async ({ ctx }) => {
  //   const orgId = ctx.organizationId;

  //   const member = await ctx.db.query.organization_members.findFirst({
  //     where: and(
  //       eq(organization_members.organization_id, orgId),
  //       eq(organization_members.user_id, ctx.session.user.id),
  //       isNull(organization_members.deleted_at),
  //     ),
  //     with: {
  //       user: true,
  //       memberRoles: {
  //         where: isNull(organization_member_roles.deleted_at),
  //         with: {
  //           role: true,
  //         },
  //       },
  //     },
  //   });

  //   if (!member) {
  //     throw new TRPCError({
  //       code: "NOT_FOUND",
  //       message: "Organization member record not found.",
  //     });
  //   }

  //   return member;
  // }),

  // Universally usable get members by org Id
  byOrgId: protectedProcedure
    .input(listOrganizationMembersSchema)
    .query(async ({ ctx, input }) => {
      const orgId = input.organizationId;

      const members = await ctx.db.query.organization_members.findMany({
        where: and(
          eq(organization_members.organization_id, orgId),
          isNull(organization_members.deleted_at),
        ),
        with: {
          user: true,
          memberRoles: {
            where: isNull(organization_member_roles.deleted_at),
            with: {
              role: true,
            },
          },
        },
        orderBy: (members, { desc }) => [desc(members.created_at)],
      });

      return members;
    }),

  // organization members based on which org the user belongs to
  byUserOrgId: orgScopedProcedure.query(async ({ ctx }) => {
    const orgId = ctx.organizationId;
    const members = await ctx.db.query.organization_members.findMany({
      where: and(
        eq(organization_members.organization_id, orgId),
        isNull(organization_members.deleted_at),
      ),
      with: {
        user: true,
        memberRoles: {
          where: isNull(organization_member_roles.deleted_at),
          with: {
            role: true,
          },
        },
      },
      orderBy: (members, { desc }) => [desc(members.created_at)],
    });

    return members;
  }),

  // Todo: ADD PAGINATION
  listAll: protectedProcedure.query(async ({ ctx }) => {
    const members = await ctx.db.query.organization_members.findMany({
      where: isNull(organization_members.deleted_at),
      with: {
        user: true,
        organization: true,
        memberRoles: {
          where: isNull(organization_member_roles.deleted_at),
          with: {
            role: true,
          },
        },
      },
      orderBy: (members, { desc }) => [desc(members.created_at)],
    });
    return members;
  }),
} satisfies TRPCRouterRecord;
