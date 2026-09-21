import { fail, redirect } from '@sveltejs/kit';
import { validateUsername } from '$lib/ui.js';
import { rememberVerification } from './verification.js';
const value = (f, k) => String(f.get(k) || '').trim();
export const actionsFor = (mode) => ({
	default: async ({ request, locals, url, cookies }) => {
		const f = await request.formData(),
			email = value(f, 'email'),
			password = String(f.get('password') || '');
		const client = locals.supabase;
		if (mode === 'login') {
			const { error } = await client.auth.signInWithPassword({ email, password });
			if (error)
				return fail(400, {
					error: 'Could not sign in. Check your email and password, and confirm your email first.'
				});
			redirect(303, '/dashboard');
		}
		if (mode === 'signup') {
			let username = '';
			try {
				if (value(f, 'username')) username = validateUsername(value(f, 'username'));
			} catch (e) {
				return fail(400, { error: e.message });
			}
			if (password.length < 10)
				return fail(400, { error: 'Use at least 10 characters for your password.' });
			const { data, error } = await client.auth.signUp({
				email,
				password,
				options: { emailRedirectTo: url.origin + '/auth/confirm', data: { username } }
			});
			if (error) return fail(400, { error: error.message });
			if (data.session) redirect(303, '/onboarding');
			rememberVerification(cookies, email);
			redirect(303, '/verify-email');
		}
		if (mode === 'forgot-password') {
			const { error } = await client.auth.resetPasswordForEmail(email, {
				redirectTo: url.origin + '/auth/confirm?next=/reset-password'
			});
			if (error)
				return fail(400, {
					error: 'A reset link could not be sent right now. Please try again shortly.'
				});
			return { success: 'If an account exists for this email, a reset link is on its way.' };
		}
		if (mode === 'reset-password') {
			if (password.length < 10)
				return fail(400, { error: 'Use at least 10 characters for your password.' });
			const { error } = await client.auth.updateUser({ password });
			if (error) return fail(400, { error: error.message });
			await client.auth.signOut();
			redirect(303, '/login?reset=1');
		}
		if (mode === 'onboarding') {
			let username;
			try {
				username = validateUsername(value(f, 'username'));
			} catch (e) {
				return fail(400, { error: e.message });
			}
			const name = value(f, 'displayName');
			if (!name || name.length > 60)
				return fail(400, { error: 'Add a display name of up to 60 characters.' });
			const { error } = await client.rpc('create_creator', { p_username: username, p_name: name });
			if (error)
				return fail(400, {
					error:
						error.code === '23505'
							? 'That page address is already taken. Choose another.'
							: 'Could not create your page. Please try again.'
				});
			redirect(303, '/dashboard');
		}
	}
});
