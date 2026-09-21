begin;
-- Upgrade the previously deployed, empty MVP in place; preserve Skyline schemas.
alter table public.creator_profiles alter column account_id drop not null;
alter table public.creator_profiles alter column id drop default;
alter table public.creator_profiles add constraint creator_auth_user_fk foreign key(id) references auth.users(id) on delete restrict;
alter table public.creator_profiles add column avatar_path text;
alter table public.creator_profiles add column cover_path text;
alter table public.creator_profiles add column support_cta varchar(160) not null default 'Buy me a zobo';
alter table public.creator_profiles add constraint own_avatar_path check(avatar_path is null or split_part(avatar_path,'/',1)=id::text);
alter table public.creator_profiles add constraint own_cover_path check(cover_path is null or split_part(cover_path,'/',1)=id::text);
create table public.creator_preferences (
 creator_id uuid primary key references public.creator_profiles(id) on delete cascade,
 notify_support boolean not null default true, notify_payout boolean not null default true,
 weekly_digest boolean not null default false, updated_at timestamptz not null default now()
);
create trigger touch_updated_at before update on public.creator_preferences for each row execute function public.buymezobo_touch_updated_at();
create table public.ledger_entries (
 id uuid primary key default gen_random_uuid(), creator_id uuid not null references public.creator_profiles(id) on delete restrict,
 entry_type text not null check(entry_type in ('support','payout','payout_release','refund','adjustment')),
 reference_type text not null, reference_id uuid not null,
 amount bigint not null check(amount <> 0), currency text not null default 'NGN' check(currency='NGN'),
 created_at timestamptz not null default now(), unique(entry_type,reference_type,reference_id)
);
create index ledger_creator_idx on public.ledger_entries(creator_id,created_at desc);
alter table public.ledger_entries enable row level security;
alter table public.creator_preferences enable row level security;
revoke all on public.ledger_entries,public.creator_preferences from public,anon,authenticated;
grant select,insert,update,delete on public.creator_preferences to service_role;
grant select,insert on public.ledger_entries to service_role;
grant select on public.ledger_entries to authenticated;
grant select,insert,update on public.creator_preferences to authenticated;
create policy preferences_owner on public.creator_preferences for all to authenticated using((select auth.uid())=creator_id) with check((select auth.uid())=creator_id);
create policy ledger_owner on public.ledger_entries for select to authenticated using((select auth.uid())=creator_id);
create policy ledger_backend on public.ledger_entries for all to service_role using(true) with check(true);
create policy preferences_backend on public.creator_preferences for all to service_role using(true) with check(true);

grant select(id,username,display_name,bio,avatar_path,cover_path,category,location,support_cta,support_unit_amount,currency,page_status,accent_theme,created_at,updated_at) on public.creator_profiles to anon,authenticated;
grant insert(id,username,display_name,bio,page_status) on public.creator_profiles to authenticated;
grant update(username,display_name,bio,avatar_path,cover_path,category,location,support_cta,support_unit_amount,page_status,accent_theme) on public.creator_profiles to authenticated;
create policy profile_read on public.creator_profiles for select to anon,authenticated using(page_status in ('published','paused') or id=(select auth.uid()));
create policy profile_insert on public.creator_profiles for insert to authenticated with check(id=(select auth.uid()) and account_id is null);
create policy profile_update on public.creator_profiles for update to authenticated using(id=(select auth.uid())) with check(id=(select auth.uid()));
grant select on public.creator_links to anon,authenticated;
grant insert,update,delete on public.creator_links to authenticated;
create policy links_read on public.creator_links for select to anon,authenticated using(creator_id=(select auth.uid()) or (is_visible and exists(select 1 from public.creator_profiles p where p.id=creator_id and p.page_status in ('published','paused'))));
create policy links_insert on public.creator_links for insert to authenticated with check(creator_id=(select auth.uid()));
create policy links_update on public.creator_links for update to authenticated using(creator_id=(select auth.uid())) with check(creator_id=(select auth.uid()));
create policy links_delete on public.creator_links for delete to authenticated using(creator_id=(select auth.uid()));
grant select on public.support_transactions,public.payouts,public.refunds to authenticated;
grant select(id,creator_id,bank_name,bank_code,account_name,account_last4,is_default,is_verified) on public.payout_accounts to authenticated;
grant update(creator_hidden) on public.support_transactions to authenticated;
create policy gifts_read on public.support_transactions for select to authenticated using(creator_id=(select auth.uid()));
create policy gifts_moderate on public.support_transactions for update to authenticated using(creator_id=(select auth.uid())) with check(creator_id=(select auth.uid()));
create policy payouts_read on public.payouts for select to authenticated using(creator_id=(select auth.uid()));
create policy destinations_read on public.payout_accounts for select to authenticated using(creator_id=(select auth.uid()));
create policy refunds_read on public.refunds for select to authenticated using(exists(select 1 from public.support_transactions s where s.id=support_transaction_id and s.creator_id=(select auth.uid())));

