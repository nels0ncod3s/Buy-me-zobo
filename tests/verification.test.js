import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
	pendingVerification,
	rememberVerification,
	verificationActions,
	verificationCookie
} from '../src/lib/server/verification.js';
function context(age = 0, token = '123456', auth = {}) {
	const values = new Map([
		[verificationCookie, JSON.stringify({ email: 'test@example.test', sentAt: Date.now() - age })]
	]);
	return {
		cookies: {
			get: (k) => values.get(k),
			set: (k, v) => values.set(k, v),
			delete: (k) => values.delete(k)
		},
		locals: { supabase: { auth } },
		request: new Request('https://example.test/verify-email', {
			method: 'POST',
			body: new URLSearchParams({ code: token })
		})
	};
}
test('missing and expired verification cannot call authentication', async () => {
	let calls = 0;
	const auth = {
		verifyOtp: async () => {
			calls++;
		}
	};
	const expired = context(600001, '123456', auth);
	assert.equal((await verificationActions.verify(expired)).status, 400);
	const missing = context(0, '123456', auth);
	missing.cookies.delete(verificationCookie);
	await assert.rejects(
		() => verificationActions.verify(missing),
		(e) => e.status === 303 && e.location === '/signup'
	);
	assert.equal(calls, 0);
});
test('rejects incomplete codes and incorrect provider responses', async () => {
	assert.equal((await verificationActions.verify(context(0, '123'))).status, 400);
	const result = await verificationActions.verify(
		context(0, '123456', { verifyOtp: async () => ({ error: { message: 'expired' }, data: {} }) })
	);
	assert.equal(result.status, 400);
});
test('successful verification establishes session then advances registration', async () => {
	const ctx = context(0, '123456', {
		verifyOtp: async (args) => {
			assert.deepEqual(args, { email: 'test@example.test', token: '123456', type: 'email' });
			return { data: { session: { user: {} } }, error: null };
		}
	});
	await assert.rejects(
		() => verificationActions.verify(ctx),
		(e) => e.status === 303 && e.location === '/onboarding'
	);
	assert.equal(pendingVerification(ctx.cookies), null);
});
test('resend waits a minute and only restarts expiry after successful delivery request', async () => {
	const blocked = context(0);
	assert.equal((await verificationActions.resend(blocked)).status, 429);
	const failed = context(61000, '', { resend: async () => ({ error: {} }) });
	const old = pendingVerification(failed.cookies).sentAt;
	assert.equal((await verificationActions.resend(failed)).status, 400);
	assert.equal(pendingVerification(failed.cookies).sentAt, old);
	const ok = context(61000, '', {
		resend: async (args) => {
			assert.equal(args.type, 'signup');
			return { error: null };
		}
	});
	assert.ok((await verificationActions.resend(ok)).success);
	assert.ok(Date.now() - pendingVerification(ok.cookies).sentAt < 1000);
});
test('malformed pending state safely recovers', () => {
	assert.equal(pendingVerification({ get: () => '{bad' }), null);
	assert.equal(
		pendingVerification({ get: () => JSON.stringify({ email: 'test', sentAt: 'yesterday' }) }),
		null
	);
	const ctx = context();
	rememberVerification(ctx.cookies, 'new@example.test');
	assert.equal(pendingVerification(ctx.cookies).email, 'new@example.test');
});
