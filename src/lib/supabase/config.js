import { env } from '$env/dynamic/public';
export const supabaseUrl = env.PUBLIC_SUPABASE_URL || 'https://bcamyejfjhvwycpgsiaj.supabase.co';
export const supabaseKey =
	env.PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_hRas6a9Ve6--Ieo5j6eOsQ_URd0w1QT';
export const profileColumns =
	'id,username,display_name,bio,avatar_path,cover_path,category,location,support_cta,support_unit_amount,currency,page_status,accent_theme';
export function photoUrl(path, bucket = 'creator-avatars') {
	return path
		? supabaseUrl +
				'/storage/v1/object/public/' +
				bucket +
				'/' +
				path.split('/').map(encodeURIComponent).join('/')
		: '';
}
