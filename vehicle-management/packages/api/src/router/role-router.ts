import type { TRPCRouterRecord } from "@trpc/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { and, eq, isNull } from "@fleetio/db";
import {
  organization_invitations,
  organization_member_roles,
  roles,
} from "@fleetio/db/schema";
import {
  createRoleSchema,
  roleIdSchema,
  updateRoleSchema,
} from "@fleetio/validators";

import { protectedProcedure } from "../trpc";

type RoleInsert = typeof roles.$inferInsert;

const listRolesSchema = z
  .object({
    includeDeleted: z.boolean().optional(),
  })
  .optional();

const sanitizeRoleCode = (code: string) => code.trim().toLowerCase();
const sanitizeRoleName = (name: string) => name.trim();
const sanitizeOptionalText = (value?: string) => {
  if (value === undefined) return undefined;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
};

export const roleRouter = {
  list: protectedProcedure.input(listRolesSchema).query(({ ctx, input }) => {
    const includeDeleted = input?.includeDeleted ?? false;
    const whereClause = includeDeleted ? undefined : isNull(roles.deleted_at);

    return ctx.db.query.roles.findMany({
      where: whereClause,
      orderBy: (table, { asc }) => [asc(table.name)],
    });
  }),

  getById: protectedProcedure
    .input(roleIdSchema)
    .query(async ({ ctx, input }) => {
      const record = await ctx.db.query.roles.findFirst({
        where: eq(roles.id, input.id),
      });

      if (!record || record.deleted_at) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Role not found." });
      }

      return record;
    }),

  create: protectedProcedure
    .input(createRoleSchema)
    .mutation(async ({ ctx, input }) => {
      const actorId = ctx.session.user.id;
      const normalizedCode = sanitizeRoleCode(input.code);

      const existingWithCode = await ctx.db.query.roles.findFirst({
        where: eq(roles.code, normalizedCode),
      });

      if (existingWithCode) {
        if (existingWithCode.deleted_at) {
          const [restored] = await ctx.db
            .update(roles)
            .set({
              code: normalizedCode,
              name: sanitizeRoleName(input.name),
              description: sanitizeOptionalText(input.description),
              imageUrl: input.imageUrl,
              deleted_at: null,
              deleted_by: null,
              updated_at: new Date(),
              updated_by: actorId,
            })
            .where(eq(roles.id, existingWithCode.id))
            .returning();

          if (!restored) {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "Failed to restore role.",
            });
          }

          return restored;
        }

        throw new TRPCError({
          code: "CONFLICT",
          message: "Role code already exists.",
        });
      }

      const [created] = await ctx.db
        .insert(roles)
        .values({
          code: normalizedCode,
          name: sanitizeRoleName(input.name),
          description: sanitizeOptionalText(input.description),
          imageUrl: input.imageUrl,
          created_by: actorId,
          updated_by: actorId,
        })
        .returning();

      if (!created) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create role.",
        });
      }

      return created;
    }),

  update: protectedProcedure
    .input(updateRoleSchema)
    .mutation(async ({ ctx, input }) => {
      const actorId = ctx.session.user.id;
      const { id, ...changes } = input;

      const existing = await ctx.db.query.roles.findFirst({
        where: eq(roles.id, id),
      });

      if (!existing || existing.deleted_at) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Role not found." });
      }

      const payload: Partial<RoleInsert> = {
        updated_at: new Date(),
        updated_by: actorId,
      };

      if (changes.code) {
        const normalizedCode = sanitizeRoleCode(changes.code);
        if (normalizedCode !== existing.code) {
          const codeConflict = await ctx.db.query.roles.findFirst({
            where: eq(roles.code, normalizedCode),
          });

          if (codeConflict && codeConflict.id !== id) {
            throw new TRPCError({
              code: "CONFLICT",
              message: "Role code already exists.",
            });
          }
        }
        payload.code = normalizedCode;
      }

      if (changes.name) {
        payload.name = sanitizeRoleName(changes.name);
      }

      if (changes.description !== undefined) {
        payload.description = sanitizeOptionalText(changes.description);
      }

      if (changes.imageUrl !== undefined) {
        payload.imageUrl = changes.imageUrl;
      }

      const [updated] = await ctx.db
        .update(roles)
        .set(payload)
        .where(and(eq(roles.id, id), isNull(roles.deleted_at)))
        .returning();

      if (!updated) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Role not found." });
      }

      return updated;
    }),

  delete: protectedProcedure
    .input(roleIdSchema)
    .mutation(async ({ ctx, input }) => {
      const actorId = ctx.session.user.id;

      const role = await ctx.db.query.roles.findFirst({
        where: eq(roles.id, input.id),
      });

      if (!role || role.deleted_at) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Role not found." });
      }

      const assignment = await ctx.db.query.organization_member_roles.findFirst(
        {
          where: and(
            eq(organization_member_roles.role_id, input.id),
            isNull(organization_member_roles.deleted_at),
          ),
          columns: { id: true },
        },
      );

      if (assignment) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "Role is assigned to organization members.",
        });
      }

      const invitation = await ctx.db.query.organization_invitations.findFirst({
        where: and(
          eq(organization_invitations.role_id, input.id),
          isNull(organization_invitations.deleted_at),
        ),
        columns: { id: true },
      });

      if (invitation) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "Role is referenced by active invitations.",
        });
      }

      const [deleted] = await ctx.db
        .update(roles)
        .set({
          deleted_at: new Date(),
          deleted_by: actorId,
          updated_at: new Date(),
          updated_by: actorId,
        })
        .where(and(eq(roles.id, input.id), isNull(roles.deleted_at)))
        .returning();

      if (!deleted) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Role not found." });
      }

      return deleted;
    }),
} satisfies TRPCRouterRecord;
