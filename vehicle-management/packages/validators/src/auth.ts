import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

import { verification } from "@fleetio/db/schema";

const verificationInsertSchema = createInsertSchema(verification, {
  expiresAt: z.date(),
});

export const createVerificationSchema = verificationInsertSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type CreateVerificationInput = z.infer<typeof createVerificationSchema>;
