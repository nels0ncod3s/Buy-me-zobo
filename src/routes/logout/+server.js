import { json } from '@sveltejs/kit';
export async function POST({ locals, request, url }) {
	if (request.headers.get('origin') !== url.origin)
		return json({ error: 'Invalid origin' }, { status: 403 });
	const { error } = await locals.supabase.auth.signOut();
	return json(error ? { error: 'Could not sign out. Please try again.' } : { success: true }, {
		status: error ? 500 : 200
	});
}
