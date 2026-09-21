import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
	paymentInput,
	publicGift,
	safeCheckout,
	validReference
} from '../supabase/functions/_shared/rules.mjs';
import { validateUsername } from '../src/lib/ui.js';
test('payment amount comes only from stored unit price and validated quantity', () => {
	const body = { quantity: 3, email: 'supporter@example.com', amount: 1, fee: 0, net: 999999 };
	assert.deepEqual(paymentInput(body, 100000), { total: 300000, platform: 15000, net: 285000 });
	for (const quantity of [0, -1, 101, 1.5, '3', NaN])
		assert.throws(() => paymentInput({ ...body, quantity }, 100000));
	assert.throws(() => paymentInput(body, 100000000));
	assert.throws(() => paymentInput({ ...body, email: 'invalid' }, 100000));
});
test('public feed independently masks names and messages and never returns private fields', () => {
	const gift = {
		id: 'gift',
		supporter_name: 'Tomi',
		message: 'Private note',
		support_amount: 100000,
		paid_at: '2026-09-21',
		supporter_email: 'secret@example.com',
		provider_reference: 'secret',
		creator_id: 'secret',
		show_name_publicly: false,
		show_message_publicly: false
	};
	const masked = publicGift(gift);
	assert.equal(masked.name, 'A kind supporter');
	assert.equal(masked.note, '');
	assert.deepEqual(Object.keys(masked).sort(), ['amount', 'date', 'id', 'name', 'note']);
	assert.equal(publicGift({ ...gift, show_name_publicly: true }).name, 'Tomi');
	assert.equal(publicGift({ ...gift, show_message_publicly: true }).note, 'Private note');
	assert.equal(publicGift({ ...gift, show_message_publicly: true }).name, 'A kind supporter');
});
test('payment redirects and status references are constrained', () => {
	assert.equal(
		safeCheckout('https://checkout.paystack.com/example'),
		'https://checkout.paystack.com/example'
	);
	for (const url of [
		'https://checkout.paystack.com.evil.test',
		'http://checkout.paystack.com',
		'javascript:alert(1)',
		'https://evil.test'
	])
		assert.throws(() => safeCheckout(url));
	assert.equal(validReference('zobo-' + crypto.randomUUID()), true);
	assert.equal(validReference('../secret'), false);
});
test('creator usernames normalize and reject invalid or reserved addresses', () => {
	assert.equal(validateUsername('  My_Page '), 'my_page');
	for (const name of ['ab', 'dashboard', 'bad name', 'a'.repeat(25)])
		assert.throws(() => validateUsername(name));
});