-- Existing projections retain their column shape, but no longer need accounts.
create or replace view public.public_creator_profiles with(security_invoker=true) as
select p.id,p.username,p.display_name,p.bio,p.avatar_url,p.cover_url,p.category,p.location,
 p.support_message,p.support_unit_amount,p.currency,p.page_status,p.accent_theme
from public.creator_profiles p where p.page_status in ('published','paused');
-- Dashboard reads a purpose-built aggregate, never sums paginated browser records.
create function public.dashboard_totals() returns jsonb language sql stable security invoker set search_path='' as $$
select jsonb_build_object('balance',coalesce((select sum(amount) from public.ledger_entries where creator_id=auth.uid()),0),
 'earned',coalesce((select sum(support_amount) from public.support_transactions where creator_id=auth.uid() and status in ('successful','partially_refunded')),0),
 'count',(select count(*) from public.support_transactions where creator_id=auth.uid() and status in ('successful','partially_refunded')),
 'paid',coalesce((select sum(amount) from public.payouts where creator_id=auth.uid() and status='successful'),0)) $$;
revoke all on function public.dashboard_totals() from public,anon;
grant execute on function public.dashboard_totals() to authenticated;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values
 ('creator-avatars','creator-avatars',true,2097152,array['image/jpeg','image/png','image/webp']),
 ('creator-covers','creator-covers',true,5242880,array['image/jpeg','image/png','image/webp']);
create policy creator_images_read on storage.objects for select to authenticated using(bucket_id in ('creator-avatars','creator-covers') and (storage.foldername(name))[1]=(select auth.uid())::text);
create policy creator_images_insert on storage.objects for insert to authenticated with check(bucket_id in ('creator-avatars','creator-covers') and (storage.foldername(name))[1]=(select auth.uid())::text);
create policy creator_images_update on storage.objects for update to authenticated using(bucket_id in ('creator-avatars','creator-covers') and (storage.foldername(name))[1]=(select auth.uid())::text) with check(bucket_id in ('creator-avatars','creator-covers') and (storage.foldername(name))[1]=(select auth.uid())::text);
create policy creator_images_delete on storage.objects for delete to authenticated using(bucket_id in ('creator-avatars','creator-covers') and (storage.foldername(name))[1]=(select auth.uid())::text);

-- Privileged payment RPCs are SECURITY INVOKER and callable only by service_role.
create function public.settle_support(p_reference text,p_amount bigint,p_currency text,p_fee bigint,p_event text,p_payload jsonb) returns void
language plpgsql security invoker set search_path='' as $$
declare s public.support_transactions; owner_id uuid; net bigint;
begin
 select creator_id into owner_id from public.support_transactions where provider='paystack' and provider_reference=p_reference;
 if owner_id is null then raise exception 'Unknown reference'; end if;
 perform 1 from public.creator_profiles where id=owner_id for update;
 select * into s from public.support_transactions where provider='paystack' and provider_reference=p_reference for update;
 if s.total_charged<>p_amount or s.currency<>p_currency or p_fee<0 then raise exception 'Payment mismatch'; end if;
 if s.status in ('successful','refunded','partially_refunded') then return; end if;
 net:=s.total_charged-s.platform_fee-p_fee;
 if net<=0 then raise exception 'Invalid fee'; end if;
 insert into public.payment_events(provider,provider_event_id,event_type,payload,support_transaction_id,processed,processed_at) values('paystack',p_event,'charge.success',p_payload,s.id,true,now()) on conflict(provider,provider_event_id) do nothing;
 update public.support_transactions set status='successful',paid_at=now(),provider_fee=p_fee,creator_net_amount=net where id=s.id;
 insert into public.ledger_entries(creator_id,entry_type,reference_type,reference_id,amount) values(s.creator_id,'support','support_transaction',s.id,net);
end $$;

create function public.save_payout_destination(p_creator uuid,p_recipient text,p_bank_code text,p_bank_name text,p_account_name text,p_last4 text) returns void
language plpgsql security invoker set search_path='' as $$
begin
 perform 1 from public.creator_profiles where id=p_creator for update;
 if not found then raise exception 'Profile missing'; end if;
 update public.payout_accounts set is_default=false where creator_id=p_creator and is_default;
 insert into public.payout_accounts(creator_id,provider,provider_recipient_code,bank_code,bank_name,account_name,account_last4,is_default,is_verified)
 values(p_creator,'paystack',p_recipient,p_bank_code,p_bank_name,p_account_name,p_last4,true,true)
 on conflict(provider,provider_recipient_code) do update set is_default=true,is_verified=true
 where public.payout_accounts.creator_id=p_creator;
 if not found then raise exception 'Destination belongs to another creator'; end if;
