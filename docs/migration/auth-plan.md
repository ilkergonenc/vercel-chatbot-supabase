# Supabase Auth migration plan

Do not implement auth changes until Phase 4. Auth changes must not be combined with provider, DB connection, or storage migration work.

## Current Auth.js files and flow

- `app/(auth)/auth.ts`
  - Configures NextAuth v5.
  - Adds credentials provider for email/password users.
  - Adds `guest` credentials provider.
  - Exposes `auth`, `signIn`, `signOut`, and route handlers.
  - Extends session and JWT types with `user.id` and `user.type`.
- `app/(auth)/auth.config.ts`
  - Sets `basePath`, custom pages, and `trustHost`.
- `app/(auth)/actions.ts`
  - Implements login and register server actions.
  - Uses `getUser`, `createUser`, and `signIn`.
- `app/(auth)/api/auth/[...nextauth]/route.ts`
  - Exposes NextAuth route handlers.
- `app/(auth)/api/auth/guest/route.ts`
  - Creates or uses guest session through `signIn("guest")`.
- `proxy.ts`
  - Uses `getToken` from `next-auth/jwt`.
  - Redirects unauthenticated requests to `/api/auth/guest`.
- `app/layout.tsx`
  - Wraps UI with `SessionProvider`.
- `app/(chat)/layout.tsx`
  - Calls `auth()` and passes `session.user` into the sidebar.

## Current guest flow

1. Request enters `proxy.ts`.
2. If no NextAuth JWT exists, the request redirects to `/api/auth/guest`.
3. Guest route calls `signIn("guest")`.
4. Guest provider calls `createGuestUser()`.
5. `createGuestUser()` inserts a new row in `"User"` with email like `guest-<timestamp>`.
6. Session contains `user.type = "guest"`.
7. UI treats emails matching `guestRegex` as guests.

Risk: this can create many app-owned guest users, and guest ownership is tied to the session cookie.

## Current session shape

Server and client code expects:

```ts
{
  user: {
    id: string;
    email?: string | null;
    type: "guest" | "regular";
  }
}
```

Preserve this shape with a local adapter during migration.

## Auth access points found

Server routes and actions:

- `app/(chat)/api/chat/route.ts`
- `app/(chat)/api/history/route.ts`
- `app/(chat)/api/messages/route.ts`
- `app/(chat)/api/vote/route.ts`
- `app/(chat)/api/document/route.ts`
- `app/(chat)/api/suggestions/route.ts`
- `app/(chat)/api/files/upload/route.ts`
- `app/(chat)/actions.ts`
- `app/(chat)/layout.tsx`

AI and artifact helpers:

- `lib/artifacts/server.ts`
- `lib/ai/tools/create-document.ts`
- `lib/ai/tools/edit-document.ts`
- `lib/ai/tools/update-document.ts`
- `lib/ai/tools/request-suggestions.ts`
- `lib/ai/entitlements.ts`

Client components:

- `app/(auth)/login/page.tsx`
- `app/(auth)/register/page.tsx`
- `components/chat/sidebar-user-nav.tsx`
- `components/chat/app-sidebar.tsx`
- `components/chat/sidebar-history.tsx`
- `components/chat/sign-out-form.tsx`

Auth utilities and constants:

- `lib/constants.ts` contains `guestRegex` and `DUMMY_PASSWORD`.
- `lib/db/queries.ts` contains `getUser`, `createUser`, and `createGuestUser`.
- `lib/db/utils.ts` hashes passwords for current credentials auth.

## Supabase Auth replacement strategy

- Add Supabase SSR helpers in a new `lib/supabase` area.
- Create one app-specific auth helper that returns the current session shape.
- Keep route handlers using a single helper rather than raw Supabase calls everywhere.
- Replace Auth.js login/register actions with Supabase email/password actions.
- Keep the app-owned `User` table as a profile/ownership table.
- After Supabase sign-up, ensure a matching app profile row exists.
- During sign-in, fetch or create the app profile row for the Supabase user.

## Server-side auth strategy with Next.js App Router

- Use `@supabase/ssr` server client with `cookies()` in route handlers and server components.
- Middleware/proxy should refresh Supabase auth cookies and redirect based on session state.
- Do not use service role for normal user session reads.
- Create a helper like `getCurrentSession()` that:
  - Reads the Supabase user.
  - Loads the app profile row from `"User"`.
  - Returns `{ user: { id, email, type } }`.

## Client-side auth strategy

- Replace `SessionProvider` with either:
  - a small local provider that subscribes to Supabase auth state, or
  - server-provided user props plus targeted client sign-out handling.
- Replace `useSession()` calls in auth pages and sidebar.
- Replace `signOut()` calls with Supabase client sign-out or a server action.
- Preserve loading behavior where the sidebar currently waits for session state.

## Middleware/proxy changes

- Replace `getToken` with Supabase session/cookie handling.
- Keep `/ping` behavior.
- Exclude Supabase auth callback routes if introduced.
- Avoid redirect loops between `/login`, `/register`, guest creation, and root.
- Decide whether unauthenticated visitors should be auto-anonymous or redirected.

## User ID mapping strategy

Recommended target:

- Supabase `auth.users.id` becomes the app user/profile ID.
- `"Chat"."userId"`, `"Document"."userId"`, and `"Suggestion"."userId"` continue to point to the app `User.id`.
- Existing user migration should preserve or map old IDs before production cutover.

Do not casually regenerate user IDs. Chat ownership depends on stable IDs.

## Anonymous user options

Option A: Supabase anonymous auth

- Closest to an auth-system-native anonymous identity.
- Requires Supabase anonymous sign-ins to be enabled.
- Needs app profile row creation for anonymous users.
- Must decide how anonymous users upgrade to regular accounts.

Option B: Preserve app guest route behavior

- Keep an endpoint that creates a guest-like Supabase user/session.
- More custom code.
- May need admin APIs and careful cookie/session creation.

Option C: Remove automatic guest access

- Simplifies auth.
- Changes current UX and is not recommended for this migration unless explicitly chosen.

## Risks around chat ownership and existing users

- Existing `"User"` rows have bcrypt passwords that Supabase Auth will not automatically know.
- Existing chats/documents reference existing `User.id` values.
- Supabase Auth users have separate IDs unless migration preserves them.
- Anonymous session upgrade can orphan guest chats if not designed.
- Middleware mistakes can make all API routes unauthorized or cause redirects.

## Recommended staged implementation

1. Add Supabase helpers and local session type without switching routes.
2. Add profile helper functions around `"User"`.
3. Replace login/register actions in isolation.
4. Replace server `auth()` access points with the local session helper.
5. Replace client session provider and sign-out behavior.
6. Replace proxy/middleware.
7. Implement guest/anonymous behavior.
8. Run full ownership and auth tests.
