# Copilot Instructions for Vehicle Management (Fleetio)

## Project Overview

**Fleetio** is a vehicle fleet management system built as a **Turborepo monorepo** with full-stack type safety. It enables companies to manage vehicles, track trips, handle payments, and authenticate users across web (Next.js) and mobile (Expo React Native) platforms.

### Tech Stack

- **Monorepo**: Turborepo with pnpm workspaces
- **Web App**: Next.js 15 + React 19 + Tailwind CSS v4
- **Mobile App**: Expo (React Native 0.81)
- **Backend**: tRPC v11 for end-to-end type-safe API
- **Database**: PostgreSQL with Drizzle ORM (Supabase)
- **Auth**: Better Auth 1.4.0-beta.9 with OAuth (Discord, Google)
- **Validation**: Zod v4
- **UI Components**: shadcn/ui
- **Package Naming**: `@fleetio/` namespace (replace `@acme`)

## Architecture Overview

### Monorepo Structure

```
apps/
  ├─ nextjs/         # Web application (main UI)
  ├─ expo/           # React Native mobile app
packages/
  ├─ api/            # tRPC router & procedures (backend logic)
  ├─ auth/           # Better Auth configuration & OAuth setup
  ├─ db/             # Drizzle ORM schemas + database client
  ├─ ui/             # Shared shadcn/ui components
  ├─ validators/     # Zod schemas (shared validation)
  ├─ redis/          # Redis client (planned: Valkey integration)
  └─ custom-config/  # Branding & app constants
tooling/
  ├─ eslint/         # Shared ESLint configs (base, nextjs, react)
  ├─ prettier/       # Shared Prettier config
  ├─ tailwind/       # Shared Tailwind theme & PostCSS
  └─ typescript/     # Shared TypeScript configs
```

### Critical Service Boundaries

1. **tRPC API Layer** (`packages/api/`)

- All backend logic flows through tRPC routers (auth, user, organization, organization-member, future routes)
- Procedures use `publicProcedure` (unauthenticated) or `protectedProcedure` (requires session)
- Context includes session, auth API, and database client
- Type-safe client generated automatically for web/mobile apps

2. **Database Layer** (`packages/db/`)
   - 13 domain-specific schemas (vehicles, trips, payments, users, auth, etc.)
   - Drizzle ORM with PostgreSQL dialect (snake_case naming)
   - Non-pooling URL required for edge deployments: `POSTGRES_URL.replace(":6543", ":5432")`
   - Auto-generated `auth-schema.ts` from Better Auth CLI

3. **Authentication** (`packages/auth/`)
   - Better Auth configuration with Drizzle adapter
   - OAuth providers: Discord, Google
   - oAuthProxy plugin for Expo/mobile OAuth flows
   - **Critical**: Schema generation requires `pnpm auth:generate` before running

4. **Environment Management**
   - Turborepo `globalEnv` includes: `POSTGRES_URL`, `AUTH_*` secrets, `GOOGLE_CLIENT_*`, `TWILIO_*`
   - Each app validates env via `env.ts` using t3-env
   - Never access `process.env` directly — import from `~/env` or respective package env files

## Developer Workflows

### Setup & Initialization

```bash
# Install all dependencies
pnpm i

# Configure environment (.env.example as template)
cp .env.example .env

# Generate Better Auth schema (REQUIRED first)
pnpm auth:generate

# Push database schema to Postgres
pnpm db:push
```

### Local Development

```bash
# Watch mode for all packages (recommended)
pnpm dev

# Web-only development (Next.js)
pnpm dev:next

# Database studio (Drizzle UI at localhost:5555)
pnpm db:studio

# Add UI components from shadcn/ui
pnpm ui-add
```

### Code Quality

```bash
# Format all code
pnpm format:fix

# Lint with ESLint
pnpm lint:fix

# TypeScript type checking
pnpm typecheck

# Workspace integrity check (catches missing/duplicate deps)
pnpm lint:ws
```

### Build & Deployment

```bash
# Build all packages
pnpm build

# Clean everything (remove build artifacts)
pnpm clean:workspaces

# Rebuild specific app (e.g., for Vercel)
pnpm --filter @fleetio/nextjs build
```

## Project-Specific Conventions

### Package Organization

- **Shared packages** are workspace dependencies: import from `@fleetio/package-name`
- All packages extend shared configs from `tooling/` (ESLint, Prettier, TypeScript, Tailwind)
- Each package exports from `src/index.ts` with typed exports

### tRPC Procedures

- **publicProcedure**: Available without authentication, but can access `ctx.session` if logged in
- **protectedProcedure**: Throws `UNAUTHORIZED` if no valid session
- **Input validation**: Import shared schemas from `@fleetio/validators` (built via `drizzle-zod` helpers against the DB tables)
- **Error handling**: tRPC automatically catches ZodError and returns flattened error details

**Example from `packages/api/src/router/user-router.ts`**:

```typescript
export const userRouter = {
  listUsers: protectedProcedure
    .input(paginateZodSchema)
    .query(async ({ input, ctx }) => {
      const { db } = ctx;
      // Query logic here
      return { data: users, meta };
    }),
};
```

### Database Queries

- Use Drizzle query builder (imported from `@fleetio/db`)
- Snake_case column names in database, camelCase in TypeScript types
- Import schema exports from `@fleetio/db/schema`
- Example: `db.query.user.findMany()`, `db.select().from(vehicles)`

