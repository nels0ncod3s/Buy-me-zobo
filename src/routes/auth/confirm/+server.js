import { redirect } from '@sveltejs/kit';
export async function GET({ url, locals }) {
	const next =
		url.searchParams.get('next') === '/reset-password' ? '/reset-password' : '/onboarding';
	const code = url.searchParams.get('code'),
		token_hash = url.searchParams.get('token_hash'),
		type = url.searchParams.get('type');
	let result;
	if (code) result = await locals.supabase.auth.exchangeCodeForSession(code);
	else if (token_hash && ['email', 'signup', 'recovery'].includes(type))
		result = await locals.supabase.auth.verifyOtp({ token_hash, type });
	if (!result || result.error) redirect(303, '/login?expired=1');
	redirect(303, type === 'recovery' ? '/reset-password' : next);
}
