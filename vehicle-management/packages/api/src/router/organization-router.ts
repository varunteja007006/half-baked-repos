import type { TRPCRouterRecord } from "@trpc/server";
import { TRPCError } from "@trpc/server";

import { eq, isNull } from "@fleetio/db";
import { organizations } from "@fleetio/db/schema";
import { createOrganizationInputSchema } from "@fleetio/validators";

import { protectedProcedure } from "../trpc";

export const organizationRouter = {
  create: protectedProcedure
    .input(createOrganizationInputSchema)
    .mutation(async ({ ctx, input }) => {
      const normalizedSlug = input.slug.trim().toLowerCase();

      const existing = await ctx.db.query.organizations.findFirst({
        where: eq(organizations.slug, normalizedSlug),
        columns: { id: true },
      });

      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "An organization with this slug already exists.",
        });
      }

      const ownerId = ctx.session.user.id;

      const [organization] = await ctx.db
        .insert(organizations)
        .values({
          ...input,
          slug: normalizedSlug,
          owner_id: ownerId,
          created_by: ownerId,
          updated_by: ownerId,
        })
        .returning();

      return organization;
    }),

  list: protectedProcedure.query(async ({ ctx }) => {
    const orgs = await ctx.db.query.organizations.findMany({
      where: isNull(organizations.deleted_at),
      orderBy: (orgs, { desc }) => [desc(orgs.created_at)],
    });
    return orgs;
  }),
} satisfies TRPCRouterRecord;