### Environment Variables

- **Never hardcode secrets** — define in `.env` and validate via `env.ts`
- **Auth secrets** (e.g., `AUTH_DISCORD_ID`): Added in Turborepo `globalEnv`
- **Production check**: Use `process.env.NODE_ENV` (validated by t3-env)

### Validation Patterns

- **Input validation**: Feed schemas from `@fleetio/validators` (kept in sync with Drizzle models via `drizzle-zod`) into `.input(zodSchema)`
- **Database validation**: Leverage Drizzle NOT NULL, UNIQUE, constraints
- **Client-side**: Import the same shared validators from `@fleetio/validators` for forms and client-side guards

### Asset & Component Organization

- **UI Components**: Export from `packages/ui/src/*.tsx` (shadcn/ui based)
- **App-specific components**: Keep in `apps/{nextjs,expo}/src/components/`
- **Styles**: Tailwind CSS v4 with shared theme in `tooling/tailwind/theme.css`
- **Constants/Branding**: Import from `@fleetio/custom-config`

## Critical Integration Points

### OAuth & Authentication Flow

1. **Development**: Use auth proxy plugin in Next.js (deployed to Vercel)
2. **Expo/Mobile**: Redirect via proxy for OAuth callbacks (avoids localhost issues)
3. **Production**: Expo app redirects to production backend URL
4. **Schema**: Generated schema must be synced after auth config changes via `pnpm auth:generate`

### Type Safety Across Apps

- tRPC exports `AppRouter` type from `@fleetio/api`
- Web app: Uses tRPC React Query client in `apps/nextjs/src/trpc/react.tsx`
- Mobile app: Uses tRPC Expo client (same type signatures as web)
- **Never cast types manually** — let tRPC inference handle it

### Database Edge Constraints

- **Vercel Postgres Edge**: Uses non-pooling URL (port 5432)
- Configuration in `packages/db/drizzle.config.ts`
- If switching databases: Update schema imports and adapter in `packages/auth/src/index.ts`

## Common Development Patterns

### Adding a New tRPC Route

1. Create file in `packages/api/src/router/my-router.ts`
2. Import `createTRPCRouter`, `publicProcedure`, or `protectedProcedure`
3. Define input using a schema exported from `@fleetio/validators` (add it there with `drizzle-zod` helpers if it maps to a table)
4. Add to root router in `packages/api/src/root.ts`
5. Router automatically type-safe in all apps

### Adding Database Schema

1. Create new schema file in `packages/db/src/{domain}-schema.ts`
2. Export from `packages/db/src/schema.ts`
3. Run `pnpm db:push` to migrate
4. Import types in tRPC procedures via `@fleetio/db`

### Adding Shared Validators

1. Derive schemas with `drizzle-zod` (e.g., `createInsertSchema(organizations, overrides)`) in `packages/validators/src/index.ts`
2. Export named schema
3. Import in tRPC inputs or clients: `import { mySchema } from "@fleetio/validators"`

### Adding UI Component

1. Run `pnpm ui-add` (interactive shadcn/ui installer)
2. Select component(s) to install
3. Components added to `packages/ui/src/{component-name}.tsx`
4. Import in apps: `import { Button } from "@fleetio/ui/button"`

## Key Files & Their Roles

| File                                                    | Purpose                                            |
| ------------------------------------------------------- | -------------------------------------------------- |
| `packages/api/src/trpc.ts`                              | tRPC initialization, context, procedures           |
| `packages/auth/src/index.ts`                            | Better Auth config (OAuth, adapters)               |
| `packages/db/src/schema.ts`                             | Database schema exports                            |
| `packages/db/drizzle.config.ts`                         | Drizzle migrations config                          |
| `apps/nextjs/src/env.ts`                                | Environment validation (t3-env)                    |
| `tooling/eslint/base.ts`                                | Base ESLint rules (env.ts access restriction)      |
| `pnpm-workspace.yaml`                                   | Workspace config + dependency catalog              |
| `turbo.json`                                            | Task definitions, caching, env vars                |
| `packages/api/src/router/organization-router.ts`        | Organization creation & shared validator usage     |
| `packages/api/src/router/organization-member-router.ts` | Onboard org members (user/app profile/member rows) |

## Troubleshooting

**"Cannot find module '@fleetio/...'"**

- Run `pnpm i` to ensure all workspaces installed
- Check package is exported in its `src/index.ts`

**"Auth schema out of sync"**

- Run `pnpm auth:generate` after modifying `packages/auth/src/index.ts`

**"Database connection fails"**

- Verify `POSTGRES_URL` in `.env` uses non-pooling URL (port 5432)
- Run `pnpm db:push` to ensure schema exists

**"tRPC type errors in client"**

- Clear `.turbo` cache: `pnpm clean`
- Rebuild API: `pnpm --filter @fleetio/api build`

## Next Steps for Contributors

- **Recommended starting point**: Read `packages/api/src/trpc.ts` to understand procedure patterns
- **Database structure**: Review `packages/db/src/schema.ts` and `vehicles-schema.ts` for domain models
- **See examples**: Check `packages/api/src/router/user-router.ts` for pagination patterns, `packages/api/src/router/organization-router.ts` for validator-driven mutations, and `packages/api/src/router/organization-member-router.ts` for multi-table onboarding flows

---

_Last updated: December 2025_
