import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

import { fleet_sizes, payment_statuses } from "@fleetio/db/schema";

import { createdUpdatedAuditFields } from "./utils";

/* ----------------------------------------
   Payment Status validators (meta table)
   ---------------------------------------- */

const paymentStatusInsertSchema = createInsertSchema(payment_statuses, {
  code: z
    .string()
    .min(1)
    .max(64)
    .regex(/^[a-z0-9_-]+$/i, {
      message:
        "Code can only contain letters, numbers, hyphens, or underscores.",
    })
    .transform((val) => val.toUpperCase()),
  name: z.string().min(1).max(128),
});

export const createPaymentStatusSchema = paymentStatusInsertSchema.omit({
  id: true,
  ...createdUpdatedAuditFields,
});

export type CreatePaymentStatusInput = z.infer<
  typeof createPaymentStatusSchema
>;

export const updatePaymentStatusSchema = createPaymentStatusSchema
  .partial()
  .extend({ id: z.number().int().positive() })
  .refine((data) => {
    const { id: _, ...rest } = data;
    return Object.keys(rest).length > 0;
  }, "Provide at least one field to update.");

export type UpdatePaymentStatusInput = z.infer<
  typeof updatePaymentStatusSchema
>;

const fleetSizeInsertSchema = createInsertSchema(fleet_sizes, {
  code: z
    .string()
    .min(1)
    .max(64)
    .regex(/^[a-z0-9_-]+$/i, {
      message:
        "Code can only contain letters, numbers, hyphens, or underscores.",
    })
    .transform((val) => val.toUpperCase()),
  size_label: z.string().regex(/^\d+$/).transform(Number),
  description: z.string().max(256).optional(),
});

export const createFleetSizeSchema = fleetSizeInsertSchema.omit({
  id: true,
  ...createdUpdatedAuditFields,
});

export type CreateFleetSizeInput = z.infer<typeof createFleetSizeSchema>;

export const updateFleetSizeSchema = createFleetSizeSchema
  .partial()
  .extend({ id: z.number().int().positive() })
  .refine((data) => {
    const { id: _, ...rest } = data;
    return Object.keys(rest).length > 0;
  }, "Provide at least one field to update.");

export type UpdateFleetSizeInput = z.infer<typeof updateFleetSizeSchema>;