end $$;

create function public.reserve_payout(p_creator uuid,p_account uuid,p_amount bigint,p_key uuid) returns jsonb
language plpgsql security invoker set search_path='' as $$
declare a public.payout_accounts; p public.payouts; balance bigint;
begin
 perform 1 from public.creator_profiles where id=p_creator for update;
 if not found then raise exception 'Profile missing'; end if;
 select * into p from public.payouts where idempotency_key=p_key;
 if found then
  if p.creator_id<>p_creator or p.amount<>p_amount or p.payout_account_id<>p_account then raise exception 'Request mismatch'; end if;
  return jsonb_build_object('id',p.id,'reference',p.provider_reference,'existing',true,'status',p.status);
 end if;
 select * into a from public.payout_accounts where id=p_account and creator_id=p_creator and is_verified and is_default;
 if not found then raise exception 'Verified destination required'; end if;
 select coalesce(sum(amount),0) into balance from public.ledger_entries where creator_id=p_creator;
 if p_amount<10000 or p_amount>balance then raise exception 'Insufficient available balance'; end if;
 insert into public.payouts(creator_id,payout_account_id,provider,provider_reference,amount,idempotency_key)
 values(p_creator,a.id,'paystack','zobo-'||gen_random_uuid()::text,p_amount,p_key) returning * into p;
 insert into public.ledger_entries(creator_id,entry_type,reference_type,reference_id,amount) values(p_creator,'payout','payout',p.id,-p.amount);
 return jsonb_build_object('id',p.id,'reference',p.provider_reference,'recipient',a.provider_recipient_code,'existing',false,'status',p.status);
end $$;

create function public.settle_payout(p_reference text,p_status text,p_amount bigint,p_event text,p_payload jsonb) returns void
language plpgsql security invoker set search_path='' as $$
declare p public.payouts; owner_id uuid;
begin
 if p_status not in ('successful','failed','reversed') then raise exception 'Invalid status'; end if;
 select creator_id into owner_id from public.payouts where provider='paystack' and provider_reference=p_reference;
 if owner_id is null then raise exception 'Unknown payout'; end if;
 perform 1 from public.creator_profiles where id=owner_id for update;
 select * into p from public.payouts where provider='paystack' and provider_reference=p_reference for update;
 if p.amount<>p_amount then raise exception 'Amount mismatch'; end if;
 if p.status=p_status or p.status='reversed' then return; end if;
 if p.status='successful' and p_status='failed' then return; end if;
 if p.status='failed' and p_status='successful' then raise exception 'Conflicting terminal event: reconcile with provider'; end if;
 if p_status in ('failed','reversed') then
 insert into public.ledger_entries(creator_id,entry_type,reference_type,reference_id,amount) values(p.creator_id,'payout_release','payout',p.id,p.amount) on conflict(entry_type,reference_type,reference_id) do nothing;
 end if;
 update public.payouts set status=p_status,processed_at=now() where id=p.id;
 insert into public.payment_events(provider,provider_event_id,event_type,payload,processed,processed_at) values('paystack',p_event,'transfer.'||p_status,p_payload,true,now()) on conflict(provider,provider_event_id) do nothing;
end $$;

-- Public initiation limits are persisted across function instances. Hashed keys only.
create table public.request_limits(key text primary key, window_start timestamptz not null default now(), hits integer not null default 1);
alter table public.request_limits enable row level security;
revoke all on public.request_limits from public,anon,authenticated;
grant select,insert,update,delete on public.request_limits to service_role;
create policy limits_backend on public.request_limits for all to service_role using(true) with check(true);
create function public.consume_request(p_key text,p_limit integer) returns boolean language plpgsql security invoker set search_path='' as $$
declare n integer;
begin
 insert into public.request_limits(key) values(p_key)
 on conflict(key) do update set hits=case when public.request_limits.window_start<now()-interval '1 hour' then 1 else public.request_limits.hits+1 end,
 window_start=case when public.request_limits.window_start<now()-interval '1 hour' then now() else public.request_limits.window_start end returning hits into n;
 return n<=p_limit;
end $$;
do $$ declare f regprocedure; begin
 for f in select p.oid::regprocedure from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.proname in ('settle_support','save_payout_destination','reserve_payout','settle_payout','consume_request') loop
 execute format('revoke all on function %s from public,anon,authenticated',f);
 execute format('grant execute on function %s to service_role',f);
 end loop;
end $$;
create function public.create_creator(p_username text,p_name text) returns void language plpgsql security invoker set search_path='' as $$
begin
 insert into public.creator_profiles(id,username,display_name,page_status) values(auth.uid(),p_username,p_name,'published');
 insert into public.creator_preferences(creator_id) values(auth.uid());
end $$;
revoke all on function public.create_creator(text,text) from public,anon;
grant execute on function public.create_creator(text,text) to authenticated;
commit;
