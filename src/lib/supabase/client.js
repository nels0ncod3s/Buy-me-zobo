import { createBrowserClient } from '@supabase/ssr';
import { supabaseUrl, supabaseKey } from './config.js';
let client;
export function getSupabase() {
	return (client ||= createBrowserClient(supabaseUrl, supabaseKey));
}
export async function edge(name, body = {}) {
	const { data, error } = await getSupabase().functions.invoke(name, { body });
	if (error) {
		let message = 'This action could not be completed. Please try again.';
		try {
			message = (await error.context.json()).error || message;
		} catch {}
		throw new Error(message);
	}
	if (data?.error) throw new Error(data.error);
	return data;
}
