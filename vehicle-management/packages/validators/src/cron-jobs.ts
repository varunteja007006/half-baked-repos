import { createInsertSchema } from "drizzle-zod";
import z from "zod";

import { cron_jobs } from "@fleetio/db/schema";

import { createdUpdatedAuditFields } from "./utils";

const cronJobInsertSchema = createInsertSchema(cron_jobs, {
  name: z.string().min(1).max(256),
  cron_expr: z.string().min(1).max(128),
  timezone: z.string().max(64).optional(),
  description: z.string().optional(),
  payload: z.record(z.any(), z.any()).optional().nullable(),
});

export const createCronJobSchema = cronJobInsertSchema.omit({
  id: true,
  next_run_at: true,
  last_run_at: true,
  last_duration_ms: true,
  last_status: true,
  attempt_count: true,
  locked_at: true,
  locked_by: true,
  run_count: true,
  last_error: true,
  last_result: true,
  ...createdUpdatedAuditFields,
});

export type CreateCronJobInput = z.infer<typeof createCronJobSchema>;

export const updateCronJobSchema = createCronJobSchema
  .partial()
  .extend({ id: z.number().int().positive() })
  .refine((data) => {
    const { id: _, ...rest } = data;
    return Object.keys(rest).length > 0;
  }, "Provide at least one field to update.");

export type UpdateCronJobInput = z.infer<typeof updateCronJobSchema>;
