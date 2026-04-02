# Agent Guidelines

## Essentials

- **Stack**: TypeScript + React (TanStack Start), Drizzle ORM, PostgreSQL, shadcn/ui, Tailwind CSS v4, Better Auth
- **Add UI components**: `pnpm ui add <component>` (shadcn CLI)
- **Icons**: Use `lucide-react` (e.g., `import { Loader2Icon } from "lucide-react"`); brand icons via `@icons-pack/react-simple-icons` (e.g., `SiGithub`)
- **Don't build after every change**. If `pnpm lint` passes, assume changes work.

## Commands

```bash
# Development
pnpm dev              # Start dev server (watch mode)

# Build & Production
pnpm build           # Production build
pnpm start           # Run production server

# Lint & Format
pnpm lint            # Type-aware linting (oxlint --type-aware --type-check)
pnpm lint:fix        # Auto-fix lint issues
pnpm format          # Format code (oxfmt)
pnpm format:check    # Check formatting without modifying
pnpm check           # Run format + lint

# Database (Drizzle)
pnpm db generate     # Generate migrations
pnpm db migrate      # Apply migrations
pnpm db studio       # Open Drizzle Studio

# TanStack CLI
pnpm tanstack doc <query>  # Fetch TanStack docs (e.g., pnpm tanstack doc router guide)

# Other
pnpm ui              # shadcn UI CLI
pnpm auth            # Better Auth CLI
pnpm auth:secret     # Generate auth secret
pnpm auth:migrate    # Generate auth schema + migrate
```

## Code Style

### Formatting (oxfmt)

- **Tab width**: 2 spaces
- **Semicolons**: Yes
- **Print width**: 100 characters
- **Quotes**: Double quotes
- **Trailing commas**: All
- **End of line**: LF

Formatting runs automatically on commit via Husky. Manual formatting not required.

### Naming Conventions

| Type                | Convention           | Example                            |
| ------------------- | -------------------- | ---------------------------------- |
| Variables/functions | camelCase            | `getUserData`, `isLoading`         |
| Components          | PascalCase           | `UserProfile`, `SignInForm`        |
| Routes              | kebab-case (URLs)    | `/user-profile`, `/api/auth`       |
| Types/interfaces    | PascalCase           | `AuthQueryResult`, `UserData`      |
| Constants           | SCREAMING_SNAKE_CASE | `MAX_RETRY_COUNT`, `API_BASE_URL`  |
| Files (components)  | PascalCase           | `UserCard.tsx`                     |
| Files (utilities)   | kebab-case           | `auth-utils.ts`, `date-helpers.ts` |
| Server functions    | Prefix with `$`      | `$getUser`, `$createPost`          |

### TypeScript Rules

- **Never use type casting** (`as`, `<Type>`, `satisfies`) unless absolutely necessary
- **Prefer type inference** from schema validation (Zod), function return types, or API definitions
- **Generic type parameters** must be prefixed with `T`: `<TData, TError, TArgs extends unknown[]>`

```typescript
// Bad
const result = api.getData() as MyType;
function process<T>(data: T) { ... }

// Good
const result = api.getData();
function process<TData>(data: TData) { ... }
```

### Imports

- **Path aliases**: Use `@/` for src root (e.g., `@/components`, `@/lib/auth`)
- **Group imports**: External → Internal → Relative (enforced by oxfmt)
- **Type imports**: Use `import type` when importing only types
- **Server-only code**: Place in `*.server.ts` files or inside `createServerFn` handlers

```typescript
// Good import order
import React from "react"; // external
import { createFileRoute } from "@tanstack/react-router"; // external (ordered)
import { authQueryOptions } from "@/lib/auth/queries"; // internal (alias)
import type { User } from "./types"; // relative
import { formatDate } from "./utils"; // relative
```

### React Patterns

- **Components**: Use function components with explicit prop types
- **Hooks**: Follow React hooks rules; prefer `use` prefix for custom hooks
- **Avoid side effects in render**: No `setState` in component body
- **Server functions**: Prefix with `$`, import statically (never dynamic imports)

```typescript
// Server function pattern
import { createServerFn } from "@tanstack/react-start";

const $getTodos = createServerFn({ method: "GET" }, async () => {
  "use server";
  return db.select().from(todos);
});
```

### Error Handling

- Use `try/catch` for async operations with meaningful error types
- Throw `redirect()` from TanStack Router for navigation
- Use `Result` types or discriminated unions for expected failures
- Log errors appropriately; never expose internals to client

## Architecture

### Route Groups

- `src/routes/_auth/**` - Protected routes (require auth via `beforeLoad`)
- `src/routes/_guest/**` - Guest-only routes (redirect if authenticated)
- `src/routes/api/**` - API routes for server functions

### Data Fetching

- **Loaders** run on both server and client (isomorphic)
- **Prefer TanStack Query** wrapping for server functions in loaders:
  ```typescript
  loader: async ({ context }) => {
    return { todos: await context.queryClient.ensureQueryData(todosQueryOptions()) };
  };
  ```
- **Server-only code** (db, fs) must be in `*.server.ts` files or inside `createServerFn`

### Auth

- Auth config: `src/lib/auth/auth.ts`
- Use `useAuth`/`useAuthSuspense` hooks from `src/lib/auth/hooks.ts`
- Protected routes return `{ user }` via router context
- Server functions requiring auth must use `authMiddleware` from `@/lib/auth/middleware`

## Database (Drizzle)

- Schema files in `src/lib/db/schema/`
- Auth schema auto-generated; don't edit directly
- Use `pnpm db generate` after schema changes
- Use `pnpm db migrate` to apply migrations

## Linting

- **Type-aware linting** is enabled (`--type-aware --type-check`)
- React hooks rules enforce: purity, no side effects in render, proper memoization
- TanStack rules enforce: query/mutation property order, exhaustive deps
- Fix with `pnpm lint:fix` when possible

## Path Aliases

```typescript
// tsconfig.json paths
"@/*": ["./src/*"]
```

| Alias          | Resolution       |
| -------------- | ---------------- |
| `@/components` | `src/components` |
| `@/lib`        | `src/lib`        |
| `@/routes`     | `src/routes`     |
| `@/env`        | `src/env`        |
