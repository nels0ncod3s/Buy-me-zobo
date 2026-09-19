# Buy Me Zobo — Database Schema

> Status: Proposed MVP schema  
> Database: PostgreSQL / Supabase Postgres  
> Authentication: **Deferred**. FirstLayer will be integrated later as the authentication provider.

## Goals

The database should support:

- Public creator profiles that work across devices.
- Creator links and profile customization.
- One-off supporter gifts/payments.
- Privacy controls for supporter names and messages.
- Creator balances and payout history.
- Payment webhook idempotency and auditability.
- A clean path to integrate FirstLayer without coupling the database to Supabase Auth.

## Authentication strategy

Buy Me Zobo should **not** reference `auth.users` or any Supabase-specific authentication table.

Instead, the application owns an `accounts` record. When FirstLayer is integrated later, its user ID will be stored in `auth_provider_user_id`.

Until FirstLayer is ready:

- do not expose production dashboard write APIs without authentication;
- the existing local/demo experience can remain available for development;
- public creator profiles can be built against seeded development data;
- payment webhook endpoints must authenticate with the payment provider, not with a browser session.

## Entity overview

```text
accounts
   │
   └── creator_profiles
          ├── creator_links
          ├── support_transactions
          │      └── payment_events
          ├── payout_accounts
          └── payouts
```

## PostgreSQL schema

### Extensions

```sql
create extension if not exists pgcrypto;
```

---

## 1. accounts

Application-owned user/account record. It deliberately does not depend on an authentication vendor.

```sql
create table accounts (
  id uuid primary key default gen_random_uuid(),

  -- Filled when FirstLayer is connected.
  auth_provider varchar(50),
  auth_provider_user_id text,

  email text,
  status varchar(20) not null default 'active'
    check (status in ('active', 'suspended', 'deleted')),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (auth_provider, auth_provider_user_id)
);

create index accounts_email_idx on accounts (lower(email));
```

### Notes

- `id` is the permanent Buy Me Zobo account identifier.
- FirstLayer identity is an external reference, not the primary key.
- This makes auth providers replaceable without migrating every creator/payment row.

---

## 2. creator_profiles

One public creator identity per account for the MVP.

```sql
create table creator_profiles (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null unique
    references accounts(id) on delete cascade,

  username varchar(30) not null,
  display_name varchar(80) not null,
  bio varchar(500),

  avatar_url text,
  cover_url text,

  category varchar(50),
  location varchar(120),

  support_unit_amount integer not null default 1000
    check (support_unit_amount >= 100),

  page_status varchar(20) not null default 'draft'
    check (page_status in ('draft', 'published', 'paused')),

  accent_theme varchar(40) not null default 'zobo',

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint creator_profiles_username_format
    check (username ~ '^[a-z0-9_]{3,30}$')
);

create unique index creator_profiles_username_unique
  on creator_profiles (lower(username));

create index creator_profiles_status_idx
  on creator_profiles (page_status);
```

### Reserved usernames

Reserved route names such as the following should be rejected by application validation:

```text
admin
api
dashboard
login
logout
pricing
settings
signup
support
```

A database-backed `reserved_usernames` table can be added later if the list becomes operational rather than static.

---

## 3. creator_links

Links displayed on a creator page.

```sql
create table creator_links (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null
    references creator_profiles(id) on delete cascade,

  title varchar(80) not null,
  url text not null,
  icon varchar(40),

  position integer not null default 0,
  is_visible boolean not null default true,

  created_at timestamptz not null default now()
);

create index creator_links_creator_position_idx
  on creator_links (creator_id, position);
```

---

## 4. support_transactions

The canonical record for every supporter gift.

Money should be stored in the smallest currency unit where practical. For NGN, this schema stores **kobo**.

Example:

```text
₦1,000 = 100000 kobo
```

```sql
create table support_transactions (
  id uuid primary key default gen_random_uuid(),

  creator_id uuid not null
    references creator_profiles(id) on delete restrict,

  provider varchar(40) not null,
  provider_reference text not null,

  currency char(3) not null default 'NGN',

  support_amount integer not null
    check (support_amount > 0),

  platform_fee integer not null default 0
    check (platform_fee >= 0),

  provider_fee integer not null default 0
    check (provider_fee >= 0),

  total_charged integer not null
    check (total_charged > 0),

  creator_net_amount integer not null
    check (creator_net_amount >= 0),

  supporter_name varchar(100),
  supporter_email text,
  message varchar(500),

  show_name_publicly boolean not null default false,
  show_message_publicly boolean not null default false,

  status varchar(30) not null default 'pending'
    check (
      status in (
        'pending',
        'successful',
        'failed',
        'refunded',
        'partially_refunded'
      )
    ),

  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (provider, provider_reference)
);

create index support_transactions_creator_created_idx
  on support_transactions (creator_id, created_at desc);

create index support_transactions_creator_status_idx
  on support_transactions (creator_id, status);
```

### Important rules

- Never mark a transaction successful from a client-side redirect alone.
- A verified provider webhook should be the source of truth.
- `provider_reference` must be unique per provider.
- `creator_net_amount` should be persisted rather than recalculated later because fees may change over time.
- Public creator pages must never expose `supporter_email`.

---

## 5. payment_events

Stores payment-provider webhook events so webhook processing is idempotent and auditable.

