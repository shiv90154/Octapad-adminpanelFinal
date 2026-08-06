# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build — also the closest thing to a typecheck/lint gate this project has
npm run start    # run a production build locally
npm run lint     # eslint
```

Needs `.env.local` (copy from `.env.local.example`): `MONGODB_URI` (a real MongoDB Atlas connection string — the app will 500 on every `/api/*` route without one) and `ADMIN_PASSWORD`.

No test suite exists. `npm run build` is the practical verification step — it catches TypeScript errors and most routing mistakes.

## Architecture

App Router, all server-side (no client-heavy state beyond the dashboard's own fetch calls). Two audiences hit this codebase:

- **Admin** (`/login`, `/dashboard`, `/api/licenses*`, `/api/signups`) — gated by a single shared password (`ADMIN_PASSWORD`), not a user table. `lib/auth.ts` issues an HMAC-SHA256-signed session cookie; `proxy.ts` verifies it on every `/dashboard/*` request.
- **The Android app** (`/api/app/signup`, `/api/app/redeem`, `/api/app/status`) — public, unauthenticated by design; these are what a phone calls to activate and stay activated. See `../app/CLAUDE.md` and `../DOCUMENTATION.md` for the client side of this contract. Changing these routes' request/response shape means updating `app/src/main/java/com/example/myapplication/license/LicenseApi.kt` in the other project too — nothing enforces this across the two codebases.

**`proxy.ts`, not `middleware.ts`**: Next.js 16 renamed Middleware to Proxy. `export function proxy(...)` is the entry point; the `runtime` config key doesn't exist for Proxy files (it defaults to, and can only be, Node.js — setting it throws a build error). This project's `proxy.ts` needs the Node runtime specifically because `lib/auth.ts` uses Node's `crypto` module for HMAC signing, which isn't available on the Edge runtime that Middleware used to default to.

**License lifecycle**: a `License` document (`models/License.ts`) is unbound (`deviceId: null`) until the first device redeems it via `/api/app/redeem`, then locked to that device — a second device attempting the same code gets `ALREADY_USED`. Admins unbind a code from the dashboard to free it up for a different phone. `active` and `midiPurchased` are the two flags an admin toggles from the dashboard; the app picks up changes to both within 30 minutes via its own periodic `/api/app/status` polling, not via any push mechanism from this side.

**`Signup` documents** (`models/Signup.ts`) are written by the app on first launch, not by an admin action — this is the "name and phone number reach the developer automatically" requirement. Don't confuse them with `License` documents; a device can exist as a `Signup` without ever having redeemed a code.
