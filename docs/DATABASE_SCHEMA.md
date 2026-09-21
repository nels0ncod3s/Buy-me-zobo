# Current database architecture

Supabase Auth owns identity. `creator_profiles.id` references `auth.users.id`. This replaces the earlier deferred-auth proposal. The original empty application-owned `accounts` table is retained for migration compatibility and is unused; no application flow authenticates through it.

The source of truth is the ordered SQL in `supabase/migrations/`. The second migration upgrades the existing empty MVP in place rather than replacing tables. The unrelated `skyline_private` schema is preserved.

| Table                      | Purpose                                                     | Browser access                                       |
| -------------------------- | ----------------------------------------------------------- | ---------------------------------------------------- |
| creator_profiles           | Public creator identity, price and publishing status        | Published/paused public columns; owner inserts/edits |
| creator_preferences        | Notification preferences                                    | Owner only                                           |
| creator_links              | Creator website links                                       | Visible links on published/paused pages; owner CRUD  |
| support_transactions       | Provider references, gift amounts, consent and status       | Owner reads; only public-wall hiding can be edited   |
| payment_events             | Sanitized, verified provider-event audit                    | Server only                                          |
| payout_accounts            | Verified recipient token and masked bank details            | Owner reads safe columns; server writes              |
| payouts                    | Requested and confirmed transfers                           | Owner reads; server writes                           |
| ledger_entries             | Append-only credits, reservations and releases              | Owner reads; server inserts                          |
| request_limits             | Hashed request-rate counters                                | Server only                                          |
| accounts, creator_settings | Unused legacy compatibility tables                          | Server only                                          |
| refunds                    | Existing refund records, reserved for future refund tooling | Owner reads related records; server writes           |

All application tables have RLS. Ownership uses `auth.uid()`, never editable metadata. Column grants prevent creator UUID changes, bank recipient disclosure, payment status edits and browser ledger writes.

## Money

Amounts are integer kobo, NGN only. Payment initialization reads the stored creator price and validates quantity; client amount, fees and net fields are ignored. The platform deducts 5% from support. Verified Paystack processing fees are also deducted from the creator credit.

`settle_support` locks the creator and transaction, checks reference/amount/currency, and atomically marks payment successful and credits the ledger. Repeated events do not credit twice.

Available balance is the sum of ledger entries. `reserve_payout` locks the creator, verifies ownership of a default verified bank, checks available balance, inserts a payout and reserves its amount in one transaction. An idempotency key returns the same payout on retry.

`settle_payout` verifies the amount and applies terminal state. Failed/reversed transfers restore the reservation once. A conflicting late success after failure raises an error for reconciliation. Unknown provider outcomes remain reserved.

Financial RPCs are security-invoker functions executable only by the service role. `create_creator` and `dashboard_totals` run as the authenticated caller under RLS. Dashboard totals are computed in Postgres, independently of paginated records.

## Images and privacy

Public buckets: `creator-avatars` (2 MiB), `creator-covers` (5 MiB); JPEG, PNG and WebP only. Writes require the first folder to match the authenticated user UUID. Public means anyone with an image URL can view it, including an image uploaded for a subsequently paused page.

Public profile responses are explicitly projected by `get-public-creator`. Supporter email, provider references, creator financial totals and bank information are omitted. Name and message have separate opt-in flags, both default false. Creators can hide a gift from the wall without deleting financial history.

## Scope

Refund execution, chargeback processing, automatic email notifications, automated reconciliation scheduling and tax reporting are not implemented. Refunds/chargebacks must be handled operationally and reconciled to the ledger before the platform is opened to unrestricted production traffic.