```sql
create table payment_events (
  id uuid primary key default gen_random_uuid(),

  provider varchar(40) not null,
  provider_event_id text not null,

  event_type varchar(100) not null,
  payload jsonb not null,

  processed boolean not null default false,
  processed_at timestamptz,
  processing_error text,

  created_at timestamptz not null default now(),

  unique (provider, provider_event_id)
);
```

Do not blindly replay webhook payloads. Verify provider signatures before inserting or processing them.

---

## 6. payout_accounts

Stores the creator's payout destination.

Do not store raw bank account numbers unless there is a clear operational reason and appropriate security controls. Prefer a payment-provider recipient/token/reference plus masked display data.

```sql
create table payout_accounts (
  id uuid primary key default gen_random_uuid(),

  creator_id uuid not null
    references creator_profiles(id) on delete cascade,

  provider varchar(40) not null,
  provider_recipient_code text not null,

  bank_code varchar(30),
  bank_name varchar(120),
  account_name varchar(160),
  account_last4 char(4),

  is_default boolean not null default true,
  is_verified boolean not null default false,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index payout_accounts_creator_idx
  on payout_accounts (creator_id);
```

For the MVP, restrict each creator to one active/default payout destination at the application layer.

---

## 7. payouts

Tracks money transferred from Buy Me Zobo to a creator.

```sql
create table payouts (
  id uuid primary key default gen_random_uuid(),

  creator_id uuid not null
    references creator_profiles(id) on delete restrict,

  payout_account_id uuid
    references payout_accounts(id) on delete set null,

  provider varchar(40) not null,
  provider_reference text,

  currency char(3) not null default 'NGN',
  amount integer not null
    check (amount > 0),

  status varchar(30) not null default 'pending'
    check (
      status in (
        'pending',
        'processing',
        'successful',
        'failed',
        'reversed'
      )
    ),

  failure_reason text,

  requested_at timestamptz not null default now(),
  processed_at timestamptz,
  created_at timestamptz not null default now(),

  unique (provider, provider_reference)
);

create index payouts_creator_created_idx
  on payouts (creator_id, created_at desc);
```

---

## Balance calculation

Do not maintain a browser-controlled balance.

For the MVP, available creator balance can be derived from confirmed ledger activity:

```text
successful creator_net_amount
- successful/processing payouts
- refunds
= available balance
```

A dedicated ledger table should be introduced before the product handles meaningful transaction volume or more complex adjustments.

### Recommended production ledger

Later, add:

```text
ledger_entries
--------------
id
creator_id
entry_type
reference_type
reference_id
amount
currency
created_at
```

Where `amount` is signed:

- payment credit: positive
- platform/provider fee: negative if modeled separately
- payout: negative
- refund: negative
- manual adjustment: positive or negative

The balance then becomes the sum of immutable ledger entries.

---

## Privacy behavior

The support transaction stores two independent privacy choices:

```text
show_name_publicly
show_message_publicly
```

Recommended defaults:

```text
show_name_publicly    = false
show_message_publicly = false
```

A supporter must explicitly opt in before either value appears on the public gift wall.

The creator dashboard may still display the supporter name/message according to the product's privacy policy, but supporter email must stay private and must never appear publicly.

Creators should be able to hide a previously public support item without deleting the underlying financial transaction.

If moderation controls are needed, add:

```sql
alter table support_transactions
  add column creator_hidden boolean not null default false;
```

Public wall query condition:

```text
status = successful
AND creator_hidden = false
AND (show_name_publicly = true OR show_message_publicly = true)
```

---

## Row Level Security / authorization

RLS policies should be added when FirstLayer identity is integrated.

Target rules:

- Anyone can read a published creator's safe public profile fields.
- Anyone can read visible creator links.
- Anyone can create a payment intent only through the server/API.
- A creator can read only their own private support history.
- A creator can update only their own profile and links.
- A creator can access only their own payout destination and payout records.
- Payment status and balances can only be changed by trusted server-side code/webhooks.

Do **not** implement permissive temporary RLS policies just to make the app easier to demo.

---

## Recommended public creator query

A public creator endpoint should return a deliberately limited shape:

```json
{
  "username": "nelson",
  "displayName": "Nelson Wey",
  "bio": "...",
  "avatarUrl": "...",
  "coverUrl": "...",
  "category": "Developer",
  "supportUnitAmount": 100000,
  "links": [],
  "publicSupport": []
}
```

It must not return:

- account IDs unless required;
- creator email;
- supporter emails;
- bank details;
- provider recipient codes;
- payout records;
- private support messages;
- internal payment references.

---

## MVP implementation order

1. Create `accounts` and `creator_profiles`.
2. Migrate creator page reads from localStorage to the database.
3. Add creator links.
4. Add payment intent creation on the server.
5. Add `support_transactions`.
6. Add verified payment webhooks and `payment_events`.
7. Add public gift privacy controls.
8. Add payout destination/token storage.
9. Add payouts.
10. Integrate FirstLayer and enable creator dashboard authorization/RLS.
11. Move to an immutable ledger before transaction complexity grows.

## Deferred

The following are intentionally outside the first database pass:

- recurring memberships;
- multiple creator pages per account;
- teams/organizations;
- subscriptions;
- creator discovery;
- comments/replies;
- goals/campaigns;
- supporter accounts;
- multi-currency balances;
- tax documents.
