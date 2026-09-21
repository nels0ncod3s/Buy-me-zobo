import { fail, redirect } from '@sveltejs/kit';
export const verificationCookie = 'zobo_pending_signup';
export function pendingVerification(cookies) {
	try {
		const p = JSON.parse(cookies.get(verificationCookie) || 'null');
		return p && typeof p.email === 'string' && Number.isFinite(p.sentAt) ? p : null;
	} catch {
		return null;
	}
}
export function rememberVerification(cookies, email) {
	const pending = { email, sentAt: Date.now() };
	cookies.set(verificationCookie, JSON.stringify(pending), {
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		maxAge: 3600
	});
	return pending;
}
export const verificationActions = {
	verify: async ({ request, locals, cookies }) => {
		const pending = pendingVerification(cookies);
		if (!pending) redirect(303, '/signup');
		if (Date.now() - pending.sentAt >= 600000)
			return fail(400, { error: 'This code has expired. Request a new code below.' });
		const form = await request.formData(),
			token = String(form.get('code') || '');
		if (!/^[0-9]{6}$/.test(token))
			return fail(400, { error: 'Enter all six digits from your email.' });
		const { data, error } = await locals.supabase.auth.verifyOtp({
			email: pending.email,
			token,
			type: 'email'
		});
		if (error || !data.session)
			return fail(400, {
				error: 'That code is incorrect or has expired. Check it or request a new one.'
			});
		cookies.delete(verificationCookie, { path: '/' });
		redirect(303, '/onboarding');
	},
	resend: async ({ locals, cookies }) => {
		const pending = pendingVerification(cookies);
		if (!pending) redirect(303, '/signup');
		if (Date.now() - pending.sentAt < 60000)
			return fail(429, { error: 'Please wait a minute before requesting another code.' });
		const { error } = await locals.supabase.auth.resend({ type: 'signup', email: pending.email });
		if (error)
			return fail(400, { error: 'We could not resend your code. Please try again shortly.' });
		rememberVerification(cookies, pending.email);
		return { success: 'A fresh code is on its way. Check your inbox and spam folder.' };
	}
};
