/**
 * YOU PROBABLY DON'T NEED TO EDIT THIS FILE, UNLESS:
 * 1. You want to modify request context (see Part 1)
 * 2. You want to create a new middleware or type of procedure (see Part 3)
 *
 * tl;dr - this is where all the tRPC server stuff is created and plugged in.
 * The pieces you will need to use are documented accordingly near the end
 */
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { z, ZodError } from "zod";

import type { Auth } from "@fleetio/auth";
import { and, eq } from "@fleetio/db";
import { db } from "@fleetio/db/client";
import { organization_members } from "@fleetio/db/schema";

/**
 * Utility: Check if user has a specific role in an organization
 * @param userRoles Array of role objects (includes `code`)
 * @param roleCode Canonical role code to check (e.g., "admin", "finance")
 * @returns boolean
 */
const normalizeRoleCode = (code: string) => code.trim().toLowerCase();

export const hasRole = (
  userRoles: { id: number; name: string; code: string }[],
  roleCode: string,
): boolean => {
  const normalizedCode = normalizeRoleCode(roleCode);
  return userRoles.some(
    (role) => normalizeRoleCode(role.code) === normalizedCode,
  );
};

/**
 * Utility: Check if user has any of the specified roles
 * @param userRoles Array of role objects (includes `code`)
 * @param roleCodes Canonical role codes to check
 * @returns boolean
 */
export const hasAnyRole = (
  userRoles: { id: number; name: string; code: string }[],
  roleCodes: string[],
): boolean => {
  const normalizedCodes = roleCodes.map((code) => normalizeRoleCode(code));
  return userRoles.some((role) =>
    normalizedCodes.includes(normalizeRoleCode(role.code)),
  );
};

/**
 * 1. CONTEXT
 *
 * This section defines the "contexts" that are available in the backend API.
 *
 * These allow you to access things when processing a request, like the database, the session, etc.
 *
 * This helper generates the "internals" for a tRPC context. The API handler and RSC clients each
 * wrap this and provides the required context.
 *
 * @see https://trpc.io/docs/server/context
 */

export const createTRPCContext = async (opts: {
  headers: Headers;
  auth: Auth;
}) => {
  const authApi = opts.auth.api;
  const session = await authApi.getSession({
    headers: opts.headers,
  });
  return {
    authApi,
    session,
    db,
  };
};
/**
 * 2. INITIALIZATION
 *
 * This is where the trpc api is initialized, connecting the context and
 * transformer
 */
const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter: ({ shape, error }) => ({
    ...shape,
    data: {
      ...shape.data,
      zodError:
        error.cause instanceof ZodError
          ? z.flattenError(error.cause as ZodError<Record<string, unknown>>)
          : null,
    },
  }),
});

/**
 * 3. ROUTER & PROCEDURE (THE IMPORTANT BIT)
 *
 * These are the pieces you use to build your tRPC API. You should import these
 * a lot in the /src/server/api/routers folder
 */

/**
 * This is how you create new routers and subrouters in your tRPC API
 * @see https://trpc.io/docs/router
 */
export const createTRPCRouter = t.router;

/**
 * Middleware for timing procedure execution and adding an articifial delay in development.
 *
 * You can remove this if you don't like it, but it can help catch unwanted waterfalls by simulating
 * network latency that would occur in production but not in local development.
 */
const timingMiddleware = t.middleware(async ({ next, path }) => {
  const start = Date.now();

  if (t._config.isDev) {
    // artificial delay in dev 100-500ms
    const waitMs = Math.floor(Math.random() * 400) + 100;
    await new Promise((resolve) => setTimeout(resolve, waitMs));
  }

  const result = await next();

  const end = Date.now();
  console.log(`[TRPC] ${path} took ${end - start}ms to execute`);

  return result;
});

/**
 * Public (unauthed) procedure
 *
 * This is the base piece you use to build new queries and mutations on your
 * tRPC API. It does not guarantee that a user querying is authorized, but you
 * can still access user session data if they are logged in
 */
export const publicProcedure = t.procedure.use(timingMiddleware);

/**
 * Protected (authenticated) procedure
 *
 * If you want a query or mutation to ONLY be accessible to logged in users, use this. It verifies
 * the session is valid and guarantees `ctx.session.user` is not null.
 *
 * @see https://trpc.io/docs/procedures
 */
export const protectedProcedure = t.procedure
  .use(timingMiddleware)
  .use(({ ctx, next }) => {
    if (!ctx.session?.user) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    return next({
      ctx: {
        ...ctx,
        // ensure the session `user` is non-nullable for downstream code
        session: {
          ...ctx.session,
          user: ctx.session.user,
        },
      },
    });
  });

/**
 * Organization-scoped procedure
 *
 * This procedure enforces that the user is an active member of a specific organization.
 * It includes organization context and role information in the request.
 * Supports users with multiple roles within an organization.
 *
 */
export const orgScopedProcedure = protectedProcedure
  .input(z.object({ organizationId: z.number() }))
  .use(async ({ ctx, input, next }) => {
    // Verify user is an active member of this organization
    const memberRecord = await ctx.db.query.organization_members.findFirst({
      where: and(
        eq(organization_members.organization_id, input.organizationId),
        eq(organization_members.user_id, ctx.session.user.id),
        eq(organization_members.is_active, true),
      ),
      with: {
        memberRoles: {
          with: {
            role: true,
          },
        },
        organization: true,
      },
    });

    if (!memberRecord) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "User is not an active member of this organization",
      });
    }

    // Extract roles from memberRoles array
    const userRoles = memberRecord.memberRoles.map((mr) => mr.role);

    if (userRoles.length === 0) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "User has no roles assigned in this organization",
      });
    }

    return next({
      ctx: {
        ...ctx,
        organizationId: input.organizationId,
        organizationMember: memberRecord,
        userRoles: userRoles, // Array of roles, not single role
      },
    });
  });
