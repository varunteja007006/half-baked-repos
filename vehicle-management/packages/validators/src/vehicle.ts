import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

import {
  fuel_types,
  vehicle_docs,
  vehicle_document_kinds,
  vehicle_manufacturers,
  vehicle_models,
  vehicle_types,
  vehicles,
} from "@fleetio/db/schema";

import { createdUpdatedAuditFields } from "./utils";

export const createVehicleManufacturerSchema = createInsertSchema(
  vehicle_manufacturers,
  {
    code: z
      .string()
      .min(1)
      .max(64)
      .regex(/^[a-z0-9_-]+$/i, {
        message:
          "Code can only contain letters, numbers, hyphens, or underscores.",
      })
      .transform((val) => val.trim()),
    name: z
      .string()
      .min(1)
      .max(256)
      .transform((val) => val.trim()),
    country: z
      .string()
      .max(128)
      .optional()
      .transform((val) => val?.trim()),
  },
).omit({
  id: true,
  created_at: true,
  updated_at: true,
  deleted_at: true,
  created_by: true,
  updated_by: true,
  deleted_by: true,
});

export const updateVehicleManufacturerSchema = createVehicleManufacturerSchema
  .partial()
  .extend({
    id: z.number().int().positive(),
  })
  .refine((data) => {
    const { id: _, ...rest } = data;
    return Object.keys(rest).length > 0;
  }, "Provide at least one field to update.");

export const createVehicleModelSchema = createInsertSchema(vehicle_models, {
  code: z
    .string()
    .min(1)
    .max(64)
    .regex(/^[a-z0-9_-]+$/i, {
      message:
        "Code can only contain letters, numbers, hyphens, or underscores.",
    }),
  name: z.string().min(1).max(256),
  variant: z.string().max(128).optional(),
  release_year: z.number().int().optional(),
  manufacturer_id: z.number().int().positive(),
}).omit({
  id: true,
  created_at: true,
  updated_at: true,
  deleted_at: true,
  created_by: true,
  updated_by: true,
  deleted_by: true,
});

export const updateVehicleModelSchema = createVehicleModelSchema
  .partial()
  .extend({
    id: z.number().int().positive(),
  })
  .refine((data) => {
    const { id: _, ...rest } = data;
    return Object.keys(rest).length > 0;
  }, "Provide at least one field to update.");

export const createVehicleSchema = createInsertSchema(vehicles, {
  organization_id: z.number().int().positive(),

  vehicle_no: z.string().min(1).max(64),
  chassis_no: z.string().max(128).optional(),
  engine_no: z.string().max(128).optional(),

  model_id: z.number().int().positive().optional().nullable(),

  fleet_size_id: z.number().int().positive().optional().nullable(),
  mileage: z.number().int().optional(),
  insurance_no: z.string().max(128).optional(),
  vin: z.string().max(128).optional(),
  vehicle_type_id: z.number().int().positive().optional().nullable(),

  capacity: z.number().int().optional(),
}).omit({
  id: true,
  created_by: true,
  updated_by: true,
  created_at: true,
  updated_at: true,
  deleted_at: true,
  deleted_by: true,
});

export const updateVehicleSchema = createVehicleSchema
  .partial()
  .extend({ id: z.number() });

/* ----------------------------------------
   Full vehicle creation validator
   ---------------------------------------- */

export const createFullVehicleSchema = z.object({
  organizationId: z.number().int().positive(),
  manufacturer: createVehicleManufacturerSchema,
  model: createVehicleModelSchema,
  vehicle: createVehicleSchema.omit({
    model_id: true,
    organization_id: true,
  }),
});

/* ----------------------------------------
   Vehicle extensions validators
   ---------------------------------------- */

// const vehicleDocsInsertSchema = createInsertSchema(vehicle_docs, {
//   valid_from: z.date().optional(),
//   valid_to: z.date().optional(),
//   expiry_date: z.date().optional(),
// });

// export const createVehicleDocSchema = vehicleDocsInsertSchema.omit({
//   id: true,
//   ...createdUpdatedAuditFields,
// });

// export type CreateVehicleDocInput = z.infer<typeof createVehicleDocSchema>;

// export const updateVehicleDocSchema = createVehicleDocSchema
//   .partial()
//   .extend({ id: z.number().int().positive() })
//   .refine((data) => {
//     const { id: _, ...rest } = data;
//     return Object.keys(rest).length > 0;
//   }, "Provide at least one field to update.");

// export type UpdateVehicleDocInput = z.infer<typeof updateVehicleDocSchema>;

// const vehicleDocumentKindInsertSchema = createInsertSchema(
//   vehicle_document_kinds,
//   {
//     name: z.string().min(1).max(128),
//   },
// );

// export const createVehicleDocumentKindSchema =
//   vehicleDocumentKindInsertSchema.omit({
//     id: true,
//     ...createdUpdatedAuditFields,
//   });

// export type CreateVehicleDocumentKindInput = z.infer<
//   typeof createVehicleDocumentKindSchema
// >;

// export const updateVehicleDocumentKindSchema = createVehicleDocumentKindSchema
//   .partial()
//   .extend({ id: z.number().int().positive() })
//   .refine((data) => {
//     const { id: _, ...rest } = data;
//     return Object.keys(rest).length > 0;
//   }, "Provide at least one field to update.");

// export type UpdateVehicleDocumentKindInput = z.infer<
//   typeof updateVehicleDocumentKindSchema
// >;

// const vehicleTypeInsertSchema = createInsertSchema(vehicle_types, {
//   name: z.string().min(1).max(128),
// });

// export const createVehicleTypeSchema = vehicleTypeInsertSchema.omit({
//   id: true,
//   ...createdUpdatedAuditFields,
// });

// export type CreateVehicleTypeInput = z.infer<typeof createVehicleTypeSchema>;

// export const updateVehicleTypeSchema = createVehicleTypeSchema
//   .partial()
//   .extend({ id: z.number().int().positive() })
//   .refine((data) => {
//     const { id: _, ...rest } = data;
//     return Object.keys(rest).length > 0;
//   }, "Provide at least one field to update.");

// export type UpdateVehicleTypeInput = z.infer<typeof updateVehicleTypeSchema>;

// const fuelTypeInsertSchema = createInsertSchema(fuel_types, {
//   name: z.string().min(1).max(64),
// });

// export const createFuelTypeSchema = fuelTypeInsertSchema.omit({
//   id: true,
//   ...createdUpdatedAuditFields,
// });

// export type CreateFuelTypeInput = z.infer<typeof createFuelTypeSchema>;

// export const updateFuelTypeSchema = createFuelTypeSchema
//   .partial()
//   .extend({ id: z.number().int().positive() })
//   .refine((data) => {
//     const { id: _, ...rest } = data;
//     return Object.keys(rest).length > 0;
//   }, "Provide at least one field to update.");

// export type UpdateFuelTypeInput = z.infer<typeof updateFuelTypeSchema>;
