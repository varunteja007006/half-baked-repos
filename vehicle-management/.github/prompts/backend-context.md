# Backend Context

## Architecture

### tRPC API (`@fleetio/api`)

- **Type**: End-to-end type-safe API with tRPC v11
- **Context**: `{ authApi, session, db }` - Available in all procedures
- **Transformer**: SuperJSON for Date/Map/Set serialization

### Procedures

1. **publicProcedure** - No auth required, `ctx.session` may be null
2. **protectedProcedure** - Requires valid session, `ctx.session.user` guaranteed
3. **orgScopedProcedure** - Extends protected with org membership check
   - Input: `{ organizationId: number }`
   - Context adds: `organizationId`, `organizationMember`, `userRoles[]`

### Role Utilities

- `hasRole(userRoles, "admin")` - Check single role
- `hasAnyRole(userRoles, ["admin", "finance"])` - Check multiple roles

## Database Schema (`@fleetio/db`)

### Core Entities

- **organizations** - Multi-tenant root (slug, ownerId, tier, status)
- **app_users** - User profiles (extends Better Auth `user`)
- **organization_members** - User-org junction with role assignments
- **roles** - System roles with permissions (code: admin, finance, driver, etc.)

### Domain Schemas

- **vehicles** - Fleet tracking (manufacturers, models, documents)
- **trips** - Route management (routes, trips, statuses, files)
- **payments** - Financial transactions (amount, method, status)
- **companies** - Client companies (linked to organizations)
- **files** - Document storage (S3/Cloudinary URLs)

### Patterns

- All org-scoped tables have `organizationId` FK → `organizations.id` (cascade delete)
- Audit fields: `createdAt`, `updatedAt`, `createdBy`, `updatedBy`, `deletedAt`
- Snake_case DB, camelCase TypeScript

## Routers

| Router               | Procedures                      | Purpose                      |
| -------------------- | ------------------------------- | ---------------------------- |
| `auth`               | session mgmt                    | Better Auth integration      |
| `organization`       | create, list                    | Org CRUD                     |
| `organizationMember` | onboard                         | Add users to orgs with roles |
| `user`               | listUsers                       | User management              |
| `vehicle`            | manufacturers, models, vehicles | Fleet management             |
| `company`            | CRUD                            | Client companies             |
| `meta`               | statuses, types                 | Reference data               |
| `role`               | list, permissions               | Role management              |

## Validation (`@fleetio/validators`)

- Built with `drizzle-zod` helpers from DB schemas
- Import shared validators: `createOrganizationInputSchema`, etc.
- Use `.input(schema)` on procedures

## Best Practices

1. **Never query across orgs** - Always filter by `organizationId`
2. **Use orgScopedProcedure** for tenant-isolated operations
3. **Leverage Drizzle relations** - Use `.with()` for joins
4. **Error handling** - tRPC auto-formats ZodError as `flattenError`
5. **Audit trails** - Set `createdBy`/`updatedBy` to `ctx.session.user.id`

## Example: Create Vehicle (Org-Scoped)

```ts
createVehicle: orgScopedProcedure
  .input(createVehicleSchema)
  .mutation(async ({ ctx, input }) => {
    const { organizationId, session } = ctx;
    return ctx.db
      .insert(vehicles)
      .values({
        ...input,
        organizationId,
        createdBy: session.user.id,
      })
      .returning();
  });
```
