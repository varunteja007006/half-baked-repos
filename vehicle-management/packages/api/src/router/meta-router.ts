import type { TRPCRouterRecord } from "@trpc/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { and, count, eq, isNull } from "@fleetio/db";
import {
  account_types,
  approval_statuses,
  bank_account_types,
  company_types,
  fleet_sizes,
  fuel_types,
  lane_types,
  organization_invitation_statuses,
  organization_statuses,
  organization_tiers,
  payment_methods,
  priority_levels,
  trip_file_document_types,
  trip_statuses,
  trip_types,
  user_document_kinds,
  vehicle_document_kinds,
  vehicle_types,
} from "@fleetio/db/schema";
import * as MetaValidators from "@fleetio/validators";

import { protectedProcedure, publicProcedure } from "../trpc";
import { paginateZodSchema } from "./helpers/utils";

const notFound = (entity: string) =>
  new TRPCError({ code: "NOT_FOUND", message: `${entity} not found` });

const idSchema = z.object({ id: z.number().int().positive() });

export const metaRouter = {
  /* ---------------- Organization statuses ---------------- */
  listOrganizationStatuses: publicProcedure
    .input(paginateZodSchema)
    .query(async ({ ctx, input }) => {
      const { currentPage, itemsPerPage } = input;
      const offset = (currentPage - 1) * itemsPerPage;

      const rows = await ctx.db.query.organization_statuses.findMany({
        where: isNull(organization_statuses.deleted_at),
        orderBy: (tbl, { asc }) => [asc(tbl.code)],
        offset,
        limit: itemsPerPage,
      });

      const [total] = await ctx.db
        .select({ count: count() })
        .from(organization_statuses)
        .where(isNull(organization_statuses.deleted_at));
      const totalItems = total?.count ?? 0;
      const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;

      return {
        data: rows,
        meta: {
          currentPage,
          itemsPerPage,
          totalItems,
          totalPages,
        },
      };
    }),

  getOrganizationStatusById: publicProcedure
    .input(idSchema)
    .query(async ({ ctx, input }) => {
      const row = await ctx.db.query.organization_statuses.findFirst({
        where: and(
          eq(organization_statuses.id, input.id),
          isNull(organization_statuses.deleted_at),
        ),
      });
      if (!row) throw notFound("Organization status");
      return row;
    }),

  createOrganizationStatus: protectedProcedure
    .input(MetaValidators.createOrganizationStatusSchema)
    .mutation(async ({ ctx, input }) => {
      const actorId = ctx.session.user.id;
      const [row] = await ctx.db
        .insert(organization_statuses)
        .values({
          ...input,
          code: input.code.toUpperCase(), // Ensure code is uppercase
          created_by: actorId,
          updated_by: actorId,
        })
        .returning();
      return row;
    }),

  updateOrganizationStatus: protectedProcedure
    .input(MetaValidators.updateOrganizationStatusSchema)
    .mutation(async ({ ctx, input }) => {
      const actorId = ctx.session.user.id;
      const { id, ...data } = input;
      const [row] = await ctx.db
        .update(organization_statuses)
        .set({
          ...data,
          code: data.code?.toUpperCase(), // Ensure code is uppercase
          updated_by: actorId,
          updated_at: new Date(),
        })
        .where(
          and(
            eq(organization_statuses.id, id),
            isNull(organization_statuses.deleted_at),
          ),
        )
        .returning();
      if (!row) throw notFound("Organization status");
      return row;
    }),

  deleteOrganizationStatus: protectedProcedure
    .input(idSchema)
    .mutation(async ({ ctx, input }) => {
      const actorId = ctx.session.user.id;
      const [row] = await ctx.db
        .update(organization_statuses)
        .set({
          deleted_at: new Date(),
          deleted_by: actorId,
          updated_at: new Date(),
          updated_by: actorId,
        })
        .where(
          and(
            eq(organization_statuses.id, input.id),
            isNull(organization_statuses.deleted_at),
          ),
        )
        .returning();
      if (!row) throw notFound("Organization status");
      return row;
    }),

  /* ---------------- Organization tiers ---------------- */
  listOrganizationTiers: publicProcedure
    .input(paginateZodSchema)
    .query(async ({ ctx, input }) => {
      const { currentPage, itemsPerPage } = input;
      const offset = (currentPage - 1) * itemsPerPage;
      const rows = await ctx.db.query.organization_tiers.findMany({
        where: isNull(organization_tiers.deleted_at),
        orderBy: (tbl, { desc }) => [desc(tbl.created_at)],
        offset,
        limit: itemsPerPage,
      });
      const [total] = await ctx.db
        .select({ count: count() })
        .from(organization_tiers)
        .where(isNull(organization_tiers.deleted_at));
      const totalItems = total?.count ?? 0;
      const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;

      return {
        data: rows,
        meta: {
          currentPage,
          itemsPerPage,
          totalItems,
          totalPages,
        },
      };
    }),

  getOrganizationTierById: publicProcedure
    .input(idSchema)
    .query(async ({ ctx, input }) => {
      const row = await ctx.db.query.organization_tiers.findFirst({
        where: and(
          eq(organization_tiers.id, input.id),
          isNull(organization_tiers.deleted_at),
        ),
      });
      if (!row) throw notFound("Organization tier");
      return row;
    }),

  createOrganizationTier: protectedProcedure
    .input(MetaValidators.createOrganizationTierSchema)
    .mutation(async ({ ctx, input }) => {
      const actorId = ctx.session.user.id;
      const [row] = await ctx.db
        .insert(organization_tiers)
        .values({
          ...input,
          created_by: actorId,
          updated_by: actorId,
        })
        .returning();
      return row;
    }),

  updateOrganizationTier: protectedProcedure
    .input(MetaValidators.updateOrganizationTierSchema)
    .mutation(async ({ ctx, input }) => {
      const actorId = ctx.session.user.id;
      const { id, ...data } = input;
      const [row] = await ctx.db
        .update(organization_tiers)
        .set({
          ...data,
          updated_by: actorId,
          updated_at: new Date(),
        })
        .where(
          and(
            eq(organization_tiers.id, id),
            isNull(organization_tiers.deleted_at),
          ),
        )
        .returning();
      if (!row) throw notFound("Organization tier");
      return row;
    }),

  deleteOrganizationTier: protectedProcedure
    .input(idSchema)
    .mutation(async ({ ctx, input }) => {
      const actorId = ctx.session.user.id;
      const [row] = await ctx.db
        .update(organization_tiers)
        .set({
          deleted_at: new Date(),
          deleted_by: actorId,
          updated_at: new Date(),
          updated_by: actorId,
        })
        .where(
          and(
            eq(organization_tiers.id, input.id),
            isNull(organization_tiers.deleted_at),
          ),
        )
        .returning();
      if (!row) throw notFound("Organization tier");
      return row;
    }),

  /* ---------------- Organization invitation statuses ---------------- */
  // listOrganizationInvitationStatuses: publicProcedure
  //   .input(paginateZodSchema)
  //   .query(async ({ ctx, input }) => {
  //     const { currentPage, itemsPerPage } = input;
  //     const offset = (currentPage - 1) * itemsPerPage;
  //     const rows = await ctx.db.query.organization_invitation_statuses.findMany(
  //       {
  //         where: isNull(organization_invitation_statuses.deleted_at),
  //         orderBy: (tbl, { asc }) => [asc(tbl.code)],
  //         offset,
  //         limit: itemsPerPage,
  //       },
  //     );
  //     const [total] = await ctx.db
  //       .select({ count: count() })
  //       .from(organization_invitation_statuses)
  //       .where(isNull(organization_invitation_statuses.deleted_at));
  //     const totalItems = total?.count ?? 0;
  //     const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  //     return {
  //       data: rows,
  //       meta: {
  //         currentPage,
  //         itemsPerPage,
  //         totalItems,
  //         totalPages,
  //       },
  //     };
  //   }),
  // getOrganizationInvitationStatusById: publicProcedure
  //   .input(idSchema)
  //   .query(async ({ ctx, input }) => {
  //     const row = await ctx.db.query.organization_invitation_statuses.findFirst(
  //       {
  //         where: and(
  //           eq(organization_invitation_statuses.id, input.id),
  //           isNull(organization_invitation_statuses.deleted_at),
  //         ),
  //       },
  //     );
  //     if (!row) throw notFound("Organization invitation status");
  //     return row;
  //   }),
  // createOrganizationInvitationStatus: protectedProcedure
  //   .input(MetaValidators.createOrganizationInvitationStatusSchema)
  //   .mutation(async ({ ctx, input }) => {
  //     const actorId = ctx.session.user.id;
  //     const [row] = await ctx.db
  //       .insert(organization_invitation_statuses)
  //       .values({
  //         ...input,
  //         created_by: actorId,
  //         updated_by: actorId,
  //       })
  //       .returning();
  //     return row;
  //   }),
  // updateOrganizationInvitationStatus: protectedProcedure
  //   .input(MetaValidators.updateOrganizationInvitationStatusSchema)
  //   .mutation(async ({ ctx, input }) => {
  //     const actorId = ctx.session.user.id;
  //     const { id, ...data } = input;
  //     const [row] = await ctx.db
  //       .update(organization_invitation_statuses)
  //       .set({
  //         ...data,
  //         updated_by: actorId,
  //         updated_at: new Date(),
  //       })
  //       .where(
  //         and(
  //           eq(organization_invitation_statuses.id, id),
  //           isNull(organization_invitation_statuses.deleted_at),
  //         ),
  //       )
  //       .returning();
  //     if (!row) throw notFound("Organization invitation status");
  //     return row;
  //   }),
  // deleteOrganizationInvitationStatus: protectedProcedure
  //   .input(idSchema)
  //   .mutation(async ({ ctx, input }) => {
  //     const actorId = ctx.session.user.id;
  //     const [row] = await ctx.db
  //       .update(organization_invitation_statuses)
  //       .set({
  //         deleted_at: new Date(),
  //         deleted_by: actorId,
  //         updated_at: new Date(),
  //         updated_by: actorId,
  //       })
  //       .where(
  //         and(
  //           eq(organization_invitation_statuses.id, input.id),
  //           isNull(organization_invitation_statuses.deleted_at),
  //         ),
  //       )
  //       .returning();
  //     if (!row) throw notFound("Organization invitation status");
  //     return row;
  //   }),
  /* ---------------- Trip statuses ---------------- */
  listTripStatuses: publicProcedure
    .input(paginateZodSchema)
    .query(async ({ ctx, input }) => {
      const { currentPage, itemsPerPage } = input;
      const offset = (currentPage - 1) * itemsPerPage;
      const rows = await ctx.db.query.trip_statuses.findMany({
        where: isNull(trip_statuses.deleted_at),
        orderBy: (tbl, { asc }) => [asc(tbl.order), asc(tbl.code)],
        offset,
        limit: itemsPerPage,
      });
      const [total] = await ctx.db
        .select({ count: count() })
        .from(trip_statuses)
        .where(isNull(trip_statuses.deleted_at));
      const totalItems = total?.count ?? 0;
      const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
      return {
        data: rows,
        meta: {
          currentPage,
          itemsPerPage,
          totalItems,
          totalPages,
        },
      };
    }),

  getTripStatusById: publicProcedure
    .input(idSchema)
    .query(async ({ ctx, input }) => {
      const row = await ctx.db.query.trip_statuses.findFirst({
        where: and(
          eq(trip_statuses.id, input.id),
          isNull(trip_statuses.deleted_at),
        ),
      });
      if (!row) throw notFound("Trip status");
      return row;
    }),

  createTripStatus: protectedProcedure
    .input(MetaValidators.createTripStatusSchema)
    .mutation(async ({ ctx, input }) => {
      const actorId = ctx.session.user.id;
      const [row] = await ctx.db
        .insert(trip_statuses)
        .values({
          ...input,
          code: input.code.toUpperCase(), // Ensure code is uppercase
          created_by: actorId,
          updated_by: actorId,
        })
        .returning();
      return row;
    }),

  updateTripStatus: protectedProcedure
    .input(MetaValidators.updateTripStatusSchema)
    .mutation(async ({ ctx, input }) => {
      const actorId = ctx.session.user.id;
      const { id, ...data } = input;
      const [row] = await ctx.db
        .update(trip_statuses)
        .set({
          ...data,
          code: data.code?.toUpperCase(), // Ensure code is uppercase
          updated_by: actorId,
          updated_at: new Date(),
        })
        .where(and(eq(trip_statuses.id, id), isNull(trip_statuses.deleted_at)))
        .returning();
      if (!row) throw notFound("Trip status");
      return row;
    }),

  deleteTripStatus: protectedProcedure
    .input(idSchema)
    .mutation(async ({ ctx, input }) => {
      const actorId = ctx.session.user.id;
      const [row] = await ctx.db
        .update(trip_statuses)
        .set({
          deleted_at: new Date(),
          deleted_by: actorId,
          updated_at: new Date(),
          updated_by: actorId,
        })
        .where(
          and(eq(trip_statuses.id, input.id), isNull(trip_statuses.deleted_at)),
        )
        .returning();
      if (!row) throw notFound("Trip status");
      return row;
    }),

  /* ---------------- Trip file document types ---------------- */
  listTripFileDocumentTypes: publicProcedure
    .input(paginateZodSchema)
    .query(async ({ ctx, input }) => {
      const { currentPage, itemsPerPage } = input;
      const offset = (currentPage - 1) * itemsPerPage;
      const rows = await ctx.db.query.trip_file_document_types.findMany({
        where: isNull(trip_file_document_types.deleted_at),
        orderBy: (tbl, { asc }) => [asc(tbl.name)],
        offset,
        limit: itemsPerPage,
      });
      const [total] = await ctx.db
        .select({ count: count() })
        .from(trip_file_document_types)
        .where(isNull(trip_file_document_types.deleted_at));
      const totalItems = total?.count ?? 0;
      const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
      return {
        data: rows,
        meta: {
          currentPage,
          itemsPerPage,
          totalItems,
          totalPages,
        },
      };
    }),

  getTripFileDocumentTypeById: publicProcedure
    .input(idSchema)
    .query(async ({ ctx, input }) => {
      const row = await ctx.db.query.trip_file_document_types.findFirst({
        where: and(
          eq(trip_file_document_types.id, input.id),
          isNull(trip_file_document_types.deleted_at),
        ),
      });
      if (!row) throw notFound("Trip file document type");
      return row;
    }),

  createTripFileDocumentType: protectedProcedure
    .input(MetaValidators.createTripFileDocumentTypeSchema)
    .mutation(async ({ ctx, input }) => {
      const actorId = ctx.session.user.id;
      const [row] = await ctx.db
        .insert(trip_file_document_types)
        .values({
          ...input,
          code: input.code.toUpperCase(), // Ensure code is uppercase
          created_by: actorId,
          updated_by: actorId,
        })
        .returning();
      return row;
    }),

  updateTripFileDocumentType: protectedProcedure
    .input(MetaValidators.updateTripFileDocumentTypeSchema)
    .mutation(async ({ ctx, input }) => {
      const actorId = ctx.session.user.id;
      const { id, ...data } = input;
      const [row] = await ctx.db
        .update(trip_file_document_types)
        .set({
          ...data,
          code: data.code?.toUpperCase(), // Ensure code is uppercase
          updated_by: actorId,
          updated_at: new Date(),
        })
        .where(
          and(
            eq(trip_file_document_types.id, id),
            isNull(trip_file_document_types.deleted_at),
          ),
        )
        .returning();
      if (!row) throw notFound("Trip file document type");
      return row;
    }),

  deleteTripFileDocumentType: protectedProcedure
    .input(idSchema)
    .mutation(async ({ ctx, input }) => {
      const actorId = ctx.session.user.id;
      const [row] = await ctx.db
        .update(trip_file_document_types)
        .set({
          deleted_at: new Date(),
          deleted_by: actorId,
          updated_at: new Date(),
          updated_by: actorId,
        })
        .where(
          and(
            eq(trip_file_document_types.id, input.id),
            isNull(trip_file_document_types.deleted_at),
          ),
        )
        .returning();
      if (!row) throw notFound("Trip file document type");
      return row;
    }),

  /* ---------------- Trip types ---------------- */
  listTripTypes: publicProcedure
    .input(paginateZodSchema)
    .query(async ({ ctx, input }) => {
      const { currentPage, itemsPerPage } = input;
      const offset = (currentPage - 1) * itemsPerPage;
      const rows = await ctx.db.query.trip_types.findMany({
        where: isNull(trip_types.deleted_at),
        orderBy: (tbl, { asc }) => [asc(tbl.name)],
        offset,
        limit: itemsPerPage,
      });
      const [total] = await ctx.db
        .select({ count: count() })
        .from(trip_types)
        .where(isNull(trip_types.deleted_at));
      const totalItems = total?.count ?? 0;
      const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
      return {
        data: rows,
        meta: {
          currentPage,
          itemsPerPage,
          totalItems,
          totalPages,
        },
      };
    }),

  getTripTypeById: publicProcedure
    .input(idSchema)
    .query(async ({ ctx, input }) => {
      const row = await ctx.db.query.trip_types.findFirst({
        where: and(eq(trip_types.id, input.id), isNull(trip_types.deleted_at)),
      });
      if (!row) throw notFound("Trip type");
      return row;
    }),

  createTripType: protectedProcedure
    .input(MetaValidators.createTripTypeSchema)
    .mutation(async ({ ctx, input }) => {
      const actorId = ctx.session.user.id;
      const [row] = await ctx.db
        .insert(trip_types)
        .values({
          ...input,
          code: input.code.toUpperCase(),
          created_by: actorId,
          updated_by: actorId,
        })
        .returning();
      return row;
    }),

  updateTripType: protectedProcedure
    .input(MetaValidators.updateTripTypeSchema)
    .mutation(async ({ ctx, input }) => {
      const actorId = ctx.session.user.id;
      const { id, code, ...data } = input;
      const [row] = await ctx.db
        .update(trip_types)
        .set({
          ...data,
          code: code?.toUpperCase(),
          updated_by: actorId,
          updated_at: new Date(),
        })
        .where(and(eq(trip_types.id, id), isNull(trip_types.deleted_at)))
        .returning();
      if (!row) throw notFound("Trip type");
      return row;
    }),

  deleteTripType: protectedProcedure
    .input(idSchema)
    .mutation(async ({ ctx, input }) => {
      const actorId = ctx.session.user.id;
      const [row] = await ctx.db
        .update(trip_types)
        .set({
          deleted_at: new Date(),
          deleted_by: actorId,
          updated_at: new Date(),
          updated_by: actorId,
        })
        .where(and(eq(trip_types.id, input.id), isNull(trip_types.deleted_at)))
        .returning();
      if (!row) throw notFound("Trip type");
      return row;
    }),
  /* ---------------- User document kinds ---------------- */
  // listUserDocumentKinds: publicProcedure
  //   .input(paginateZodSchema)
  //   .query(async ({ ctx, input }) => {
  //     const { currentPage, itemsPerPage } = input;
  //     const offset = (currentPage - 1) * itemsPerPage;
  //     const rows = await ctx.db.query.user_document_kinds.findMany({
  //       where: isNull(user_document_kinds.deleted_at),
  //       orderBy: (tbl, { asc }) => [asc(tbl.name)],
  //       offset,
  //       limit: itemsPerPage,
  //     });
  //     const [total] = await ctx.db
  //       .select({ count: count() })
  //       .from(user_document_kinds)
  //       .where(isNull(user_document_kinds.deleted_at));
  //     const totalItems = total?.count ?? 0;
  //     const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  //     return {
  //       data: rows,
  //       meta: {
  //         currentPage,
  //         itemsPerPage,
  //         totalItems,
  //         totalPages,
  //       },
  //     };
  //   }),
  // getUserDocumentKindById: publicProcedure
  //   .input(idSchema)
  //   .query(async ({ ctx, input }) => {
  //     const row = await ctx.db.query.user_document_kinds.findFirst({
  //       where: and(
  //         eq(user_document_kinds.id, input.id),
  //         isNull(user_document_kinds.deleted_at),
  //       ),
  //     });
  //     if (!row) throw notFound("User document kind");
  //     return row;
  //   }),
  // createUserDocumentKind: protectedProcedure
  //   .input(MetaValidators.createUserDocumentKindSchema)
  //   .mutation(async ({ ctx, input }) => {
  //     const actorId = ctx.session.user.id;
  //     const [row] = await ctx.db
  //       .insert(user_document_kinds)
  //       .values({
  //         ...input,
  //         created_by: actorId,
  //         updated_by: actorId,
  //       })
  //       .returning();
  //     return row;
  //   }),
  // updateUserDocumentKind: protectedProcedure
  //   .input(MetaValidators.updateUserDocumentKindSchema)
  //   .mutation(async ({ ctx, input }) => {
  //     const actorId = ctx.session.user.id;
  //     const { id, ...data } = input;
  //     const [row] = await ctx.db
  //       .update(user_document_kinds)
  //       .set({
  //         ...data,
  //         updated_by: actorId,
  //         updated_at: new Date(),
  //       })
  //       .where(
  //         and(
  //           eq(user_document_kinds.id, id),
  //           isNull(user_document_kinds.deleted_at),
  //         ),
  //       )
  //       .returning();
  //     if (!row) throw notFound("User document kind");
  //     return row;
  //   }),
  // deleteUserDocumentKind: protectedProcedure
  //   .input(idSchema)
  //   .mutation(async ({ ctx, input }) => {
  //     const actorId = ctx.session.user.id;
  //     const [row] = await ctx.db
  //       .update(user_document_kinds)
  //       .set({
  //         deleted_at: new Date(),
  //         deleted_by: actorId,
  //         updated_at: new Date(),
  //         updated_by: actorId,
  //       })
  //       .where(
  //         and(
  //           eq(user_document_kinds.id, input.id),
  //           isNull(user_document_kinds.deleted_at),
  //         ),
  //       )
  //       .returning();
  //     if (!row) throw notFound("User document kind");
  //     return row;
  //   }),
  /* ---------------- Vehicle document kinds ---------------- */
  // listVehicleDocumentKinds: publicProcedure
  //   .input(paginateZodSchema)
  //   .query(async ({ ctx, input }) => {
  //     const { currentPage, itemsPerPage } = input;
  //     const offset = (currentPage - 1) * itemsPerPage;
  //     const rows = await ctx.db.query.vehicle_document_kinds.findMany({
  //       where: isNull(vehicle_document_kinds.deleted_at),
  //       orderBy: (tbl, { asc }) => [asc(tbl.name)],
  //       offset,
  //       limit: itemsPerPage,
  //     });
  //     const [total] = await ctx.db
  //       .select({ count: count() })
  //       .from(vehicle_document_kinds)
  //       .where(isNull(vehicle_document_kinds.deleted_at));
  //     const totalItems = total?.count ?? 0;
  //     const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  //     return {
  //       data: rows,
  //       meta: {
  //         currentPage,
  //         itemsPerPage,
  //         totalItems,
  //         totalPages,
  //       },
  //     };
  //   }),
  // getVehicleDocumentKindById: publicProcedure
  //   .input(idSchema)
  //   .query(async ({ ctx, input }) => {
  //     const row = await ctx.db.query.vehicle_document_kinds.findFirst({
  //       where: and(
  //         eq(vehicle_document_kinds.id, input.id),
  //         isNull(vehicle_document_kinds.deleted_at),
  //       ),
  //     });
  //     if (!row) throw notFound("Vehicle document kind");
  //     return row;
  //   }),
  // createVehicleDocumentKind: protectedProcedure
  //   .input(MetaValidators.createVehicleDocumentKindSchema)
  //   .mutation(async ({ ctx, input }) => {
  //     const actorId = ctx.session.user.id;
  //     const [row] = await ctx.db
  //       .insert(vehicle_document_kinds)
  //       .values({
  //         ...input,
  //         created_by: actorId,
  //         updated_by: actorId,
  //       })
  //       .returning();
  //     return row;
  //   }),
  // updateVehicleDocumentKind: protectedProcedure
  //   .input(MetaValidators.updateVehicleDocumentKindSchema)
  //   .mutation(async ({ ctx, input }) => {
  //     const actorId = ctx.session.user.id;
  //     const { id, ...data } = input;
  //     const [row] = await ctx.db
  //       .update(vehicle_document_kinds)
  //       .set({
  //         ...data,
  //         updated_by: actorId,
  //         updated_at: new Date(),
  //       })
  //       .where(
  //         and(
  //           eq(vehicle_document_kinds.id, id),
  //           isNull(vehicle_document_kinds.deleted_at),
  //         ),
  //       )
  //       .returning();
  //     if (!row) throw notFound("Vehicle document kind");
  //     return row;
  //   }),
  // deleteVehicleDocumentKind: protectedProcedure
  //   .input(idSchema)
  //   .mutation(async ({ ctx, input }) => {
  //     const actorId = ctx.session.user.id;
  //     const [row] = await ctx.db
  //       .update(vehicle_document_kinds)
  //       .set({
  //         deleted_at: new Date(),
  //         deleted_by: actorId,
  //         updated_at: new Date(),
  //         updated_by: actorId,
  //       })
  //       .where(
  //         and(
  //           eq(vehicle_document_kinds.id, input.id),
  //           isNull(vehicle_document_kinds.deleted_at),
  //         ),
  //       )
  //       .returning();
  //     if (!row) throw notFound("Vehicle document kind");
  //     return row;
  //   }),
  /* ---------------- Vehicle types ---------------- */
  // listVehicleTypes: publicProcedure
  //   .input(paginateZodSchema)
  //   .query(async ({ ctx, input }) => {
  //     const { currentPage, itemsPerPage } = input;
  //     const offset = (currentPage - 1) * itemsPerPage;
  //     const rows = await ctx.db.query.vehicle_types.findMany({
  //       where: isNull(vehicle_types.deleted_at),
  //       orderBy: (tbl, { asc }) => [asc(tbl.name)],
  //       offset,
  //       limit: itemsPerPage,
  //     });
  //     const [total] = await ctx.db
  //       .select({ count: count() })
  //       .from(vehicle_types)
  //       .where(isNull(vehicle_types.deleted_at));
  //     const totalItems = total?.count ?? 0;
  //     const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  //     return {
  //       data: rows,
  //       meta: {
  //         currentPage,
  //         itemsPerPage,
  //         totalItems,
  //         totalPages,
  //       },
  //     };
  //   }),
  // getVehicleTypeById: publicProcedure
  //   .input(idSchema)
  //   .query(async ({ ctx, input }) => {
  //     const row = await ctx.db.query.vehicle_types.findFirst({
  //       where: and(
  //         eq(vehicle_types.id, input.id),
  //         isNull(vehicle_types.deleted_at),
  //       ),
  //     });
  //     if (!row) throw notFound("Vehicle type");
  //     return row;
  //   }),
  // createVehicleType: protectedProcedure
  //   .input(MetaValidators.createVehicleTypeSchema)
  //   .mutation(async ({ ctx, input }) => {
  //     const actorId = ctx.session.user.id;
  //     const [row] = await ctx.db
  //       .insert(vehicle_types)
  //       .values({
  //         ...input,
  //         created_by: actorId,
  //         updated_by: actorId,
  //       })
  //       .returning();
  //     return row;
  //   }),
  // updateVehicleType: protectedProcedure
  //   .input(MetaValidators.updateVehicleTypeSchema)
  //   .mutation(async ({ ctx, input }) => {
  //     const actorId = ctx.session.user.id;
  //     const { id, ...data } = input;
  //     const [row] = await ctx.db
  //       .update(vehicle_types)
  //       .set({
  //         ...data,
  //         updated_by: actorId,
  //         updated_at: new Date(),
  //       })
  //       .where(and(eq(vehicle_types.id, id), isNull(vehicle_types.deleted_at)))
  //       .returning();
  //     if (!row) throw notFound("Vehicle type");
  //     return row;
  //   }),
  // deleteVehicleType: protectedProcedure
  //   .input(idSchema)
  //   .mutation(async ({ ctx, input }) => {
  //     const actorId = ctx.session.user.id;
  //     const [row] = await ctx.db
  //       .update(vehicle_types)
  //       .set({
  //         deleted_at: new Date(),
  //         deleted_by: actorId,
  //         updated_at: new Date(),
  //         updated_by: actorId,
  //       })
  //       .where(
  //         and(eq(vehicle_types.id, input.id), isNull(vehicle_types.deleted_at)),
  //       )
  //       .returning();
  //     if (!row) throw notFound("Vehicle type");
  //     return row;
  //   }),
  /* ---------------- Payment methods ---------------- */
  // listPaymentMethods: publicProcedure
  //   .input(paginateZodSchema)
  //   .query(async ({ ctx, input }) => {
  //     const { currentPage, itemsPerPage } = input;
  //     const offset = (currentPage - 1) * itemsPerPage;
  //     const rows = await ctx.db.query.payment_methods.findMany({
  //       where: isNull(payment_methods.deleted_at),
  //       orderBy: (tbl, { asc }) => [asc(tbl.name)],
  //       offset,
  //       limit: itemsPerPage,
  //     });
  //     const [total] = await ctx.db
  //       .select({ count: count() })
  //       .from(payment_methods)
  //       .where(isNull(payment_methods.deleted_at));
  //     const totalItems = total?.count ?? 0;
  //     const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  //     return {
  //       data: rows,
  //       meta: {
  //         currentPage,
  //         itemsPerPage,
  //         totalItems,
  //         totalPages,
  //       },
  //     };
  //   }),
  // getPaymentMethodById: publicProcedure
  //   .input(idSchema)
  //   .query(async ({ ctx, input }) => {
  //     const row = await ctx.db.query.payment_methods.findFirst({
  //       where: and(
  //         eq(payment_methods.id, input.id),
  //         isNull(payment_methods.deleted_at),
  //       ),
  //     });
  //     if (!row) throw notFound("Payment method");
  //     return row;
  //   }),
  // createPaymentMethod: protectedProcedure
  //   .input(MetaValidators.createPaymentMethodSchema)
  //   .mutation(async ({ ctx, input }) => {
  //     const actorId = ctx.session.user.id;
  //     const [row] = await ctx.db
  //       .insert(payment_methods)
  //       .values({
  //         ...input,
  //         created_by: actorId,
  //         updated_by: actorId,
  //       })
  //       .returning();
  //     return row;
  //   }),
  // updatePaymentMethod: protectedProcedure
  //   .input(MetaValidators.updatePaymentMethodSchema)
  //   .mutation(async ({ ctx, input }) => {
  //     const actorId = ctx.session.user.id;
  //     const { id, ...data } = input;
  //     const [row] = await ctx.db
  //       .update(payment_methods)
  //       .set({
  //         ...data,
  //         updated_by: actorId,
  //         updated_at: new Date(),
  //       })
  //       .where(
  //         and(eq(payment_methods.id, id), isNull(payment_methods.deleted_at)),
  //       )
  //       .returning();
  //     if (!row) throw notFound("Payment method");
  //     return row;
  //   }),
  // deletePaymentMethod: protectedProcedure
  //   .input(idSchema)
  //   .mutation(async ({ ctx, input }) => {
  //     const actorId = ctx.session.user.id;
  //     const [row] = await ctx.db
  //       .update(payment_methods)
  //       .set({
  //         deleted_at: new Date(),
  //         deleted_by: actorId,
  //         updated_at: new Date(),
  //         updated_by: actorId,
  //       })
  //       .where(
  //         and(
  //           eq(payment_methods.id, input.id),
  //           isNull(payment_methods.deleted_at),
  //         ),
  //       )
  //       .returning();
  //     if (!row) throw notFound("Payment method");
  //     return row;
  //   }),
  /* ---------------- Account types ---------------- */
  // listAccountTypes: publicProcedure
  //   .input(paginateZodSchema)
  //   .query(async ({ ctx, input }) => {
  //     const { currentPage, itemsPerPage } = input;
  //     const offset = (currentPage - 1) * itemsPerPage;
  //     const rows = await ctx.db.query.account_types.findMany({
  //       where: isNull(account_types.deleted_at),
  //       orderBy: (tbl, { asc }) => [asc(tbl.name)],
  //       offset,
  //       limit: itemsPerPage,
  //     });
  //     const [total] = await ctx.db
  //       .select({ count: count() })
  //       .from(account_types)
  //       .where(isNull(account_types.deleted_at));
  //     const totalItems = total?.count ?? 0;
  //     const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  //     return {
  //       data: rows,
  //       meta: {
  //         currentPage,
  //         itemsPerPage,
  //         totalItems,
  //         totalPages,
  //       },
  //     };
  //   }),
  // getAccountTypeById: publicProcedure
  //   .input(idSchema)
  //   .query(async ({ ctx, input }) => {
  //     const row = await ctx.db.query.account_types.findFirst({
  //       where: and(
  //         eq(account_types.id, input.id),
  //         isNull(account_types.deleted_at),
  //       ),
  //     });
  //     if (!row) throw notFound("Account type");
  //     return row;
  //   }),
  // createAccountType: protectedProcedure
  //   .input(MetaValidators.createAccountTypeSchema)
  //   .mutation(async ({ ctx, input }) => {
  //     const actorId = ctx.session.user.id;
  //     const [row] = await ctx.db
  //       .insert(account_types)
  //       .values({
  //         ...input,
  //         created_by: actorId,
  //         updated_by: actorId,
  //       })
  //       .returning();
  //     return row;
  //   }),
  // updateAccountType: protectedProcedure
  //   .input(MetaValidators.updateAccountTypeSchema)
  //   .mutation(async ({ ctx, input }) => {
  //     const actorId = ctx.session.user.id;
  //     const { id, ...data } = input;
  //     const [row] = await ctx.db
  //       .update(account_types)
  //       .set({
  //         ...data,
  //         updated_by: actorId,
  //         updated_at: new Date(),
  //       })
  //       .where(and(eq(account_types.id, id), isNull(account_types.deleted_at)))
  //       .returning();
  //     if (!row) throw notFound("Account type");
  //     return row;
  //   }),
  // deleteAccountType: protectedProcedure
  //   .input(idSchema)
  //   .mutation(async ({ ctx, input }) => {
  //     const actorId = ctx.session.user.id;
  //     const [row] = await ctx.db
  //       .update(account_types)
  //       .set({
  //         deleted_at: new Date(),
  //         deleted_by: actorId,
  //         updated_at: new Date(),
  //         updated_by: actorId,
  //       })
  //       .where(
  //         and(eq(account_types.id, input.id), isNull(account_types.deleted_at)),
  //       )
  //       .returning();
  //     if (!row) throw notFound("Account type");
  //     return row;
  //   }),
  /* ---------------- Bank account types ---------------- */
  // listBankAccountTypes: publicProcedure
  //   .input(paginateZodSchema)
  //   .query(async ({ ctx, input }) => {
  //     const { currentPage, itemsPerPage } = input;
  //     const offset = (currentPage - 1) * itemsPerPage;
  //     const rows = await ctx.db.query.bank_account_types.findMany({
  //       where: isNull(bank_account_types.deleted_at),
  //       orderBy: (tbl, { asc }) => [asc(tbl.name)],
  //       offset,
  //       limit: itemsPerPage,
  //     });
  //     const [total] = await ctx.db
  //       .select({ count: count() })
  //       .from(bank_account_types)
  //       .where(isNull(bank_account_types.deleted_at));
  //     const totalItems = total?.count ?? 0;
  //     const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  //     return {
  //       data: rows,
  //       meta: {
  //         currentPage,
  //         itemsPerPage,
  //         totalItems,
  //         totalPages,
  //       },
  //     };
  //   }),
  // getBankAccountTypeById: publicProcedure
  //   .input(idSchema)
  //   .query(async ({ ctx, input }) => {
  //     const row = await ctx.db.query.bank_account_types.findFirst({
  //       where: and(
  //         eq(bank_account_types.id, input.id),
  //         isNull(bank_account_types.deleted_at),
  //       ),
  //     });
  //     if (!row) throw notFound("Bank account type");
  //     return row;
  //   }),
  // createBankAccountType: protectedProcedure
  //   .input(MetaValidators.createBankAccountTypeSchema)
  //   .mutation(async ({ ctx, input }) => {
  //     const actorId = ctx.session.user.id;
  //     const [row] = await ctx.db
  //       .insert(bank_account_types)
  //       .values({
  //         ...input,
  //         created_by: actorId,
  //         updated_by: actorId,
  //       })
  //       .returning();
  //     return row;
  //   }),
  // updateBankAccountType: protectedProcedure
  //   .input(MetaValidators.updateBankAccountTypeSchema)
  //   .mutation(async ({ ctx, input }) => {
  //     const actorId = ctx.session.user.id;
  //     const { id, ...data } = input;
  //     const [row] = await ctx.db
  //       .update(bank_account_types)
  //       .set({
  //         ...data,
  //         updated_by: actorId,
  //         updated_at: new Date(),
  //       })
  //       .where(
  //         and(
  //           eq(bank_account_types.id, id),
  //           isNull(bank_account_types.deleted_at),
  //         ),
  //       )
  //       .returning();
  //     if (!row) throw notFound("Bank account type");
  //     return row;
  //   }),
  // deleteBankAccountType: protectedProcedure
  //   .input(idSchema)
  //   .mutation(async ({ ctx, input }) => {
  //     const actorId = ctx.session.user.id;
  //     const [row] = await ctx.db
  //       .update(bank_account_types)
  //       .set({
  //         deleted_at: new Date(),
  //         deleted_by: actorId,
  //         updated_at: new Date(),
  //         updated_by: actorId,
  //       })
  //       .where(
  //         and(
  //           eq(bank_account_types.id, input.id),
  //           isNull(bank_account_types.deleted_at),
  //         ),
  //       )
  //       .returning();
  //     if (!row) throw notFound("Bank account type");
  //     return row;
  //   }),
  /* ---------------- Company types ---------------- */
  // listCompanyTypes: publicProcedure
  //   .input(paginateZodSchema)
  //   .query(async ({ ctx, input }) => {
  //     const { currentPage, itemsPerPage } = input;
  //     const offset = (currentPage - 1) * itemsPerPage;
  //     const rows = await ctx.db.query.company_types.findMany({
  //       where: isNull(company_types.deleted_at),
  //       orderBy: (tbl, { asc }) => [asc(tbl.name)],
  //       offset,
  //       limit: itemsPerPage,
  //     });
  //     const [total] = await ctx.db
  //       .select({ count: count() })
  //       .from(company_types)
  //       .where(isNull(company_types.deleted_at));
  //     const totalItems = total?.count ?? 0;
  //     const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  //     return {
  //       data: rows,
  //       meta: {
  //         currentPage,
  //         itemsPerPage,
  //         totalItems,
  //         totalPages,
  //       },
  //     };
  //   }),
  // getCompanyTypeById: publicProcedure
  //   .input(idSchema)
  //   .query(async ({ ctx, input }) => {
  //     const row = await ctx.db.query.company_types.findFirst({
  //       where: and(
  //         eq(company_types.id, input.id),
  //         isNull(company_types.deleted_at),
  //       ),
  //     });
  //     if (!row) throw notFound("Company type");
  //     return row;
  //   }),
  // createCompanyType: protectedProcedure
  //   .input(MetaValidators.createCompanyTypeSchema)
  //   .mutation(async ({ ctx, input }) => {
  //     const actorId = ctx.session.user.id;
  //     const [row] = await ctx.db
  //       .insert(company_types)
  //       .values({
  //         ...input,
  //         created_by: actorId,
  //         updated_by: actorId,
  //       })
  //       .returning();
  //     return row;
  //   }),
  // updateCompanyType: protectedProcedure
  //   .input(MetaValidators.updateCompanyTypeSchema)
  //   .mutation(async ({ ctx, input }) => {
  //     const actorId = ctx.session.user.id;
  //     const { id, ...data } = input;
  //     const [row] = await ctx.db
  //       .update(company_types)
  //       .set({
  //         ...data,
  //         updated_by: actorId,
  //         updated_at: new Date(),
  //       })
  //       .where(and(eq(company_types.id, id), isNull(company_types.deleted_at)))
  //       .returning();
  //     if (!row) throw notFound("Company type");
  //     return row;
  //   }),
  // deleteCompanyType: protectedProcedure
  //   .input(idSchema)
  //   .mutation(async ({ ctx, input }) => {
  //     const actorId = ctx.session.user.id;
  //     const [row] = await ctx.db
  //       .update(company_types)
  //       .set({
  //         deleted_at: new Date(),
  //         deleted_by: actorId,
  //         updated_at: new Date(),
  //         updated_by: actorId,
  //       })
  //       .where(
  //         and(eq(company_types.id, input.id), isNull(company_types.deleted_at)),
  //       )
  //       .returning();
  //     if (!row) throw notFound("Company type");
  //     return row;
  //   }),
  /* ---------------- Priority levels ---------------- */
  // listPriorityLevels: publicProcedure
  //   .input(paginateZodSchema)
  //   .query(async ({ ctx, input }) => {
  //     const { currentPage, itemsPerPage } = input;
  //     const offset = (currentPage - 1) * itemsPerPage;
  //     const rows = await ctx.db.query.priority_levels.findMany({
  //       where: isNull(priority_levels.deleted_at),
  //       orderBy: (tbl, { asc }) => [asc(tbl.level), asc(tbl.name)],
  //       offset,
  //       limit: itemsPerPage,
  //     });
  //     const [total] = await ctx.db
  //       .select({ count: count() })
  //       .from(priority_levels)
  //       .where(isNull(priority_levels.deleted_at));
  //     const totalItems = total?.count ?? 0;
  //     const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  //     return {
  //       data: rows,
  //       meta: {
  //         currentPage,
  //         itemsPerPage,
  //         totalItems,
  //         totalPages,
  //       },
  //     };
  //   }),
  // getPriorityLevelById: publicProcedure
  //   .input(idSchema)
  //   .query(async ({ ctx, input }) => {
  //     const row = await ctx.db.query.priority_levels.findFirst({
  //       where: and(
  //         eq(priority_levels.id, input.id),
  //         isNull(priority_levels.deleted_at),
  //       ),
  //     });
  //     if (!row) throw notFound("Priority level");
  //     return row;
  //   }),
  // createPriorityLevel: protectedProcedure
  //   .input(MetaValidators.createPriorityLevelSchema)
  //   .mutation(async ({ ctx, input }) => {
  //     const actorId = ctx.session.user.id;
  //     const [row] = await ctx.db
  //       .insert(priority_levels)
  //       .values({
  //         ...input,
  //         created_by: actorId,
  //         updated_by: actorId,
  //       })
  //       .returning();
  //     return row;
  //   }),
  // updatePriorityLevel: protectedProcedure
  //   .input(MetaValidators.updatePriorityLevelSchema)
  //   .mutation(async ({ ctx, input }) => {
  //     const actorId = ctx.session.user.id;
  //     const { id, ...data } = input;
  //     const [row] = await ctx.db
  //       .update(priority_levels)
  //       .set({
  //         ...data,
  //         updated_by: actorId,
  //         updated_at: new Date(),
  //       })
  //       .where(
  //         and(eq(priority_levels.id, id), isNull(priority_levels.deleted_at)),
  //       )
  //       .returning();
  //     if (!row) throw notFound("Priority level");
  //     return row;
  //   }),
  // deletePriorityLevel: protectedProcedure
  //   .input(idSchema)
  //   .mutation(async ({ ctx, input }) => {
  //     const actorId = ctx.session.user.id;
  //     const [row] = await ctx.db
  //       .update(priority_levels)
  //       .set({
  //         deleted_at: new Date(),
  //         deleted_by: actorId,
  //         updated_at: new Date(),
  //         updated_by: actorId,
  //       })
  //       .where(
  //         and(
  //           eq(priority_levels.id, input.id),
  //           isNull(priority_levels.deleted_at),
  //         ),
  //       )
  //       .returning();
  //     if (!row) throw notFound("Priority level");
  //     return row;
  //   }),
  /* ---------------- Approval statuses ---------------- */
  // listApprovalStatuses: publicProcedure
  //   .input(paginateZodSchema)
  //   .query(async ({ ctx, input }) => {
  //     const { currentPage, itemsPerPage } = input;
  //     const offset = (currentPage - 1) * itemsPerPage;
  //     const rows = await ctx.db.query.approval_statuses.findMany({
  //       where: isNull(approval_statuses.deleted_at),
  //       orderBy: (tbl, { asc }) => [asc(tbl.name)],
  //       offset,
  //       limit: itemsPerPage,
  //     });
  //     const [total] = await ctx.db
  //       .select({ count: count() })
  //       .from(approval_statuses)
  //       .where(isNull(approval_statuses.deleted_at));
  //     const totalItems = total?.count ?? 0;
  //     const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  //     return {
  //       data: rows,
  //       meta: {
  //         currentPage,
  //         itemsPerPage,
  //         totalItems,
  //         totalPages,
  //       },
  //     };
  //   }),
  // getApprovalStatusById: publicProcedure
  //   .input(idSchema)
  //   .query(async ({ ctx, input }) => {
  //     const row = await ctx.db.query.approval_statuses.findFirst({
  //       where: and(
  //         eq(approval_statuses.id, input.id),
  //         isNull(approval_statuses.deleted_at),
  //       ),
  //     });
  //     if (!row) throw notFound("Approval status");
  //     return row;
  //   }),
  // createApprovalStatus: protectedProcedure
  //   .input(MetaValidators.createApprovalStatusSchema)
  //   .mutation(async ({ ctx, input }) => {
  //     const actorId = ctx.session.user.id;
  //     const [row] = await ctx.db
  //       .insert(approval_statuses)
  //       .values({
  //         ...input,
  //         created_by: actorId,
  //         updated_by: actorId,
  //       })
  //       .returning();
  //     return row;
  //   }),
  // updateApprovalStatus: protectedProcedure
  //   .input(MetaValidators.updateApprovalStatusSchema)
  //   .mutation(async ({ ctx, input }) => {
  //     const actorId = ctx.session.user.id;
  //     const { id, ...data } = input;
  //     const [row] = await ctx.db
  //       .update(approval_statuses)
  //       .set({
  //         ...data,
  //         updated_by: actorId,
  //         updated_at: new Date(),
  //       })
  //       .where(
  //         and(
  //           eq(approval_statuses.id, id),
  //           isNull(approval_statuses.deleted_at),
  //         ),
  //       )
  //       .returning();
  //     if (!row) throw notFound("Approval status");
  //     return row;
  //   }),
  // deleteApprovalStatus: protectedProcedure
  //   .input(idSchema)
  //   .mutation(async ({ ctx, input }) => {
  //     const actorId = ctx.session.user.id;
  //     const [row] = await ctx.db
  //       .update(approval_statuses)
  //       .set({
  //         deleted_at: new Date(),
  //         deleted_by: actorId,
  //         updated_at: new Date(),
  //         updated_by: actorId,
  //       })
  //       .where(
  //         and(
  //           eq(approval_statuses.id, input.id),
  //           isNull(approval_statuses.deleted_at),
  //         ),
  //       )
  //       .returning();
  //     if (!row) throw notFound("Approval status");
  //     return row;
  //   }),
  /* ---------------- Fuel types ---------------- */
  // listFuelTypes: publicProcedure
  //   .input(paginateZodSchema)
  //   .query(async ({ ctx, input }) => {
  //     const { currentPage, itemsPerPage } = input;
  //     const offset = (currentPage - 1) * itemsPerPage;
  //     const rows = await ctx.db.query.fuel_types.findMany({
  //       where: isNull(fuel_types.deleted_at),
  //       orderBy: (tbl, { asc }) => [asc(tbl.name)],
  //       offset,
  //       limit: itemsPerPage,
  //     });
  //     const [total] = await ctx.db
  //       .select({ count: count() })
  //       .from(fuel_types)
  //       .where(isNull(fuel_types.deleted_at));
  //     const totalItems = total?.count ?? 0;
  //     const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  //     return {
  //       data: rows,
  //       meta: {
  //         currentPage,
  //         itemsPerPage,
  //         totalItems,
  //         totalPages,
  //       },
  //     };
  //   }),
  // getFuelTypeById: publicProcedure
  //   .input(idSchema)
  //   .query(async ({ ctx, input }) => {
  //     const row = await ctx.db.query.fuel_types.findFirst({
  //       where: and(eq(fuel_types.id, input.id), isNull(fuel_types.deleted_at)),
  //     });
  //     if (!row) throw notFound("Fuel type");
  //     return row;
  //   }),
  // createFuelType: protectedProcedure
  //   .input(MetaValidators.createFuelTypeSchema)
  //   .mutation(async ({ ctx, input }) => {
  //     const actorId = ctx.session.user.id;
  //     const [row] = await ctx.db
  //       .insert(fuel_types)
  //       .values({
  //         ...input,
  //         created_by: actorId,
  //         updated_by: actorId,
  //       })
  //       .returning();
  //     return row;
  //   }),
  // updateFuelType: protectedProcedure
  //   .input(MetaValidators.updateFuelTypeSchema)
  //   .mutation(async ({ ctx, input }) => {
  //     const actorId = ctx.session.user.id;
  //     const { id, ...data } = input;
  //     const [row] = await ctx.db
  //       .update(fuel_types)
  //       .set({
  //         ...data,
  //         updated_by: actorId,
  //         updated_at: new Date(),
  //       })
  //       .where(and(eq(fuel_types.id, id), isNull(fuel_types.deleted_at)))
  //       .returning();
  //     if (!row) throw notFound("Fuel type");
  //     return row;
  //   }),
  // deleteFuelType: protectedProcedure
  //   .input(idSchema)
  //   .mutation(async ({ ctx, input }) => {
  //     const actorId = ctx.session.user.id;
  //     const [row] = await ctx.db
  //       .update(fuel_types)
  //       .set({
  //         deleted_at: new Date(),
  //         deleted_by: actorId,
  //         updated_at: new Date(),
  //         updated_by: actorId,
  //       })
  //       .where(and(eq(fuel_types.id, input.id), isNull(fuel_types.deleted_at)))
  //       .returning();
  //     if (!row) throw notFound("Fuel type");
  //     return row;
  //   }),

  /* ---------------- Lane types ---------------- */
  listLaneTypes: publicProcedure
    .input(paginateZodSchema)
    .query(async ({ ctx, input }) => {
      const { currentPage, itemsPerPage } = input;
      const offset = (currentPage - 1) * itemsPerPage;
      const rows = await ctx.db.query.lane_types.findMany({
        where: isNull(lane_types.deleted_at),
        orderBy: (tbl, { asc }) => [asc(tbl.name)],
        offset,
        limit: itemsPerPage,
      });
      const [total] = await ctx.db
        .select({ count: count() })
        .from(lane_types)
        .where(isNull(lane_types.deleted_at));
      const totalItems = total?.count ?? 0;
      const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
      return {
        data: rows,
        meta: {
          currentPage,
          itemsPerPage,
          totalItems,
          totalPages,
        },
      };
    }),

  getLaneTypeById: publicProcedure
    .input(idSchema)
    .query(async ({ ctx, input }) => {
      const row = await ctx.db.query.lane_types.findFirst({
        where: and(eq(lane_types.id, input.id), isNull(lane_types.deleted_at)),
      });
      if (!row) throw notFound("Lane type");
      return row;
    }),

  createLaneType: protectedProcedure
    .input(MetaValidators.createLaneTypeSchema)
    .mutation(async ({ ctx, input }) => {
      const actorId = ctx.session.user.id;
      const [row] = await ctx.db
        .insert(lane_types)
        .values({
          ...input,
          created_by: actorId,
          updated_by: actorId,
        })
        .returning();
      return row;
    }),

  updateLaneType: protectedProcedure
    .input(MetaValidators.updateLaneTypeSchema)
    .mutation(async ({ ctx, input }) => {
      const actorId = ctx.session.user.id;
      const { id, ...data } = input;
      const [row] = await ctx.db
        .update(lane_types)
        .set({
          ...data,
          updated_by: actorId,
          updated_at: new Date(),
        })
        .where(and(eq(lane_types.id, id), isNull(lane_types.deleted_at)))
        .returning();
      if (!row) throw notFound("Lane type");
      return row;
    }),

  deleteLaneType: protectedProcedure
    .input(idSchema)
    .mutation(async ({ ctx, input }) => {
      const actorId = ctx.session.user.id;
      const [row] = await ctx.db
        .update(lane_types)
        .set({
          deleted_at: new Date(),
          deleted_by: actorId,
          updated_at: new Date(),
          updated_by: actorId,
        })
        .where(and(eq(lane_types.id, input.id), isNull(lane_types.deleted_at)))
        .returning();
      if (!row) throw notFound("Lane type");
      return row;
    }),

  /* ---------------- Fleet sizes ---------------- */
  listFleetSizes: publicProcedure
    .input(paginateZodSchema)
    .query(async ({ ctx, input }) => {
      const { currentPage, itemsPerPage } = input;
      const offset = (currentPage - 1) * itemsPerPage;
      const rows = await ctx.db.query.fleet_sizes.findMany({
        where: isNull(fleet_sizes.deleted_at),
        orderBy: (tbl, { asc }) => [asc(tbl.size_label)],
        offset,
        limit: itemsPerPage,
      });
      const [total] = await ctx.db
        .select({ count: count() })
        .from(fleet_sizes)
        .where(isNull(fleet_sizes.deleted_at));
      const totalItems = total?.count ?? 0;
      const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
      return {
        data: rows,
        meta: {
          currentPage,
          itemsPerPage,
          totalItems,
          totalPages,
        },
      };
    }),

  getFleetSizeById: publicProcedure
    .input(idSchema)
    .query(async ({ ctx, input }) => {
      const row = await ctx.db.query.fleet_sizes.findFirst({
        where: and(
          eq(fleet_sizes.id, input.id),
          isNull(fleet_sizes.deleted_at),
        ),
      });
      if (!row) throw notFound("Fleet size");
      return row;
    }),

  createFleetSize: protectedProcedure
    .input(MetaValidators.createFleetSizeSchema)
    .mutation(async ({ ctx, input }) => {
      const actorId = ctx.session.user.id;
      const [row] = await ctx.db
        .insert(fleet_sizes)
        .values({
          ...input,
          code: input.code.toUpperCase(),
          created_by: actorId,
          updated_by: actorId,
        })
        .returning();
      return row;
    }),

  updateFleetSize: protectedProcedure
    .input(MetaValidators.updateFleetSizeSchema)
    .mutation(async ({ ctx, input }) => {
      const actorId = ctx.session.user.id;
      const { id, code, ...data } = input;
      const [row] = await ctx.db
        .update(fleet_sizes)
        .set({
          ...data,
          code: code?.toUpperCase(),
          updated_by: actorId,
          updated_at: new Date(),
        })
        .where(and(eq(fleet_sizes.id, id), isNull(fleet_sizes.deleted_at)))
        .returning();
      if (!row) throw notFound("Fleet size");
      return row;
    }),

  deleteFleetSize: protectedProcedure
    .input(idSchema)
    .mutation(async ({ ctx, input }) => {
      const actorId = ctx.session.user.id;
      const [row] = await ctx.db
        .update(fleet_sizes)
        .set({
          deleted_at: new Date(),
          deleted_by: actorId,
          updated_at: new Date(),
          updated_by: actorId,
        })
        .where(
          and(eq(fleet_sizes.id, input.id), isNull(fleet_sizes.deleted_at)),
        )
        .returning();
      if (!row) throw notFound("Fleet size");
      return row;
    }),
} satisfies TRPCRouterRecord;
