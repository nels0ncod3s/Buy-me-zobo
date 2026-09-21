import { error } from '@sveltejs/kit';
import { supabaseUrl, supabaseKey } from '$lib/supabase/config.js';
export async function load({ params, fetch, setHeaders }) {
	if (!/^[a-z0-9_]{3,24}$/.test(params.username)) error(404, 'Creator not found.');
	const response = await fetch(supabaseUrl + '/functions/v1/get-public-creator', {
		method: 'POST',
		headers: { apikey: supabaseKey, 'Content-Type': 'application/json' },
		body: JSON.stringify({ username: params.username })
	});
	if (!response.ok)
		error(
			response.status === 404 ? 404 : 503,
			response.status === 404
				? 'This creator page is not here yet.'
				: 'This page could not be loaded. Please try again.'
		);
	// Public projection only: no session lookup or personalized HTML on this route.
	setHeaders({ 'cache-control': 'public, max-age=0, s-maxage=15' });
	return await response.json();
}
