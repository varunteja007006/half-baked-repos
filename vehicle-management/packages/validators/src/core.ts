import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

import { cron_jobs, files, payments } from "@fleetio/db/schema";

import { createdUpdatedAuditFields } from "./utils";

const fileInsertSchema = createInsertSchema(files, {
  key: z.string().min(1).max(512),
  filename: z.string().max(512).optional(),
  mime_type: z.string().max(128).optional(),
  bucket: z.string().max(128).optional(),
  metadata: z.record(z.any(), z.any()).optional().nullable(),
  expiry_date: z.date().optional(),
});

export const createFileSchema = fileInsertSchema.omit({
  id: true,
  ...createdUpdatedAuditFields,
});

export type CreateFileInput = z.infer<typeof createFileSchema>;

export const updateFileSchema = createFileSchema
  .partial()
  .extend({ id: z.number().int().positive() })
  .refine((data) => {
    const { id: _, ...rest } = data;
    return Object.keys(rest).length > 0;
  }, "Provide at least one field to update.");

export type UpdateFileInput = z.infer<typeof updateFileSchema>;

const paymentInsertSchema = createInsertSchema(payments, {
  amount: z.number().int().positive(),
  currency: z.string().max(8).optional(),
  metadata: z.record(z.any(), z.any()).optional().nullable(),
  paid_at: z.date().optional(),
});

export const createPaymentSchema = paymentInsertSchema.omit({
  id: true,
  ...createdUpdatedAuditFields,
});

export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;

export const updatePaymentSchema = createPaymentSchema
  .partial()
  .extend({ id: z.number().int().positive() })
  .refine((data) => {
    const { id: _, ...rest } = data;
    return Object.keys(rest).length > 0;
  }, "Provide at least one field to update.");

export type UpdatePaymentInput = z.infer<typeof updatePaymentSchema>;
