import { redirect } from '@sveltejs/kit';
import { pendingVerification, verificationActions } from '$lib/server/verification.js';
export const actions = verificationActions;
export function load({ cookies, setHeaders }) {
	setHeaders({ 'cache-control': 'private, no-store' });
	const pending = pendingVerification(cookies);
	if (!pending) redirect(303, '/signup');
	return { email: pending.email, sentAt: pending.sentAt };
}
