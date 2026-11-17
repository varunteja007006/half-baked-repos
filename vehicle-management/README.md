# Vehicle Management

A work-in-progress fleet management app for organizations to manage vehicles, trips, and members.

## Apps and packages

- `apps/nextjs` — web app
- `apps/expo` — mobile app for Android and iOS
- `packages/api` — tRPC API
- `packages/db` — Drizzle schemas and PostgreSQL access
- `packages/auth` — authentication
- `packages/ui` — shared UI components

Built with Next.js, Expo/React Native, TypeScript, tRPC, Drizzle, PostgreSQL, Better Auth, and Turborepo.

## Development

Requirements: Node.js 22.21+ and pnpm 10.27+.

1. Install dependencies: `pnpm install`
2. Copy `.env.example` to `.env` and set the database URL, auth secret, and Twilio credentials.
3. Apply the database schema: `pnpm db:push`
4. Start the apps: `pnpm dev`

Use `pnpm dev:next` to start only the Next.js app.
