import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

import {
  diesel_logs,
  gps_pings,
  routes,
  trip_events,
  trip_exports,
  trip_file_document_types,
  trip_pass_photos,
  trip_statuses,
  trip_types,
  trips,
} from "@fleetio/db/schema";

import { createdUpdatedAuditFields } from "./utils";

/* ---- Trip-related lookups ---- */

const tripStatusInsertSchema = createInsertSchema(trip_statuses, {
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
  order: z.string().regex(/^\d+$/).transform(Number).optional(),
});

export const createTripStatusSchema = tripStatusInsertSchema.omit({
  id: true,
  ...createdUpdatedAuditFields,
});

export const updateTripStatusSchema = createTripStatusSchema
  .partial()
  .extend({ id: z.number().int().positive() })
  .refine((data) => {
    const { id: _, ...rest } = data;
    return Object.keys(rest).length > 0;
  }, "Provide at least one field to update.");

const tripFileDocumentTypeInsertSchema = createInsertSchema(
  trip_file_document_types,
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
    name: z.string().min(1).max(128),
    description: z.string().max(2000).optional(),
  },
);

export const createTripFileDocumentTypeSchema =
  tripFileDocumentTypeInsertSchema.omit({
    id: true,
    ...createdUpdatedAuditFields,
  });

export const updateTripFileDocumentTypeSchema = createTripFileDocumentTypeSchema
  .partial()
  .extend({ id: z.number().int().positive() })
  .refine((data) => {
    const { id: _, ...rest } = data;
    return Object.keys(rest).length > 0;
  }, "Provide at least one field to update.");

const tripTypeInsertSchema = createInsertSchema(trip_types, {
  code: z
    .string()
    .min(2)
    .max(64)
    .regex(/^[a-z0-9_-]+$/i, {
      message:
        "Code can only contain letters, numbers, hyphens, or underscores.",
    })
    .transform((val) => val.toUpperCase()),
  name: z.string().min(1).max(128),
  description: z.string().max(2000).optional(),
});

export const createTripTypeSchema = tripTypeInsertSchema.omit({
  id: true,
  ...createdUpdatedAuditFields,
});

export type CreateTripTypeInput = z.infer<typeof createTripTypeSchema>;

export const updateTripTypeSchema = createTripTypeSchema
  .partial()
  .extend({ id: z.number().int().positive() })
  .refine((data) => {
    const { id: _, ...rest } = data;
    return Object.keys(rest).length > 0;
  }, "Provide at least one field to update.");

export type UpdateTripTypeInput = z.infer<typeof updateTripTypeSchema>;

/* ----------------------------------------
   Trips & Routing validators
   ---------------------------------------- */

const routeInsertSchema = createInsertSchema(routes, {
  name: z.string().max(256).optional(),
  start_location: z.string().max(256).optional(),
  end_location: z.string().max(256).optional(),
});

export const createRouteSchema = routeInsertSchema.omit({
  id: true,
  ...createdUpdatedAuditFields,
});

export type CreateRouteInput = z.infer<typeof createRouteSchema>;

export const updateRouteSchema = createRouteSchema
  .partial()
  .extend({ id: z.number().int().positive() })
  .refine((data) => {
    const { id: _, ...rest } = data;
    return Object.keys(rest).length > 0;
  }, "Provide at least one field to update.");

export type UpdateRouteInput = z.infer<typeof updateRouteSchema>;

const tripInsertSchema = createInsertSchema(trips, {
  trip_ref: z.string().min(1).max(128),
  trip_date: z.date().optional(),
  planned_start: z.date().optional(),
  planned_end: z.date().optional(),
  driver_first_name: z.string().max(128).optional(),
  driver_last_name: z.string().max(128).optional(),
  touchpoint: z.string().optional(),
  cost_currency: z.string().max(8).optional(),
  notes: z.string().optional(),
});

export const createTripSchema = tripInsertSchema.omit({
  id: true,
  ...createdUpdatedAuditFields,
});

export type CreateTripInput = z.infer<typeof createTripSchema>;

export const updateTripSchema = createTripSchema
  .partial()
  .extend({ id: z.number().int().positive() })
  .refine((data) => {
    const { id: _, ...rest } = data;
    return Object.keys(rest).length > 0;
  }, "Provide at least one field to update.");

export type UpdateTripInput = z.infer<typeof updateTripSchema>;

const tripPassPhotoInsertSchema = createInsertSchema(trip_pass_photos, {
  taken_at: z.date().optional(),
  note: z.string().optional(),
});

export const createTripPassPhotoSchema = tripPassPhotoInsertSchema.omit({
  id: true,
  ...createdUpdatedAuditFields,
});

export type CreateTripPassPhotoInput = z.infer<
  typeof createTripPassPhotoSchema
>;

export const updateTripPassPhotoSchema = createTripPassPhotoSchema
  .partial()
  .extend({ id: z.number().int().positive() })
  .refine((data) => {
    const { id: _, ...rest } = data;
    return Object.keys(rest).length > 0;
  }, "Provide at least one field to update.");

export type UpdateTripPassPhotoInput = z.infer<
  typeof updateTripPassPhotoSchema
>;

const gpsPingInsertSchema = createInsertSchema(gps_pings, {
  latitude: z.string().max(64).optional(),
  longitude: z.string().max(64).optional(),
  ping_at: z.date().optional(),
});

export const createGpsPingSchema = gpsPingInsertSchema.omit({
  id: true,
  ...createdUpdatedAuditFields,
});

export type CreateGpsPingInput = z.infer<typeof createGpsPingSchema>;

const dieselLogInsertSchema = createInsertSchema(diesel_logs, {
  filled_at: z.date().optional(),
});

export const createDieselLogSchema = dieselLogInsertSchema.omit({
  id: true,
  ...createdUpdatedAuditFields,
});

export type CreateDieselLogInput = z.infer<typeof createDieselLogSchema>;

export const updateDieselLogSchema = createDieselLogSchema
  .partial()
  .extend({ id: z.number().int().positive() })
  .refine((data) => {
    const { id: _, ...rest } = data;
    return Object.keys(rest).length > 0;
  }, "Provide at least one field to update.");

export type UpdateDieselLogInput = z.infer<typeof updateDieselLogSchema>;

const tripEventInsertSchema = createInsertSchema(trip_events, {
  event_type: z.string().max(128).optional(),
  event_at: z.date().optional(),
});

export const createTripEventSchema = tripEventInsertSchema.omit({
  id: true,
  ...createdUpdatedAuditFields,
});

export type CreateTripEventInput = z.infer<typeof createTripEventSchema>;

const tripExportInsertSchema = createInsertSchema(trip_exports, {
  export_format: z.string().max(64).optional(),
  exported_at: z.date().optional(),
});

export const createTripExportSchema = tripExportInsertSchema.omit({
  id: true,
  ...createdUpdatedAuditFields,
});

export type CreateTripExportInput = z.infer<typeof createTripExportSchema>;
