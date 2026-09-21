import { getSupabase } from './supabase/client.js';
import { invalidateAll } from '$app/navigation';
export async function saveProfile(patch) {
	const db = getSupabase(),
		{
			data: { user }
		} = await db.auth.getUser();
	if (!user) throw new Error('Please sign in again.');
	const mapping = {
		displayName: 'display_name',
		username: 'username',
		bio: 'bio',
		unitAmount: 'support_unit_amount',
		cta: 'support_cta'
	};
	const update = {};
	for (const [key, column] of Object.entries(mapping))
		if (key in patch)
			update[column] = key === 'unitAmount' ? Math.round(patch[key] * 100) : patch[key];
	if ('active' in patch) update.page_status = patch.active ? 'published' : 'paused';
	if (Object.keys(update).length) {
		const { error } = await db.from('creator_profiles').update(update).eq('id', user.id);
		if (error)
			throw new Error(error.code === '23505' ? 'That page address is taken.' : error.message);
	}
	if (patch.notifications) {
		const n = patch.notifications;
		const { error } = await db.from('creator_preferences').upsert({
			creator_id: user.id,
			notify_support: n.support,
			notify_payout: n.payout,
			weekly_digest: n.digest
		});
		if (error) throw new Error('Profile saved, but preferences could not be saved. Please retry.');
	}
	await invalidateAll();
}
export async function uploadImage(file, kind = 'avatar') {
	const limit = kind === 'avatar' ? 2 : 5;
	if (
		!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) ||
		file.size > limit * 1024 * 1024
	)
		throw new Error('Choose a JPG, PNG or WebP smaller than ' + limit + ' MB.');
	const db = getSupabase(),
		{
			data: { user }
		} = await db.auth.getUser();
	if (!user) throw new Error('Please sign in again.');
	const path =
		user.id +
		'/' +
		crypto.randomUUID() +
		'.' +
		{ 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' }[file.type];
	const bucket = kind === 'avatar' ? 'creator-avatars' : 'creator-covers';
	const { error } = await db.storage.from(bucket).upload(path, file, { contentType: file.type });
	if (error) throw new Error(error.message);
	const result = await db
		.from('creator_profiles')
		.update({ [kind + '_path']: path })
		.eq('id', user.id);
	if (result.error) {
		await db.storage.from(bucket).remove([path]);
		throw new Error('Image could not be saved.');
	}
	await invalidateAll();
}
export async function logout() {
	const response = await fetch('/logout', { method: 'POST' });
	if (!response.ok) throw new Error('Could not sign out. Please try again.');
	window.location.assign('/login');
}
