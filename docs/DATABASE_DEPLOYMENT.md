# Supabase deployment and launch checklist

Project: `bcamyejfjhvwycpgsiaj`
App: `https://buyymezobo.vercel.app`

## Applied

The original MVP schema and the Supabase Auth/ledger migration have been applied to this project. Avatar/cover buckets and ownership policies exist. Nine Edge Functions have been deployed:

`get-public-creator`, `create-payment`, `payment-status`, `payment-webhook`, `payout-webhook`, `list-banks`, `create-payout-account`, `create-payout`, `reconcile-payout`.

The database was empty before the upgrade. No existing creator accounts or payments were migrated. Unrelated Skyline tables are unchanged. The project display name has not been changed by this implementation.

## Required Auth settings

Email/password and signup are enabled; email confirmation is enabled. The dashboard URL settings and templates have not yet been verified because the browser requires Supabase dashboard sign-in.

In Authentication → URL Configuration:

- Site URL: `https://buyymezobo.vercel.app`
- Allow redirects to `https://buyymezobo.vercel.app/auth/confirm`
- Allow redirects to `https://buyymezobo.vercel.app/auth/confirm?next=/reset-password`
- Add localhost equivalents only for development.

In Authentication → Email Templates, use a direct token-hash link for server-side confirmation, including across browsers:

Confirmation:

```html
<a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email">Confirm your email</a>
```

Recovery:

```html
<a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery"
	>Reset your password</a
>
```

The callback also supports PKCE code exchange. It rejects arbitrary redirect destinations. Configure a production SMTP sender and test delivery, confirmation, expired links and recovery with an email account you control.

## Paystack setup — currently missing

The live function check returned 503: payments are not configured. No payment or bank transfer has been initiated during implementation.

Set these in Supabase → Edge Functions → Secrets:

- `PAYSTACK_SECRET_KEY`: start with a Paystack test secret; use a live secret only after business verification and end-to-end tests.
- `APP_URL=https://buyymezobo.vercel.app`
- Optional `ALLOW_LOCALHOST=true` for local development only.

Supabase supplies `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` to hosted functions. A separately configured `SUPABASE_SECRET_KEY` takes precedence. Never put either administrative key or the Paystack secret in browser/public environment variables.

Configure the Paystack webhook URL:

```text
https://bcamyejfjhvwycpgsiaj.supabase.co/functions/v1/payment-webhook
```

That endpoint handles both charge and transfer events. The separate `payout-webhook` endpoint is an equivalent transfer-capable entry point if needed. Checkout supplies `https://buyymezobo.vercel.app/payment/return` as its callback.

Enable Paystack transfers and complete any required business verification. Transfers requiring OTP approval remain pending; do not disable provider security blindly. Complete provider approval and reconcile, or choose a provider-approved automation configuration.

Functions have gateway JWT verification disabled intentionally: public functions permit guests, webhook functions verify HMAC-SHA512, and creator functions validate the bearer token with Supabase Auth before deriving the creator UUID. CORS allows the configured app origin; it is not the authorization boundary.

## Deployment from source

```sh
npm ci
npm test
npm run build
npx supabase link --project-ref bcamyejfjhvwycpgsiaj
npx supabase db push
npx supabase functions deploy --project-ref bcamyejfjhvwycpgsiaj
```

Do not re-run already applied SQL manually. Migrations created through the connector may have server-generated version timestamps; compare `supabase migration list` and reconcile migration history before using `db push` on this already-deployed project.

The SvelteKit site uses its existing Vercel GitHub integration. The only frontend configuration is the public URL/key, with working defaults for this project. Update the public environment variables when using a separate test project.

## Verification performed

- Production build and Deno Edge Function typecheck.
- Isolated webhook handler tests: unsigned/tampered payloads are rejected before any outbound call; valid signatures use the independently verified provider amount and fee, then settle through the financial RPC.
- Unit checks: authoritative pricing, consent masking, redirect allowlist, reference and username validation.
- Transactional database tests: owner profile creation/editing, forged UUID rejection, private-column protection, username validation/uniqueness, draft visibility, cross-creator denial, private financial reads, browser financial-write denial, duplicate payment credit, payout destination ownership, overdraft prevention, idempotent reservation, duplicate failure/reversal compensation. All SQL fixtures rolled back.
- Live functions: unknown creator returns 404; missing Paystack configuration returns 503; unauthenticated payout returns 401; unsigned webhook returns 401.
- Live integration with a temporary confirmed account: login, cookie persistence, onboarding, all dashboard pages, profile edits, public profile privacy, link CRUD, hidden-link filtering, own-folder image upload, cross-folder/type/size rejection, password update, login with the new password and logout passed. The test image and account were removed.
- Security advisor: no application-table security findings. Existing informational notices concern unrelated Skyline tables.

The final end-to-end email and Paystack tests remain launch gates: signup/duplicate email, email confirmation and reset delivery, a test checkout with valid signed webhook, delayed/duplicate events, provider rejection, success/failure/reversal of an actual test transfer.

## Operations

The UI shows the latest 100 gifts and payouts; totals cover the entire ledger. Notification preferences are saved but notification delivery is not enabled.

On a transfer timeout, funds remain reserved. Use Refresh in payout history to verify the original reference with Paystack. If the provider has no record, an operator must verify non-execution before releasing funds with the server-only settlement RPC. Never issue a new transfer or restore balance merely because an HTTP request timed out.

Refunds and chargebacks require an operational process and matching ledger adjustment; automated handling is outside this MVP. Schedule reconciliation and review unresolved pending payouts before enabling unrestricted live traffic.

Request limits use hashed keys with hourly windows. Periodically remove expired `request_limits` rows. Old image objects are not automatically removed when a creator replaces an image; add a retention cleanup as usage grows.
