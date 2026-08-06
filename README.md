# Octapad Admin Panel

Simple admin dashboard for the Octapad app's activation-code system:
generate/deactivate license codes, see which device each is locked to, and
see the name + phone number the app reports on first launch.

Login is a single shared password (no OTP) — set it in `.env.local`.

## 1. Get a free MongoDB database (one-time, ~5 minutes)

1. Go to https://www.mongodb.com/cloud/atlas/register and create a free account.
2. Create a free **M0** cluster (any region close to you).
3. Under **Database Access**, add a database user with a username + password.
4. Under **Network Access**, add `0.0.0.0/0` (allow access from anywhere) —
   needed so the Android app can reach it later, not just your laptop.
5. Click **Connect → Drivers**, copy the connection string. It looks like:
   `mongodb+srv://<user>:<password>@<cluster>.mongodb.net/?retryWrites=true&w=majority`
6. Add `/octapad` before the `?` so it points at a database named `octapad`:
   `mongodb+srv://<user>:<password>@<cluster>.mongodb.net/octapad?retryWrites=true&w=majority`

## 2. Configure

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:
- `MONGODB_URI` — the connection string from step 1.
- `ADMIN_PASSWORD` — whatever password you want to log into the dashboard with.

## 3. Run it

```bash
npm install
npm run dev
```

Open http://localhost:3000 — it'll redirect you to `/login`. Enter the
password from `.env.local`.

## What's in the dashboard

- **Licenses tab** — generate one or many activation codes (shown as
  `AB3D-9KXQ-7M2P`), see which device each one is bound to (a code locks to
  the first device that redeems it), toggle **Active** off to remotely
  deactivate a device, toggle **MIDI** to grant/revoke the paid MIDI feature,
  unbind a code so it can be redeemed on a different phone, or delete a code.
- **Signups tab** — every device that has ever opened the app, with the name
  and phone number it reported (once the Android app is wired up to call
  `/api/app/signup` — see below).

## API the Android app will call (already built, not wired into the app yet)

These are NOT behind the admin password — they're the endpoints the phone
itself calls:

- `POST /api/app/signup` — `{ deviceId, name, phone }` → recorded automatically
  on first app launch, shows up in the Signups tab.
- `POST /api/app/redeem` — `{ code, deviceId }` → validates an activation
  code and locks it to that device (fails if already used on another device,
  or deactivated).
- `GET /api/app/status?code=...&deviceId=...` — periodic re-check so a
  remote deactivation from the dashboard actually locks the app on next
  check-in, without the user having to do anything.

To finish the loop, the Android app needs a small activation-gate screen
that calls these two endpoints — say the word and I'll build that next,
once you've deployed this somewhere the phone can reach (Vercel is the
easiest option — free tier, `vercel deploy` once you're happy with this
locally).

## Deploying later (optional, once you're happy running it locally)

Easiest path is Vercel (same people who make Next.js):

```bash
npx vercel
```

It'll ask you to log in / create a free account, then deploy. Add
`MONGODB_URI` and `ADMIN_PASSWORD` as environment variables in the Vercel
project settings (same values as your `.env.local`).
