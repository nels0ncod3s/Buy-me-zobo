export function paymentInput(body, price) {
	if (!Number.isSafeInteger(body.quantity) || body.quantity < 1 || body.quantity > 100)
		throw new Error('Choose between 1 and 100 zobos.');
	if (
		typeof body.email !== 'string' ||
		body.email.length > 320 ||
		!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)
	)
		throw new Error('Enter a valid email address.');
	const total = price * body.quantity;
	if (!Number.isSafeInteger(total) || total < 10000 || total > 100000000)
		throw new Error('Support must be between ₦100 and ₦1,000,000.');
	const platform = Math.round(total * 0.05);
	return { total, platform, net: total - platform };
}
export function publicGift(g) {
	return {
		id: g.id,
		name: g.show_name_publicly ? g.supporter_name || 'A kind supporter' : 'A kind supporter',
		note: g.show_message_publicly ? g.message || '' : '',
		amount: g.support_amount / 100,
		date: g.paid_at
	};
}
export function validReference(ref) {
	return typeof ref === 'string' && /^zobo-[a-f0-9-]{36}$/.test(ref);
}
export function validUuid(value) {
	return (
		typeof value === 'string' &&
		/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(value)
	);
}
export function safeCheckout(value) {
	const url = new URL(value);
	if (url.protocol !== 'https:' || url.hostname !== 'checkout.paystack.com')
		throw new Error('Unexpected payment provider address.');
	return url.href;
}
