import { error, redirect } from '@sveltejs/kit';
import { profileColumns, photoUrl } from '$lib/supabase/config.js';
export async function load({ locals, depends, setHeaders }) {
	depends('zobo:creator');
	setHeaders({ 'cache-control': 'private, no-store' });
	const db = locals.supabase,
		id = locals.user.id;
	const p = await db.from('creator_profiles').select(profileColumns).eq('id', id).maybeSingle();
	if (p.error) error(503, 'Your workspace could not be loaded. Please try again.');
	if (!p.data) redirect(303, '/onboarding');
	const results = await Promise.all([
		db
			.from('creator_preferences')
			.select('notify_support,notify_payout,weekly_digest')
			.eq('creator_id', id)
			.maybeSingle(),
		db
			.from('support_transactions')
			.select('id,supporter_name,message,support_amount,paid_at,creator_hidden,status')
			.eq('creator_id', id)
			.in('status', ['successful', 'partially_refunded'])
			.order('paid_at', { ascending: false })
			.limit(100),
		db
			.from('payout_accounts')
			.select('id,bank_name,account_name,account_last4,is_verified,is_default')
			.eq('creator_id', id)
			.eq('is_default', true)
			.maybeSingle(),
		db
			.from('payouts')
			.select('id,amount,created_at,status')
			.eq('creator_id', id)
			.order('created_at', { ascending: false })
			.limit(100),
		db.rpc('dashboard_totals'),
		db
			.from('creator_links')
			.select('id,title,url,position,is_visible')
			.eq('creator_id', id)
			.order('position')
	]);
	if (results.some((r) => r.error))
		error(503, 'Your workspace could not be loaded. Please try again.');
	const [pref, gifts, bank, payouts, totals, links] = results.map((r) => r.data),
		profile = p.data;
	return {
		creator: {
			id,
			displayName: profile.display_name,
			username: profile.username,
			email: locals.user.email,
			bio: profile.bio || '',
			photo: photoUrl(profile.avatar_path),
			cover: photoUrl(profile.cover_path, 'creator-covers'),
			active: profile.page_status === 'published',
			unitAmount: profile.support_unit_amount / 100,
			cta: profile.support_cta,
			notifications: {
				support: pref?.notify_support ?? true,
				payout: pref?.notify_payout ?? true,
				digest: pref?.weekly_digest ?? false
			},
			bank: bank
				? {
						id: bank.id,
						name: bank.bank_name,
						accountName: bank.account_name,
						last4: bank.account_last4
					}
				: null,
			gifts: gifts.map((g) => ({
				id: g.id,
				name: g.supporter_name || 'A kind supporter',
				note: g.message || '',
				amount: g.support_amount / 100,
				date: g.paid_at,
				hidden: g.creator_hidden
			})),
			payouts: payouts.map((p) => ({
				id: p.id,
				amount: p.amount / 100,
				date: p.created_at,
				status: p.status,
				destination: 'Verified bank account'
			})),
			totals: {
				...totals,
				balance: totals.balance / 100,
				earned: totals.earned / 100,
				paid: totals.paid / 100
			},
			links
		}
	};
}
