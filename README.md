# Buy Me Zobo

A Nigerian creator-support platform built with SvelteKit, Supabase Auth, Postgres, Storage and Paystack Edge Functions.

Creators get a public page, profile and cover uploads, links, a supporter feed with privacy controls, and a dashboard for support and payouts. The isolated `/example` page is a simulation and never takes payment.

## Run

```sh
npm ci
npm run dev
npm test
npm run build
npx deno test --allow-env supabase/tests/webhook_test.ts
```

Copy `.env.example` to `.env` if targeting a different Supabase project. The checked-in project URL and publishable key are public identifiers, not administrator credentials.

## Backend

- Migrations: `supabase/migrations/`
- Edge Functions: `supabase/functions/`
- Access-control and ledger checks: `supabase/tests/security.sql`
- Deployment and required provider settings: [Deployment guide](docs/DATABASE_DEPLOYMENT.md)
- Schema and money rules: [Database schema](docs/DATABASE_SCHEMA.md)

**Payments are not enabled until Paystack credentials and webhooks are configured.** Email confirmation and reset also require the Auth URL/template settings in the deployment guide. Code and backend deployment alone do not validate email delivery or real transfers.

## Routes

- `/`: landing page
- `/signup`, `/login`, `/forgot-password`, `/reset-password`: real Supabase Auth
- `/onboarding`: create a profile after authentication
- `/creator/[username]`: public, persistent creator page
- `/dashboard`: protected workspace
- `/dashboard/settings`: profile, images, price, links, preferences and logout
- `/dashboard/supporters`: latest 100 confirmed gifts and public-wall moderation
- `/dashboard/payouts`: verified bank destination and payout history
- `/payment/return`: verified payment status
- `/example`: clearly labelled, in-memory example

Account and financial state is no longer stored in a demo localStorage record. Supabase SSR uses cookie-backed sessions, and database row-level security enforces ownership.

## Integration checks

`tests/integration.mjs` accepts a disposable confirmed test account through `TEST_EMAIL`, `TEST_PASSWORD` and `TEST_USERNAME`. It starts a local server, creates a profile, tests login/session/logout, profile and link persistence, public privacy, image restrictions, and changes the test password. Use only a dedicated test account and remove its profile/account afterward. It does not send email or initiate money transfers.
