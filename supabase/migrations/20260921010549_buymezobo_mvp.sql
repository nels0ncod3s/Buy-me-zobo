-- FirstLayer authentication is deferred. All writes require a trusted server.
-- Existing skyline_private data is deliberately untouched. Money is NGN kobo.
begin;
create table public.accounts (
 id uuid primary key default gen_random_uuid(),
 auth_provider text,
 auth_provider_user_id text,
 email text check (email is null or length(email) <= 320),
 status text not null default 'active' check (status in ('active','suspended','deleted')),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 unique(auth_provider,auth_provider_user_id),
 check ((auth_provider is null) = (auth_provider_user_id is null))
);
create index accounts_email_idx on public.accounts(lower(email));

create table public.creator_profiles (
 id uuid primary key default gen_random_uuid(),
 account_id uuid not null unique references public.accounts(id) on delete restrict,
 username varchar(24) not null unique check (username ~ '^[a-z0-9_]{3,24}$'
   and username not in ('admin','api','dashboard','login','logout','pricing','settings','signup','support','example','creator','auth','www')),
 display_name varchar(80) not null check (length(trim(display_name)) > 0),
 bio varchar(500), avatar_url text, cover_url text,
 category varchar(50), location varchar(120),
 support_message varchar(200),
 support_unit_amount bigint not null default 100000 check (support_unit_amount between 10000 and 100000000),
 currency text not null default 'NGN' check(currency = 'NGN'),
 page_status text not null default 'draft' check(page_status in ('draft','published','paused')),
 accent_theme varchar(40) not null default 'zobo',
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index creator_profiles_status_idx on public.creator_profiles(page_status);

create table public.creator_links (
 id uuid primary key default gen_random_uuid(),
 creator_id uuid not null references public.creator_profiles(id) on delete cascade,
 title varchar(80) not null check(length(trim(title)) > 0),
 url text not null check(url ~ '^https?://' and length(url) <= 2048),
 icon varchar(40), position integer not null default 0 check(position >= 0),
 is_visible boolean not null default true,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index creator_links_creator_position_idx on public.creator_links(creator_id,position);

create table public.creator_settings (
 creator_id uuid primary key references public.creator_profiles(id) on delete cascade,
 gift_email_notifications boolean not null default true,
 payout_email_notifications boolean not null default true,
 marketing_email_opt_in boolean not null default false,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table public.support_transactions (
 id uuid primary key default gen_random_uuid(),
 creator_id uuid not null references public.creator_profiles(id) on delete restrict,
 provider varchar(40) not null check(length(trim(provider)) > 0),
 provider_reference text not null check(length(trim(provider_reference)) > 0),
 idempotency_key uuid not null default gen_random_uuid() unique,
 currency text not null default 'NGN' check(currency = 'NGN'),
 quantity integer not null default 1 check(quantity between 1 and 1000),
 support_amount bigint not null check(support_amount between 10000 and 100000000),
 platform_fee bigint not null default 0 check(platform_fee >= 0),
 provider_fee bigint not null default 0 check(provider_fee >= 0),
 total_charged bigint not null check(total_charged > 0),
 creator_net_amount bigint not null check(creator_net_amount >= 0),
 supporter_name varchar(100), supporter_email varchar(320), message varchar(500),
 show_name_publicly boolean not null default false,
 show_message_publicly boolean not null default false,
 creator_hidden boolean not null default false,
 status text not null default 'pending' check(status in ('pending','successful','failed','refunded','partially_refunded')),
 paid_at timestamptz,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 unique(provider,provider_reference),
 check(total_charged = creator_net_amount + platform_fee + provider_fee),
 check(total_charged >= support_amount and creator_net_amount <= support_amount),
 check(status not in ('successful','refunded','partially_refunded') or paid_at is not null)
);
create index support_transactions_creator_created_idx on public.support_transactions(creator_id,created_at desc);
create index support_transactions_creator_status_idx on public.support_transactions(creator_id,status);

create table public.payment_events (
 id uuid primary key default gen_random_uuid(),
 provider varchar(40) not null,
 provider_event_id text not null,
 event_type varchar(100) not null,
 support_transaction_id uuid references public.support_transactions(id) on delete restrict,
 payload jsonb not null check(jsonb_typeof(payload) = 'object'),
 processed boolean not null default false,
 processed_at timestamptz, processing_error text,
 attempt_count integer not null default 0 check(attempt_count >= 0),
 created_at timestamptz not null default now(),
 unique(provider,provider_event_id),
 check(not processed or processed_at is not null)
);
create index payment_events_transaction_idx on public.payment_events(support_transaction_id);
create index payment_events_unprocessed_idx on public.payment_events(created_at) where not processed;

create table public.payout_accounts (
 id uuid primary key default gen_random_uuid(),
 creator_id uuid not null references public.creator_profiles(id) on delete restrict,
 provider varchar(40) not null,
 provider_recipient_code text not null,
 bank_code varchar(30), bank_name varchar(120), account_name varchar(160),
 account_last4 varchar(4) check(account_last4 ~ '^[0-9]{4}$'),
 is_default boolean not null default true,
 is_verified boolean not null default false,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 unique(provider,provider_recipient_code), unique(id,creator_id,provider)
);
create index payout_accounts_creator_idx on public.payout_accounts(creator_id);
create unique index payout_accounts_one_default_idx on public.payout_accounts(creator_id) where is_default;

create table public.payouts (
 id uuid primary key default gen_random_uuid(),
 creator_id uuid not null references public.creator_profiles(id) on delete restrict,
 payout_account_id uuid not null,
 provider varchar(40) not null, provider_reference text,
 idempotency_key uuid not null default gen_random_uuid() unique,
 currency text not null default 'NGN' check(currency = 'NGN'),
 amount bigint not null check(amount > 0),
 status text not null default 'pending' check(status in ('pending','processing','successful','failed','reversed')),
 failure_reason text,
 requested_at timestamptz not null default now(), processed_at timestamptz,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 unique(provider,provider_reference),
 foreign key(payout_account_id,creator_id,provider) references public.payout_accounts(id,creator_id,provider) on delete restrict,
 check(status <> 'successful' or processed_at is not null)
);
create index payouts_creator_created_idx on public.payouts(creator_id,created_at desc);
create index payouts_destination_idx on public.payouts(payout_account_id,creator_id,provider);

create table public.refunds (
 id uuid primary key default gen_random_uuid(),
 support_transaction_id uuid not null references public.support_transactions(id) on delete restrict,
 provider varchar(40) not null, provider_reference text not null,
 amount bigint not null check(amount > 0),
 creator_debit_amount bigint not null check(creator_debit_amount >= 0 and creator_debit_amount <= amount),
 status text not null default 'pending' check(status in ('pending','processing','successful','failed')),
 reason text, processed_at timestamptz,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 unique(provider,provider_reference),
 check(status <> 'successful' or processed_at is not null)
);
create index refunds_transaction_idx on public.refunds(support_transaction_id,status);

-- Fail closed until verified FirstLayer ownership is available. No demo write policies.
do $$
declare t text;
begin
 foreach t in array array['accounts','creator_profiles','creator_links','creator_settings','support_transactions','payment_events','payout_accounts','payouts','refunds'] loop
   execute format('alter table public.%I enable row level security', t);
   execute format('revoke all on table public.%I from public, anon, authenticated', t);
   execute format('grant select, insert, update, delete on table public.%I to service_role', t);
   execute format('create policy backend_only on public.%I for all to service_role using (true) with check (true)', t);
 end loop;
end $$;

create function public.buymezobo_touch_updated_at() returns trigger
language plpgsql security invoker set search_path = '' as $$
begin new.updated_at = now(); return new; end;
$$;
revoke all on function public.buymezobo_touch_updated_at() from public,anon,authenticated;
do $$
declare t text;
begin
 foreach t in array array['accounts','creator_profiles','creator_links','creator_settings','support_transactions','payout_accounts','payouts','refunds'] loop
   execute format('create trigger touch_updated_at before update on public.%I for each row execute function public.buymezobo_touch_updated_at()',t);
 end loop;
end $$;

-- Safe projections for the server to return. Views obey caller privileges/RLS.
create view public.public_creator_profiles with (security_invoker = true) as
select p.id, p.username,p.display_name,p.bio,p.avatar_url,p.cover_url,p.category,p.location,
 p.support_message,p.support_unit_amount,p.currency,p.page_status,p.accent_theme
from public.creator_profiles p join public.accounts a on a.id=p.account_id
where p.page_status in ('published','paused') and a.status='active';

create view public.public_creator_links with (security_invoker = true) as
select l.id,l.creator_id,l.title,l.url,l.icon,l.position
from public.creator_links l join public.public_creator_profiles p on p.id=l.creator_id
where l.is_visible;

create view public.public_support_wall with (security_invoker = true) as
select s.id,s.creator_id,s.support_amount,s.currency,s.paid_at,
 case when s.show_name_publicly then s.supporter_name else null end as supporter_name,
 case when s.show_message_publicly then s.message else null end as message
from public.support_transactions s join public.public_creator_profiles p on p.id=s.creator_id
where s.status='successful' and not s.creator_hidden
 and (s.show_name_publicly or s.show_message_publicly);

-- Pending payout/refund amounts are reserved to avoid overstating available funds.
-- Server MUST serialize payout requests per creator; this view alone is not a lock.
create view public.creator_balances with (security_invoker = true) as
select p.id as creator_id, 'NGN'::text as currency,
 coalesce(g.earned,0) as earned_amount,coalesce(r.reserved,0) as refund_reserved_amount,
 coalesce(o.reserved,0) as payout_reserved_amount,
 coalesce(g.earned,0)-coalesce(r.reserved,0)-coalesce(o.reserved,0) as available_amount
from public.creator_profiles p
left join lateral (select sum(s.creator_net_amount) earned from public.support_transactions s
 where s.creator_id=p.id and s.status in ('successful','partially_refunded','refunded')) g on true
left join lateral (select sum(f.creator_debit_amount) reserved from public.refunds f
 join public.support_transactions s on s.id=f.support_transaction_id
 where s.creator_id=p.id and f.status in ('pending','processing','successful')) r on true
left join lateral (select sum(x.amount) reserved from public.payouts x
 where x.creator_id=p.id and x.status in ('pending','processing','successful')) o on true;

revoke all on public.public_creator_profiles,public.public_creator_links,public.public_support_wall,public.creator_balances from public,anon,authenticated;
grant select on public.public_creator_profiles,public.public_creator_links,public.public_support_wall,public.creator_balances to service_role;
comment on table public.accounts is 'Application-owned identity. FirstLayer integration deferred; no auth.users dependency.';
comment on table public.support_transactions is 'Private financial record. NGN kobo. Success only after provider verification. Never expose this table directly to browsers.';
comment on view public.creator_balances is 'Server-only balance projection. Refund state and refund rows must be updated atomically; serialize payout requests by locking creator_profiles.';
commit;
