import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import { and, eq, isNull } from "@fleetio/db";
import {
  vehicle_manufacturers,
  vehicle_models,
  vehicles,
} from "@fleetio/db/schema";
import {
  createFullVehicleSchema,
  createVehicleManufacturerSchema,
  createVehicleModelSchema,
  createVehicleSchema,
  updateVehicleManufacturerSchema,
  updateVehicleModelSchema,
  updateVehicleSchema,
} from "@fleetio/validators";

import { protectedProcedure } from "../trpc";

export const vehicleRouter = {
  listManufacturers: protectedProcedure.query(({ ctx }) => {
    return ctx.db.query.vehicle_manufacturers.findMany({
      where: isNull(vehicle_manufacturers.deleted_at),
      orderBy: (table, { desc }) => [desc(table.created_at)],
    });
  }),

  createManufacturer: protectedProcedure
    .input(createVehicleManufacturerSchema)
    .mutation(({ ctx, input }) => {
      const actorId = ctx.session.user.id;
      return ctx.db
        .insert(vehicle_manufacturers)
        .values({
          ...input,
          created_by: actorId,
          updated_by: actorId,
        })
        .returning();
    }),

  updateManufacturer: protectedProcedure
    .input(updateVehicleManufacturerSchema)
    .mutation(({ ctx, input }) => {
      const { id, ...data } = input;
      const actorId = ctx.session.user.id;
      return ctx.db
        .update(vehicle_manufacturers)
        .set({
          ...data,
          updated_at: new Date(),
          updated_by: actorId,
        })
        .where(eq(vehicle_manufacturers.id, id))
        .returning();
    }),

  deleteManufacturer: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(({ ctx, input }) => {
      const actorId = ctx.session.user.id;
      return ctx.db
        .update(vehicle_manufacturers)
        .set({
          deleted_at: new Date(),
          deleted_by: actorId,
          updated_at: new Date(),
          updated_by: actorId,
        })
        .where(eq(vehicle_manufacturers.id, input.id))
        .returning();
    }),

  // --- Models (Global) ---
  listModels: protectedProcedure
    .input(z.object({ manufacturerId: z.number().optional() }))
    .query(({ ctx, input }) => {
      return ctx.db.query.vehicle_models.findMany({
        where: input.manufacturerId
          ? and(
              eq(vehicle_models.manufacturer_id, input.manufacturerId),
              isNull(vehicle_models.deleted_at),
            )
          : isNull(vehicle_models.deleted_at),
        with: {
          manufacturer: true,
        },
        orderBy: (table, { desc }) => [desc(table.created_at)],
      });
    }),

  createModel: protectedProcedure
    .input(createVehicleModelSchema)
    .mutation(({ ctx, input }) => {
      const actorId = ctx.session.user.id;
      return ctx.db
        .insert(vehicle_models)
        .values({
          code: input.code.trim(),
          name: input.name.trim(),
          manufacturer_id: input.manufacturer_id,
          created_by: actorId,
          updated_by: actorId,
        })
        .returning();
    }),

  updateModel: protectedProcedure
    .input(updateVehicleModelSchema)
    .mutation(({ ctx, input }) => {
      const { id, ...rest } = input;
      const actorId = ctx.session.user.id;
      return ctx.db
        .update(vehicle_models)
        .set({
          ...rest,
          updated_at: new Date(),
          updated_by: actorId,
        })
        .where(eq(vehicle_models.id, id))
        .returning();
    }),

  deleteModel: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(({ ctx, input }) => {
      const actorId = ctx.session.user.id;
      return ctx.db
        .update(vehicle_models)
        .set({
          deleted_at: new Date(),
          deleted_by: actorId,
          updated_at: new Date(),
          updated_by: actorId,
        })
        .where(eq(vehicle_models.id, input.id))
        .returning();
    }),

  // --- Vehicles (Org Scoped) ---
  listVehicles: protectedProcedure
    .input(z.object({ orgId: z.number().int().positive() }))
    .query(({ ctx, input }) => {
      return ctx.db.query.vehicles.findMany({
        where: and(
          eq(vehicles.organization_id, input.orgId),
          isNull(vehicles.deleted_at),
        ),
        with: {
          model: {
            with: { manufacturer: true },
          },
        },
        orderBy: (table, { desc }) => [desc(table.created_at)],
      });
    }),

  createVehicle: protectedProcedure
    .input(createVehicleSchema)
    .mutation(({ ctx, input }) => {
      const actionId = ctx.session.user.id;
      return ctx.db
        .insert(vehicles)
        .values({
          ...input,
          created_by: actionId,
          updated_by: actionId,
        })
        .returning();
    }),

  updateVehicle: protectedProcedure
    .input(updateVehicleSchema)
    .mutation(({ ctx, input }) => {
      const { id, ...data } = input;
      const actionId = ctx.session.user.id;

      return ctx.db
        .update(vehicles)
        .set({
          ...data,
          updated_at: new Date(),
          updated_by: actionId,
        })
        .where(and(eq(vehicles.id, id)))
        .returning();
    }),

  deleteVehicle: protectedProcedure
    .input(z.object({ id: z.number(), organizationId: z.number() }))
    .mutation(({ ctx, input }) => {
      const actorId = ctx.session.user.id;
      return ctx.db
        .update(vehicles)
        .set({
          deleted_at: new Date(),
          deleted_by: actorId,
          updated_at: new Date(),
          updated_by: actorId,
        })
        .where(
          and(
            eq(vehicles.id, input.id),
            eq(vehicles.organization_id, input.organizationId),
          ),
        )
        .returning();
    }),

  // --- Combined Mutation ---
  createFullVehicle: protectedProcedure
    .input(createFullVehicleSchema)
    .mutation(async ({ ctx, input }) => {
      const { manufacturer, model, vehicle, organizationId } = input;
      // 1. Handle Manufacturer
      let manufacturerId: number;
      // Check if exists (case insensitive maybe? for now exact match)
      const existingManufacturer =
        await ctx.db.query.vehicle_manufacturers.findFirst({
          where: eq(vehicle_manufacturers.name, manufacturer.name),
        });
      if (existingManufacturer) {
        manufacturerId = existingManufacturer.id;
      } else {
        const [newManufacturer] = await ctx.db
          .insert(vehicle_manufacturers)
          .values(manufacturer)
          .returning();
        if (!newManufacturer) throw new Error("Failed to create manufacturer");
        manufacturerId = newManufacturer.id;
      }

      // 2. Handle Model
      let modelId: number;
      const existingModel = await ctx.db.query.vehicle_models.findFirst({
        where: and(eq(vehicle_models.name, model.name)),
      });
      if (existingModel) {
        modelId = existingModel.id;
      } else {
        const [newModel] = await ctx.db
          .insert(vehicle_models)
          .values({
            ...model,
            // manufacturerId,
          })
          .returning();
        if (!newModel) throw new Error("Failed to create model");
        modelId = newModel.id;
      }
      // 3. Create Vehicle
      const [newVehicle] = await ctx.db
        .insert(vehicles)
        .values({
          ...vehicle,
          organization_id: organizationId,
          model_id: modelId,
          created_by: ctx.session.user.id,
          updated_by: ctx.session.user.id,
        })
        .returning();
      return newVehicle;
    }),
} satisfies TRPCRouterRecord;
