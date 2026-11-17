import type { TRPCRouterRecord } from "@trpc/server";
import { TRPCError } from "@trpc/server";
import z from "zod";

import { count, eq } from "@fleetio/db";
import { db } from "@fleetio/db/client";
import { app_users, user } from "@fleetio/db/schema";

import { protectedProcedure } from "../trpc";
import { paginateZodSchema } from "./helpers/utils";

export const userRouter = {
  listUsers: protectedProcedure
    .input(paginateZodSchema)
    .query(async ({ input, ctx }) => {
      const { db } = ctx;
      const {
        currentPage,
        itemsPerPage,
        search,
        sortBy: _sortBy,
        filters: _filters,
      } = input;
      const offset = (currentPage - 1) * itemsPerPage;

      const users = await db.query.user.findMany({
        offset,
        limit: itemsPerPage,
      });

      const countQuery = await db.select({ count: count() }).from(user);

      const meta = {
        currentPage,
        itemsPerPage,
        totalItems: countQuery[0]?.count,
        totalPages: 10,
        search,
      };

      return { data: users, meta };
    }),

  setActiveOrgId: protectedProcedure
    .input(
      z.object({
        organizationId: z.number(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.session.user.id;
      const orgId = input.organizationId;

      const appUser = await db.query.app_users.findFirst({
        where: eq(app_users.user_id, userId),
      });

      if (!appUser) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "App user not found!!",
        });
      }

      const updatedAppUser = await db
        .update(app_users)
        .set({
          active_organization_id: orgId,
          updated_at: new Date(),
          updated_by: userId,
        })
        .returning();

      return updatedAppUser[0]?.active_organization_id === orgId;
    }),
} satisfies TRPCRouterRecord;
