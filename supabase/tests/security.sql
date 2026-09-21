begin;
select set_config('zobo.test_a',gen_random_uuid()::text,true),set_config('zobo.test_b',gen_random_uuid()::text,true);
insert into auth.users(id) values(current_setting('zobo.test_a')::uuid),(current_setting('zobo.test_b')::uuid);
set local role authenticated;
select set_config('request.jwt.claim.sub',current_setting('zobo.test_a'),true);
select public.create_creator('zobo_test_a','Creator A');
update public.creator_profiles set bio='Updated',page_status='published' where id=auth.uid();
insert into public.creator_links(creator_id,title,url) values(auth.uid(),'Work','https://example.com');
do $$begin
 begin insert into public.creator_profiles(id,username,display_name) values(current_setting('zobo.test_b')::uuid,'not_owner','Intruder');raise exception 'TEST: forged profile accepted';exception when insufficient_privilege then null;end;
 begin update public.creator_profiles set account_id=gen_random_uuid() where id=auth.uid();raise exception 'TEST: protected column writable';exception when insufficient_privilege then null;end;
 begin update public.creator_profiles set username='bad name' where id=auth.uid();raise exception 'TEST: invalid username accepted';exception when check_violation then null;end;
 begin insert into public.ledger_entries(creator_id,entry_type,reference_type,reference_id,amount) values(auth.uid(),'support','test',gen_random_uuid(),100);raise exception 'TEST: browser ledger write accepted';exception when insufficient_privilege then null;end;
end $$;
select set_config('request.jwt.claim.sub',current_setting('zobo.test_b'),true);
select public.create_creator('zobo_test_b','Creator B');
update public.creator_profiles set page_status='draft' where id=auth.uid();
do $$declare n integer; begin
 update public.creator_profiles set bio='Hacked' where id=current_setting('zobo.test_a')::uuid;get diagnostics n=row_count;if n<>0 then raise exception 'TEST: cross-owner update';end if;
 update public.creator_links set title='Hacked' where creator_id=current_setting('zobo.test_a')::uuid;get diagnostics n=row_count;if n<>0 then raise exception 'TEST: cross-owner link update';end if;
 begin update public.creator_profiles set username='zobo_test_a' where id=auth.uid();raise exception 'TEST: duplicate username';exception when unique_violation then null;end;
end $$;
set local role anon;
select set_config('request.jwt.claim.sub','',true);
do $$begin
 if (select count(*) from public.creator_profiles where username in ('zobo_test_a','zobo_test_b'))<>1 then raise exception 'TEST: public profile visibility';end if;
 begin perform supporter_email from public.support_transactions;raise exception 'TEST: anonymous private data';exception when insufficient_privilege then null;end;
 begin perform public.reserve_payout(gen_random_uuid(),gen_random_uuid(),10000,gen_random_uuid());raise exception 'TEST: public payout RPC';exception when insufficient_privilege then null;end;
end $$;
set local role service_role;
insert into public.support_transactions(creator_id,provider,provider_reference,support_amount,total_charged,platform_fee,creator_net_amount,supporter_email)
values(current_setting('zobo.test_a')::uuid,'paystack','zobo-sql-test',100000,100000,5000,95000,'private@example.test');
select public.settle_support('zobo-sql-test',100000,'NGN',1500,'test-charge','{}');
select public.settle_support('zobo-sql-test',100000,'NGN',1500,'test-charge','{}');
select public.save_payout_destination(current_setting('zobo.test_a')::uuid,'recipient-test-a','001','Test bank','Creator A','1234');
select public.save_payout_destination(current_setting('zobo.test_b')::uuid,'recipient-test-b','001','Test bank','Creator B','5678');
do $$declare a uuid; b uuid; p jsonb; q jsonb; k uuid:=gen_random_uuid(); begin
 if (select sum(amount) from public.ledger_entries where creator_id=current_setting('zobo.test_a')::uuid)<>93500 then raise exception 'TEST: duplicate credit or wrong net';end if;
 select id into a from public.payout_accounts where provider_recipient_code='recipient-test-a';
 select id into b from public.payout_accounts where provider_recipient_code='recipient-test-b';
 begin perform public.reserve_payout(current_setting('zobo.test_a')::uuid,b,10000,k);raise exception 'TEST: wrong destination accepted';exception when raise_exception then if SQLERRM like 'TEST:%' then raise;end if;end;
 begin perform public.reserve_payout(current_setting('zobo.test_a')::uuid,a,93501,k);raise exception 'TEST: overdraw accepted';exception when raise_exception then if SQLERRM like 'TEST:%' then raise;end if;end;
 p:=public.reserve_payout(current_setting('zobo.test_a')::uuid,a,93500,k);
 q:=public.reserve_payout(current_setting('zobo.test_a')::uuid,a,93500,k);
 if p->>'id'<>q->>'id' or q->>'existing'<>'true' then raise exception 'TEST: payout idempotency';end if;
 if (select sum(amount) from public.ledger_entries where creator_id=current_setting('zobo.test_a')::uuid)<>0 then raise exception 'TEST: balance reservation';end if;
 perform public.settle_payout(p->>'reference','failed',93500,'test-failed','{}');
 perform public.settle_payout(p->>'reference','failed',93500,'test-failed','{}');
 perform public.settle_payout(p->>'reference','reversed',93500,'test-reversed','{}');
 if (select sum(amount) from public.ledger_entries where creator_id=current_setting('zobo.test_a')::uuid)<>93500 then raise exception 'TEST: duplicate payout release';end if;
end $$;
set local role authenticated;
select set_config('request.jwt.claim.sub',current_setting('zobo.test_b'),true);
do $$begin
 if exists(select 1 from public.support_transactions where creator_id=current_setting('zobo.test_a')::uuid) then raise exception 'TEST: cross-owner financial read';end if;
 if exists(select 1 from public.ledger_entries where creator_id=current_setting('zobo.test_a')::uuid) then raise exception 'TEST: cross-owner ledger read';end if;
 begin perform provider_recipient_code from public.payout_accounts;raise exception 'TEST: bank recipient exposed';exception when insufficient_privilege then null;end;
end $$;
reset role;
rollback;
select 'Ownership, public privacy, financial grants, idempotency, balance reservation and payout compensation passed; all fixtures rolled back.' as result;
