import { actionsFor } from '$lib/server/auth.js';
export const actions = actionsFor('onboarding');
import { redirect } from '@sveltejs/kit';
export async function load({ locals }) {
	const { data } = await locals.supabase
		.from('creator_profiles')
		.select('id')
		.eq('id', locals.user.id)
		.maybeSingle();
	if (data) redirect(303, '/dashboard');
	return {
		suggestedUsername:
			typeof locals.user.user_metadata?.username === 'string'
				? locals.user.user_metadata.username.slice(0, 24)
				: ''
	};
}
