import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

import {
  user_bank_details,
  user_docs,
  user_document_kinds,
} from "@fleetio/db/schema";

import { createdUpdatedAuditFields } from "./utils";

/* ----------------------------------------
   User extensions validators
   ---------------------------------------- */

const userBankDetailsInsertSchema = createInsertSchema(user_bank_details, {
  account_holder: z.string().max(256).optional(),
  account_number: z.string().max(64).optional(),
  ifsc: z.string().max(32).optional(),
  bank_name: z.string().max(128).optional(),
  branch_name: z.string().max(128).optional(),
});

export const createUserBankDetailsSchema = userBankDetailsInsertSchema.omit({
  id: true,
  ...createdUpdatedAuditFields,
});

export type CreateUserBankDetailsInput = z.infer<
  typeof createUserBankDetailsSchema
>;

export const updateUserBankDetailsSchema = createUserBankDetailsSchema
  .partial()
  .extend({ id: z.number().int().positive() })
  .refine((data) => {
    const { id: _, ...rest } = data;
    return Object.keys(rest).length > 0;
  }, "Provide at least one field to update.");

export type UpdateUserBankDetailsInput = z.infer<
  typeof updateUserBankDetailsSchema
>;

const userDocsInsertSchema = createInsertSchema(user_docs, {
  valid_from: z.date().optional(),
  valid_to: z.date().optional(),
  expiry_date: z.date().optional(),
});

export const createUserDocSchema = userDocsInsertSchema.omit({
  id: true,
  ...createdUpdatedAuditFields,
});

export type CreateUserDocInput = z.infer<typeof createUserDocSchema>;

export const updateUserDocSchema = createUserDocSchema
  .partial()
  .extend({ id: z.number().int().positive() })
  .refine((data) => {
    const { id: _, ...rest } = data;
    return Object.keys(rest).length > 0;
  }, "Provide at least one field to update.");

export type UpdateUserDocInput = z.infer<typeof updateUserDocSchema>;

/* ---- User & vehicle document kinds ---- */

const userDocumentKindInsertSchema = createInsertSchema(user_document_kinds, {
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

export const createUserDocumentKindSchema = userDocumentKindInsertSchema.omit({
  id: true,
  ...createdUpdatedAuditFields,
});

export type CreateUserDocumentKindInput = z.infer<
  typeof createUserDocumentKindSchema
>;

export const updateUserDocumentKindSchema = createUserDocumentKindSchema
  .partial()
  .extend({ id: z.number().int().positive() })
  .refine((data) => {
    const { id: _, ...rest } = data;
    return Object.keys(rest).length > 0;
  }, "Provide at least one field to update.");

export type UpdateUserDocumentKindInput = z.infer<
  typeof updateUserDocumentKindSchema
>;
