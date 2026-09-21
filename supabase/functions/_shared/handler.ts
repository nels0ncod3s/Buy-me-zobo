import { createClient } from 'npm:@supabase/supabase-js@2.116.0';
import { paymentInput, publicGift, validReference, validUuid, safeCheckout } from './rules.mjs';
const env = (key: string) => Deno.env.get(key) || '';
const appUrl = env('APP_URL') || 'https://buyymezobo.vercel.app';
const db = createClient(
	env('SUPABASE_URL'),
	env('SUPABASE_SECRET_KEY') || env('SUPABASE_SERVICE_ROLE_KEY'),
	{ auth: { persistSession: false, autoRefreshToken: false } }
);
class Fault extends Error {
	constructor(
		message: string,
		public status = 400
	) {
		super(message);
	}
}
function checked(result: any) {
	if (result.error) throw new Error('Database operation failed');
	return result.data;
}
function secret() {
	const s = env('PAYSTACK_SECRET_KEY');
	if (!s) throw new Fault('Payments are not configured yet. Please try again later.', 503);
	return s;
}
async function paystack(path: string, body?: unknown) {
	const response = await fetch('https://api.paystack.co' + path, {
		method: body ? 'POST' : 'GET',
		headers: { Authorization: 'Bearer ' + secret(), 'Content-Type': 'application/json' },
		body: body ? JSON.stringify(body) : undefined,
		signal: AbortSignal.timeout(20000)
	});
	const result = await response.json();
	if (!response.ok || !result.status)
		throw new Fault('The payment provider could not complete this request. Please try again.', 502);
	return result.data;
}
async function user(req: Request) {
	const token = (req.headers.get('authorization') || '').replace(/^Bearer /i, '');
	if (!token) throw new Fault('Please sign in.', 401);
	const { data, error } = await db.auth.getUser(token);
	if (error || !data.user) throw new Fault('Please sign in again.', 401);
	return data.user;
}
async function limit(key: string, count: number) {
	const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(key));
	const hash = Array.from(new Uint8Array(digest))
		.map((x) => x.toString(16).padStart(2, '0'))
		.join('');
	if (!checked(await db.rpc('consume_request', { p_key: hash, p_limit: count })))
		throw new Fault('Too many attempts. Please try again later.', 429);
}
async function settleCharge(reference: string) {
	const data = await paystack('/transaction/verify/' + encodeURIComponent(reference));
	if (data.reference !== reference || data.currency !== 'NGN')
		throw new Error('Provider reference mismatch');
	if (data.status === 'success') {
		if (!Number.isSafeInteger(data.amount) || !Number.isSafeInteger(data.fees))
			throw new Error('Invalid verified payment');
		checked(
			await db.rpc('settle_support', {
				p_reference: reference,
				p_amount: data.amount,
				p_currency: data.currency,
				p_fee: data.fees,
				p_event: 'charge.success:' + reference,
				p_payload: {
					reference,
					amount: data.amount,
					currency: data.currency,
					fees: data.fees,
					status: data.status
				}
			})
		);
	}
	return data.status;
}
async function settleTransfer(reference: string) {
	const data = await paystack('/transfer/verify/' + encodeURIComponent(reference));
	const p = checked(
		await db
			.from('payouts')
			.select('amount,payout_account_id')
			.eq('provider_reference', reference)
			.single()
	);
	const a = checked(
		await db
			.from('payout_accounts')
			.select('provider_recipient_code')
			.eq('id', p.payout_account_id)
			.single()
	);
	if (
		data.reference !== reference ||
		data.currency !== 'NGN' ||
		data.amount !== p.amount ||
		data.recipient?.recipient_code !== a.provider_recipient_code
	)
		throw new Error('Transfer mismatch');
	const status = (
		{ success: 'successful', failed: 'failed', reversed: 'reversed' } as Record<string, string>
	)[data.status];
	if (status)
		checked(
			await db.rpc('settle_payout', {
				p_reference: reference,
				p_status: status,
				p_amount: data.amount,
				p_event: 'transfer.' + status + ':' + reference,
				p_payload: { reference, amount: data.amount, status }
			})
		);
	return status || 'processing';
}
async function webhook(req: Request) {
	const raw = await req.text();
	if (raw.length > 262144) throw new Fault('Payload too large', 413);
	const signature = req.headers.get('x-paystack-signature') || '';
	if (!/^[a-f0-9]{128}$/i.test(signature)) throw new Fault('Invalid signature', 401);
	const key = await crypto.subtle.importKey(
		'raw',
		new TextEncoder().encode(secret()),
		{ name: 'HMAC', hash: 'SHA-512' },
		false,
		['verify']
	);
	const bytes = new Uint8Array(signature.match(/../g)!.map((x) => parseInt(x, 16)));
	if (!(await crypto.subtle.verify('HMAC', key, bytes, new TextEncoder().encode(raw))))
		throw new Fault('Invalid signature', 401);
	const event = JSON.parse(raw),
		reference = event.data?.reference;
	if (event.event === 'charge.success') {
		if (!validReference(reference)) return { received: true };
		await settleCharge(reference);
	} else if (['transfer.success', 'transfer.failed', 'transfer.reversed'].includes(event.event)) {
		if (!validReference(reference)) return { received: true };
		await settleTransfer(reference);
	}
	return { received: true };
}
export function handler(name: string) {
	return async (req: Request) => {
		const origin = req.headers.get('origin');
		const allowed =
			origin === appUrl ||
			(env('ALLOW_LOCALHOST') === 'true' && /^http:\/\/localhost:\d+$/.test(origin || ''));
		const headers: Record<string, string> = {
			'Content-Type': 'application/json',
			'Cache-Control': 'no-store',
			Vary: 'Origin'
		};
		if (allowed) {
			headers['Access-Control-Allow-Origin'] = origin!;
			headers['Access-Control-Allow-Headers'] =
				'authorization, x-client-info, apikey, content-type';
			headers['Access-Control-Allow-Methods'] = 'POST, OPTIONS';
		}
		const respond = (data: unknown, status = 200) =>
			new Response(JSON.stringify(data), { status, headers });
		if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers });
		if (req.method !== 'POST') return respond({ error: 'Method not allowed' }, 405);
		try {
			if (name === 'payment-webhook' || name === 'payout-webhook')
				return respond(await webhook(req));
			if (origin && !allowed) throw new Fault('Origin not allowed', 403);
			const raw = await req.text();
			if (raw.length > 10000) throw new Fault('Request too large', 413);
			let body;
			try {
				body = JSON.parse(raw || '{}');
			} catch {
				throw new Fault('Invalid request');
			}
			if (!body || typeof body !== 'object' || Array.isArray(body))
				throw new Fault('Invalid request');
			if (name === 'get-public-creator') {
				if (typeof body.username !== 'string' || !/^[a-z0-9_]{3,24}$/.test(body.username))
					throw new Fault('Creator not found', 404);
				const p = checked(
					await db
						.from('creator_profiles')
						.select(
							'id,username,display_name,bio,avatar_path,cover_path,support_cta,support_unit_amount,page_status'
						)
						.eq('username', body.username)
						.in('page_status', ['published', 'paused'])
						.maybeSingle()
				);
				if (!p) throw new Fault('Creator not found', 404);
				const image = (path: string | null, bucket: string) =>
					path ? db.storage.from(bucket).getPublicUrl(path).data.publicUrl : '';
				const gifts = checked(
					await db
						.from('support_transactions')
						.select(
							'id,supporter_name,message,show_name_publicly,show_message_publicly,support_amount,paid_at'
						)
						.eq('creator_id', p.id)
						.eq('status', 'successful')
						.eq('creator_hidden', false)
						.order('paid_at', { ascending: false })
						.limit(30)
				);
				const links = checked(
					await db
						.from('creator_links')
						.select('id,title,url,position')
						.eq('creator_id', p.id)
						.eq('is_visible', true)
						.order('position')
				);
				return respond({
					profile: {
						username: p.username,
						displayName: p.display_name,
						bio: p.bio || '',
						photo: image(p.avatar_path, 'creator-avatars'),
						cover: image(p.cover_path, 'creator-covers'),
						active: p.page_status === 'published',
						unitAmount: p.support_unit_amount / 100,
						cta: p.support_cta
					},
					gifts: gifts.map(publicGift),
					links
				});
			}
			if (name === 'create-payment') {
				secret();
				await limit('payment-ip:' + (req.headers.get('x-forwarded-for') || 'unknown'), 30);
				if (typeof body.username !== 'string' || !/^[a-z0-9_]{3,24}$/.test(body.username))
					throw new Fault('Creator not found', 404);
				const p = checked(
					await db
						.from('creator_profiles')
						.select('id,support_unit_amount,page_status')
						.eq('username', body.username)
						.maybeSingle()
				);
				if (!p || p.page_status !== 'published')
					throw new Fault('This page is not accepting support.');
				let amounts;
				try {
					amounts = paymentInput(body, p.support_unit_amount);
				} catch (e) {
					throw new Fault((e as Error).message);
				}
				await limit('payment-email:' + body.email.toLowerCase(), 10);
				const reference = 'zobo-' + crypto.randomUUID();
				checked(
					await db.from('support_transactions').insert({
						creator_id: p.id,
						provider: 'paystack',
						provider_reference: reference,
						quantity: body.quantity,
						support_amount: amounts.total,
						total_charged: amounts.total,
						platform_fee: amounts.platform,
						creator_net_amount: amounts.net,
						supporter_email: body.email.trim(),
						supporter_name: typeof body.name === 'string' ? body.name.trim().slice(0, 100) : null,
						message: typeof body.note === 'string' ? body.note.trim().slice(0, 500) : null,
						show_name_publicly: body.showName === true,
						show_message_publicly: body.showMessage === true
					})
				);
				const data = await paystack('/transaction/initialize', {
					email: body.email,
					amount: amounts.total,
					currency: 'NGN',
					reference,
					callback_url: appUrl + '/payment/return',
					metadata: { creator_id: p.id }
				});
				if (data.reference !== reference) throw new Error('Provider reference mismatch');
				return respond({ url: safeCheckout(data.authorization_url), reference });
			}
			if (name === 'payment-status') {
				if (!validReference(body.reference)) throw new Fault('Invalid reference');
				await limit('status-ip:' + (req.headers.get('x-forwarded-for') || 'unknown'), 180);
				const p = checked(
					await db
						.from('support_transactions')
						.select('status')
						.eq('provider_reference', body.reference)
						.maybeSingle()
				);
				if (!p) throw new Fault('Payment not found', 404);
				if (p.status === 'pending') {
					const status = await settleCharge(body.reference);
					return respond({
						status:
							status === 'success'
								? 'successful'
								: ['failed', 'abandoned'].includes(status)
									? 'failed'
									: 'pending'
					});
				}
				return respond({ status: p.status });
			}
			const account = await user(req);
			await limit(name + ':' + account.id, 60);
			if (name === 'list-banks') {
				const banks = await paystack('/bank?country=nigeria&currency=NGN&perPage=100');
				return respond({ banks: banks.map((b: any) => ({ code: b.code, name: b.name })) });
			}
			if (name === 'create-payout-account') {
				if (
					typeof body.account !== 'string' ||
					!/^\d{10}$/.test(body.account) ||
					typeof body.bank !== 'string' ||
					!/^\d{3,9}$/.test(body.bank)
				)
					throw new Fault('Choose a bank and enter a 10-digit account number.');
				const resolved = await paystack(
					'/bank/resolve?account_number=' + body.account + '&bank_code=' + body.bank
				);
				const banks = await paystack('/bank?country=nigeria&currency=NGN&perPage=100');
				const bank = banks.find((b: any) => b.code === body.bank);
				if (!bank) throw new Fault('Bank unavailable');
				const recipient = await paystack('/transferrecipient', {
					type: 'nuban',
					name: resolved.account_name,
					account_number: body.account,
					bank_code: body.bank,
					currency: 'NGN'
				});
				checked(
					await db.rpc('save_payout_destination', {
						p_creator: account.id,
						p_recipient: recipient.recipient_code,
						p_bank_code: body.bank,
						p_bank_name: bank.name,
						p_account_name: resolved.account_name,
						p_last4: body.account.slice(-4)
					})
				);
				return respond({
					name: resolved.account_name,
					bank: bank.name,
					last4: body.account.slice(-4)
				});
			}
			if (name === 'create-payout') {
				secret();
				if (
					!validUuid(body.key) ||
					!validUuid(body.destination) ||
					!Number.isSafeInteger(body.amount) ||
					body.amount < 10000
				)
					throw new Fault('Choose an amount of at least ₦100 and a verified bank.');
				const reserved = await db.rpc('reserve_payout', {
					p_creator: account.id,
					p_account: body.destination,
					p_amount: body.amount,
					p_key: body.key
				});
				if (reserved.error)
					throw new Fault(
						'Payout could not be reserved. Check your available balance and bank details.'
					);
				const p = reserved.data;
				if (p.existing) return respond({ id: p.id, status: p.status });
				// A timeout is ambiguous. Keep funds reserved until a signed event or verified reconciliation.
				try {
					await paystack('/transfer', {
						source: 'balance',
						amount: body.amount,
						currency: 'NGN',
						recipient: p.recipient,
						reference: p.reference,
						reason: 'Buy Me Zobo creator payout'
					});
					checked(
						await db
							.from('payouts')
							.update({ status: 'processing' })
							.eq('id', p.id)
							.eq('status', 'pending')
					);
				} catch {
					return respond({
						id: p.id,
						status: 'pending',
						message:
							'Your payout is reserved and awaiting provider confirmation. Do not submit another payout; refresh its status.'
					});
				}
				return respond({ id: p.id, status: 'processing' });
			}
			if (name === 'reconcile-payout') {
				if (!validUuid(body.id)) throw new Fault('Invalid payout');
				const p = checked(
					await db
						.from('payouts')
						.select('provider_reference,status')
						.eq('id', body.id)
						.eq('creator_id', account.id)
						.maybeSingle()
				);
				if (!p) throw new Fault('Payout not found', 404);
				return respond({ status: await settleTransfer(p.provider_reference) });
			}
			throw new Fault('Unknown action', 404);
		} catch (error) {
			// No provider payloads, account numbers, tokens or secrets in logs or errors.
			console.error(name, error instanceof Fault ? error.status : 'internal_error');
			return respond(
				{
					error:
						error instanceof Fault
							? error.message
							: 'This action could not be completed. Please try again.'
				},
				error instanceof Fault ? error.status : 500
			);
		}
	};
}
