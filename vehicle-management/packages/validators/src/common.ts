import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

import {
  account_types,
  approval_statuses,
  bank_account_types,
  company_types,
  lane_types,
  payment_methods,
  priority_levels,
} from "@fleetio/db/schema";

import { createdUpdatedAuditFields } from "./utils";

/* ---- Vehicle, payment, account, company, priority, approval, fuel ---- */

const paymentMethodInsertSchema = createInsertSchema(payment_methods, {
  name: z.string().min(1).max(128),
});

export const createPaymentMethodSchema = paymentMethodInsertSchema.omit({
  id: true,
  ...createdUpdatedAuditFields,
});

export type CreatePaymentMethodInput = z.infer<
  typeof createPaymentMethodSchema
>;

export const updatePaymentMethodSchema = createPaymentMethodSchema
  .partial()
  .extend({ id: z.number().int().positive() })
  .refine((data) => {
    const { id: _id, ...rest } = data;
    return Object.keys(rest).length > 0;
  }, "Provide at least one field to update.");

export type UpdatePaymentMethodInput = z.infer<
  typeof updatePaymentMethodSchema
>;

const accountTypeInsertSchema = createInsertSchema(account_types, {
  name: z.string().min(1).max(128),
});

export const createAccountTypeSchema = accountTypeInsertSchema.omit({
  id: true,
  ...createdUpdatedAuditFields,
});

export type CreateAccountTypeInput = z.infer<typeof createAccountTypeSchema>;

export const updateAccountTypeSchema = createAccountTypeSchema
  .partial()
  .extend({ id: z.number().int().positive() })
  .refine((data) => {
    const { id: _id, ...rest } = data;
    return Object.keys(rest).length > 0;
  }, "Provide at least one field to update.");

export type UpdateAccountTypeInput = z.infer<typeof updateAccountTypeSchema>;

const bankAccountTypeInsertSchema = createInsertSchema(bank_account_types, {
  name: z.string().min(1).max(128),
});

export const createBankAccountTypeSchema = bankAccountTypeInsertSchema.omit({
  id: true,
  ...createdUpdatedAuditFields,
});

export type CreateBankAccountTypeInput = z.infer<
  typeof createBankAccountTypeSchema
>;

export const updateBankAccountTypeSchema = createBankAccountTypeSchema
  .partial()
  .extend({ id: z.number().int().positive() })
  .refine((data) => {
    const { id: _id, ...rest } = data;
    return Object.keys(rest).length > 0;
  }, "Provide at least one field to update.");

export type UpdateBankAccountTypeInput = z.infer<
  typeof updateBankAccountTypeSchema
>;

const companyTypeInsertSchema = createInsertSchema(company_types, {
  name: z.string().min(1).max(128),
});

export const createCompanyTypeSchema = companyTypeInsertSchema.omit({
  id: true,
  ...createdUpdatedAuditFields,
});

export type CreateCompanyTypeInput = z.infer<typeof createCompanyTypeSchema>;

export const updateCompanyTypeSchema = createCompanyTypeSchema
  .partial()
  .extend({ id: z.number().int().positive() })
  .refine((data) => {
    const { id: _id, ...rest } = data;
    return Object.keys(rest).length > 0;
  }, "Provide at least one field to update.");

export type UpdateCompanyTypeInput = z.infer<typeof updateCompanyTypeSchema>;

const priorityLevelInsertSchema = createInsertSchema(priority_levels, {
  name: z.string().min(1).max(64),
  level: z.number().int().nonnegative().optional(),
});

export const createPriorityLevelSchema = priorityLevelInsertSchema.omit({
  id: true,
  ...createdUpdatedAuditFields,
});

export type CreatePriorityLevelInput = z.infer<
  typeof createPriorityLevelSchema
>;

export const updatePriorityLevelSchema = createPriorityLevelSchema
  .partial()
  .extend({ id: z.number().int().positive() })
  .refine((data) => {
    const { id: _id, ...rest } = data;
    return Object.keys(rest).length > 0;
  }, "Provide at least one field to update.");

export type UpdatePriorityLevelInput = z.infer<
  typeof updatePriorityLevelSchema
>;

const approvalStatusInsertSchema = createInsertSchema(approval_statuses, {
  name: z.string().min(1).max(64),
});

export const createApprovalStatusSchema = approvalStatusInsertSchema.omit({
  id: true,
  ...createdUpdatedAuditFields,
});

export type CreateApprovalStatusInput = z.infer<
  typeof createApprovalStatusSchema
>;

export const updateApprovalStatusSchema = createApprovalStatusSchema
  .partial()
  .extend({ id: z.number().int().positive() })
  .refine((data) => {
    const { id: _id, ...rest } = data;
    return Object.keys(rest).length > 0;
  }, "Provide at least one field to update.");

export type UpdateApprovalStatusInput = z.infer<
  typeof updateApprovalStatusSchema
>;

/* ---- Lane types & fleet sizes ---- */

const laneTypeInsertSchema = createInsertSchema(lane_types, {
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
  description: z.string().max(2000).optional(),
});

export const createLaneTypeSchema = laneTypeInsertSchema.omit({
  id: true,
  ...createdUpdatedAuditFields,
});

export type CreateLaneTypeInput = z.infer<typeof createLaneTypeSchema>;

export const updateLaneTypeSchema = createLaneTypeSchema
  .partial()
  .extend({ id: z.number().int().positive() })
  .refine((data) => {
    const { id: _id, ...rest } = data;
    return Object.keys(rest).length > 0;
  }, "Provide at least one field to update.");

export type UpdateLaneTypeInput = z.infer<typeof updateLaneTypeSchema>;
