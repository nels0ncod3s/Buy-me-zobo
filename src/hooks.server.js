import { createServerClient } from '@supabase/ssr';
import { redirect } from '@sveltejs/kit';
import { supabaseUrl, supabaseKey } from '$lib/supabase/config.js';
export async function handle({ event, resolve }) {
	event.locals.supabase = createServerClient(supabaseUrl, supabaseKey, {
		cookies: {
			getAll: () => event.cookies.getAll(),
			setAll: (cookies) =>
				cookies.forEach(({ name, value, options }) =>
					event.cookies.set(name, value, { ...options, path: '/' })
				)
		}
	});
	const {
		data: { user }
	} = await event.locals.supabase.auth.getUser();
	event.locals.user = user;
	if (
		(event.url.pathname.startsWith('/dashboard') ||
			['/onboarding', '/reset-password'].includes(event.url.pathname)) &&
		!user
	)
		redirect(303, '/login');
	return resolve(event, {
		filterSerializedResponseHeaders: (name) =>
			name === 'content-range' || name === 'x-supabase-api-version'
	});
}
