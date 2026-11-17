import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

import { companies } from "@fleetio/db/schema";

import { createdUpdatedAuditFields } from "./utils";

/* ----------------------------------------
   Company validators
   ---------------------------------------- */

const companyInsertSchema = createInsertSchema(companies, {
  organization_id: z.number().int().positive(),
  type_id: z.number().int().positive(),
  name: z.string().min(1).max(256),
  incorporation_name: z.string().max(256).optional(),
  incorporation_address: z.string().optional(),
  gstin: z.string().max(32).optional(),
  state_code: z.string().max(8).optional(),
  hsn_code: z.string().max(32).optional(),
  address: z.string().optional(),
});

export const createCompanySchema = companyInsertSchema.omit({
  id: true,
  ...createdUpdatedAuditFields,
});

export type CreateCompanyInput = z.infer<typeof createCompanySchema>;

export const updateCompanySchema = createCompanySchema
  .partial()
  .extend({ id: z.number().int().positive() });
// ? Skipped for now
// At least one field other than id must be provided
// .refine((data) => {
//   const { id: _, ...rest } = data;
//   return Object.keys(rest).length > 0;
// }, "Provide at least one field to update.");

export type UpdateCompanyInput = z.infer<typeof updateCompanySchema>;
