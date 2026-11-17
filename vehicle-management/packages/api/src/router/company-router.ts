import type { TRPCRouterRecord } from "@trpc/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { and, desc, eq, isNull } from "@fleetio/db";
import { companies, organization_members } from "@fleetio/db/schema";
import { createCompanySchema, updateCompanySchema } from "@fleetio/validators";

import { protectedProcedure } from "../trpc";

export const companyRouter = {
  create: protectedProcedure
    .input(createCompanySchema)
    .mutation(async ({ ctx, input }) => {
      const { organization_id } = input;
      const userId = ctx.session.user.id;

      // Verify membership
      const member = await ctx.db.query.organization_members.findFirst({
        where: and(
          eq(organization_members.organization_id, organization_id as number),
          eq(organization_members.user_id, userId),
          eq(organization_members.is_active, true),
        ),
      });

      if (!member) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message:
            "You do not have permission to create a company in this organization",
        });
      }

      const [company] = await ctx.db
        .insert(companies)
        .values({
          ...input,
          organization_id: organization_id as number,
          created_by: userId,
          updated_by: userId,
        })
        .returning();

      return company;
    }),

  update: protectedProcedure
    .input(updateCompanySchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      const userId = ctx.session.user.id;

      // 1. Fetch company to get organizationId
      const existingCompany = await ctx.db.query.companies.findFirst({
        where: eq(companies.id, id),
        columns: { organization_id: true },
      });

      if (!existingCompany) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Company not found",
        });
      }

      // 2. Verify user is member of organization
      const member = await ctx.db.query.organization_members.findFirst({
        where: and(
          eq(
            organization_members.organization_id,
            existingCompany.organization_id,
          ),
          eq(organization_members.user_id, userId),
          eq(organization_members.is_active, true),
        ),
      });

      if (!member) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not have permission to update this company",
        });
      }

      const [company] = await ctx.db
        .update(companies)
        .set({
          ...data,
          organization_id: data.organization_id as number | undefined,
          updated_by: userId,
          updated_at: new Date(),
        })
        .where(eq(companies.id, id))
        .returning();

      return company;
    }),

  list: protectedProcedure
    .input(z.object({ orgId: z.number().int().positive() }))
    .query(async ({ ctx, input }) => {
      const orgId = input.orgId;

      return ctx.db.query.companies.findMany({
        where: and(
          eq(companies.organization_id, orgId),
          isNull(companies.deleted_at),
        ),
        orderBy: desc(companies.created_at),
        with: {
          type: true,
        },
      });
    }),

  byId: protectedProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .query(async ({ ctx, input }) => {
      const company = await ctx.db.query.companies.findFirst({
        where: and(eq(companies.id, input.id), isNull(companies.deleted_at)),
        with: {
          type: true,
        },
      });

      if (!company) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Company not found",
        });
      }

      // Verify access
      const member = await ctx.db.query.organization_members.findFirst({
        where: and(
          eq(organization_members.organization_id, company.organization_id),
          eq(organization_members.user_id, ctx.session.user.id),
          eq(organization_members.is_active, true),
        ),
      });

      if (!member) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not have permission to view this company",
        });
      }

      return company;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // 1. Fetch company to get organizationId
      const existingCompany = await ctx.db.query.companies.findFirst({
        where: eq(companies.id, input.id),
        columns: { organization_id: true },
      });

      if (!existingCompany) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Company not found",
        });
      }

      // 2. Verify user is member of organization
      const member = await ctx.db.query.organization_members.findFirst({
        where: and(
          eq(
            organization_members.organization_id,
            existingCompany.organization_id,
          ),
          eq(organization_members.user_id, userId),
          eq(organization_members.is_active, true),
        ),
      });

      if (!member) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not have permission to delete this company",
        });
      }

      const [company] = await ctx.db
        .update(companies)
        .set({
          deleted_at: new Date(),
          deleted_by: userId,
          updated_at: new Date(),
          updated_by: userId,
        })
        .where(eq(companies.id, input.id))
        .returning();

      return company;
    }),
} satisfies TRPCRouterRecord;
