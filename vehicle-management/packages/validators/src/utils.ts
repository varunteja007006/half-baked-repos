// Common audit fields in DB use snake_case; keep centralized for omit helpers
export const createdUpdatedAuditFields = {
  created_at: true as const,
  updated_at: true as const,
  deleted_at: true as const,
  created_by: true as const,
  updated_by: true as const,
  deleted_by: true as const,
};
