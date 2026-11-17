import z from "zod";

export const paginateZodSchema = z.object({
  currentPage: z.number().int().min(1).default(1),
  itemsPerPage: z.number().int().min(1).max(100).default(10),
  search: z.string().optional().nullable().optional(),

  // sortBy as [field, direction], multiple allowed
  sortBy: z.array(z.tuple([z.string(), z.enum(["asc", "desc"])])).optional(),

  // simple filters; you can extend to typed fields
  filters: z
    .object({
      isActive: z.boolean().optional(),
    })
    .optional(),
});
