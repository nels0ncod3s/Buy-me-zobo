import { redirect } from '@sveltejs/kit';
import { creatorPath } from '$lib/ui.js';
export function load({ params }) {
	redirect(308, creatorPath(params.username));
}
