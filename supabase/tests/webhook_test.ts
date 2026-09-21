// Isolated handler test: all outbound HTTP is mocked; no real provider calls.
Deno.env.set('SUPABASE_URL', 'https://supabase.test');
Deno.env.set('SUPABASE_SERVICE_ROLE_KEY', 'test-only-key');
Deno.env.set('PAYSTACK_SECRET_KEY', 'test-only-paystack-secret');
const calls: Array<{ url: string; body: unknown }> = [];
const reference = 'zobo-' + crypto.randomUUID();
globalThis.fetch = async (input, init) => {
	const url = String(input);
	calls.push({ url, body: init?.body ? JSON.parse(String(init.body)) : null });
	if (url.includes('/transaction/verify/'))
		return Response.json({
			status: true,
			data: { reference, status: 'success', amount: 100000, currency: 'NGN', fees: 1500 }
		});
	if (url.includes('/rpc/settle_support')) return Response.json(null);
	throw new Error('Unexpected outbound request');
};
const { handler } = await import('../functions/_shared/handler.ts');
const serve = handler('payment-webhook');
const raw = JSON.stringify({ event: 'charge.success', data: { reference, amount: 1 } });
async function signature(body: string) {
	const key = await crypto.subtle.importKey(
		'raw',
		new TextEncoder().encode('test-only-paystack-secret'),
		{ name: 'HMAC', hash: 'SHA-512' },
		false,
		['sign']
	);
	return Array.from(
		new Uint8Array(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(body)))
	)
		.map((n) => n.toString(16).padStart(2, '0'))
		.join('');
}
Deno.test('unsigned and tampered webhooks never call the provider or database', async () => {
	calls.length = 0;
	const unsigned = await serve(new Request('https://edge.test', { method: 'POST', body: raw }));
	if (unsigned.status !== 401 || calls.length) throw new Error('Unsigned webhook accepted');
	const tampered = await serve(
		new Request('https://edge.test', {
			method: 'POST',
			body: raw + ' ',
			headers: { 'x-paystack-signature': await signature(raw) }
		})
	);
	if (tampered.status !== 401 || calls.length) throw new Error('Tampered webhook accepted');
});
Deno.test(
	'valid webhook uses verified provider amount and atomically settles through RPC',
	async () => {
		calls.length = 0;
		const response = await serve(
			new Request('https://edge.test', {
				method: 'POST',
				body: raw,
				headers: { 'x-paystack-signature': await signature(raw) }
			})
		);
		if (response.status !== 200 || calls.length !== 2)
			throw new Error('Valid webhook did not settle');
		const settlement = calls[1].body as Record<string, unknown>;
		if (
			settlement.p_amount !== 100000 ||
			settlement.p_fee !== 1500 ||
			settlement.p_reference !== reference
		)
			throw new Error('Unverified payment values used');
	}
);
