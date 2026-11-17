import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

import { roles } from "@fleetio/db/schema";

const roleInsertSchema = createInsertSchema(roles, {
  code: z
    .string()
    .min(2)
    .max(64)
    .regex(/^[a-z0-9_-]+$/i, {
      message:
        "Code can only contain letters, numbers, hyphens, or underscores.",
    }),
  name: z.string().min(2).max(128),
  description: z.string().max(2000).optional(),
  imageUrl: z.url().max(512).optional(),
});

export const createRoleSchema = roleInsertSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
  deleted_at: true,
  created_by: true,
  updated_by: true,
  deleted_by: true,
});

export const updateRoleSchema = createRoleSchema
  .partial()
  .extend({
    id: z.number().int().positive(),
  })
  .refine((data) => {
    const { id: _id, ...rest } = data;
    return Object.keys(rest).length > 0;
  }, "Provide at least one field to update.");

export const roleIdSchema = z.object({
  id: z.number().int().positive(),
});
