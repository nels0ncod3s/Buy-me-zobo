// Optional live integration test. Use a disposable, confirmed test account.
// Pass TEST_EMAIL, TEST_PASSWORD and TEST_USERNAME via environment variables.
import { spawn } from 'node:child_process';
import assert from 'node:assert/strict';
import { createClient } from '@supabase/supabase-js';
const origin = 'http://127.0.0.1:5173';
const server = spawn('npm', ['run', 'dev', '--', '--host', '127.0.0.1'], {
	stdio: ['ignore', 'pipe', 'pipe'],
	detached: true
});
const jar = new Map();
const email = process.env.TEST_EMAIL,
	password = process.env.TEST_PASSWORD,
	username = process.env.TEST_USERNAME;
if (!email || !password || !username)
	throw new Error('Provide disposable test account credentials.');
const db = createClient(
	'https://bcamyejfjhvwycpgsiaj.supabase.co',
	'sb_publishable_hRas6a9Ve6--Ieo5j6eOsQ_URd0w1QT',
	{ auth: { persistSession: false } }
);
async function request(path, body) {
	const response = await fetch(origin + path, {
		method: body ? 'POST' : 'GET',
		redirect: 'manual',
		headers: {
			Accept: 'text/html',
			Origin: origin,
			Cookie: [...jar].map(([k, v]) => k + '=' + v).join('; '),
			...(body ? { 'Content-Type': 'application/x-www-form-urlencoded' } : {})
		},
		body: body ? new URLSearchParams(body) : undefined
	});
	for (const cookie of response.headers.getSetCookie()) {
		const [pair] = cookie.split(';'),
			i = pair.indexOf('=');
		const name = pair.slice(0, i),
			value = pair.slice(i + 1);
		if (value) jar.set(name, value);
		else jar.delete(name);
	}
	return response;
}
try {
	await new Promise((resolve, reject) => {
		const timer = setTimeout(() => reject(new Error('Server startup timed out')), 15000);
		server.stdout.on('data', (d) => {
			if (String(d).includes('Local:')) {
				clearTimeout(timer);
				resolve();
			}
		});
		server.on('exit', () => reject(new Error('Server exited before ready')));
	});
	assert.equal((await request('/login')).status, 200);
	assert.equal((await request('/dashboard')).status, 303);
	assert.equal((await request('/signup', { email, password: 'short' })).status, 400);
	assert.equal((await request('/login', { email, password: 'wrong-password' })).status, 400);
	const login = await request('/login', { email, password });
	assert.equal(login.status, 303);
	assert.ok(jar.size);
	if (!process.env.TEST_AUTH_ONLY) {
		const onboard = await request('/onboarding', { username, displayName: 'Integration Creator' });
		assert.equal(onboard.status, 303);
		for (const path of [
			'/dashboard',
			'/dashboard/settings',
			'/dashboard/supporters',
			'/dashboard/payouts'
		]) {
			const response = await request(path);
			assert.equal(response.status, 200, path);
			assert.match(await response.text(), /Integration Creator/);
		}
		console.log(
			'Real login, cookie session, onboarding, protected routes and all dashboard loads passed.'
		);
		const { data, error } = await db.auth.signInWithPassword({ email, password });
		assert.equal(error, null);
		const id = data.user.id;
		assert.equal(
			(
				await db
					.from('creator_profiles')
					.update({ bio: 'Persistent profile', support_unit_amount: 200000 })
					.eq('id', id)
			).error,
			null
		);
		const link = await db
			.from('creator_links')
			.insert({ creator_id: id, title: 'Work', url: 'https://example.com', is_visible: false })
			.select('id')
			.single();
		assert.equal(link.error, null);
		const publicPage = await fetch(
			'https://bcamyejfjhvwycpgsiaj.supabase.co/functions/v1/get-public-creator',
			{ method: 'POST', body: JSON.stringify({ username }) }
		);
		assert.equal(publicPage.status, 200);
		const publicData = await publicPage.json();
		assert.equal(publicData.profile.bio, 'Persistent profile');
		assert.equal(publicData.profile.unitAmount, 2000);
		assert.equal(publicData.links.length, 0);
		assert.equal(JSON.stringify(publicData).includes(email), false);
		assert.equal(
			(
				await db
					.from('creator_links')
					.update({ is_visible: true, title: 'Updated work' })
					.eq('id', link.data.id)
			).error,
			null
		);
		assert.equal((await db.from('creator_links').delete().eq('id', link.data.id)).error, null);
		const image = Buffer.from(
			'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aF1cAAAAASUVORK5CYII=',
			'base64'
		);
		const imagePath = id + '/integration.png';
		assert.equal(
			(
				await db.storage
					.from('creator-avatars')
					.upload(imagePath, image, { contentType: 'image/png' })
			).error,
			null
		);
		assert.ok(
			(
				await db.storage
					.from('creator-avatars')
					.upload(crypto.randomUUID() + '/intruder.png', image, { contentType: 'image/png' })
			).error
		);
		assert.ok(
			(
				await db.storage
					.from('creator-avatars')
					.upload(id + '/invalid.txt', 'test', { contentType: 'text/plain' })
			).error
		);
		assert.ok(
			(
				await db.storage
					.from('creator-avatars')
					.upload(id + '/oversized.png', Buffer.alloc(2097153), { contentType: 'image/png' })
			).error
		);
		assert.equal((await db.storage.from('creator-avatars').remove([imagePath])).error, null);
		console.log(
			'Profile persistence, public privacy, link CRUD and Storage ownership/type/size checks passed.'
		);
	}
	const changedPassword = 'Changed-' + password.slice(0, 40);
	const resetResponse = await request('/reset-password', { password: changedPassword });
	assert.equal(
		resetResponse.status,
		303,
		(await resetResponse.text()).match(/role="alert"[^>]*>([^<]*)/)?.[1] || 'Password update failed'
	);
	assert.equal((await request('/dashboard')).status, 303);
	assert.equal((await request('/login', { email, password: changedPassword })).status, 303);
	assert.equal((await request('/logout', {})).status, 200);
	assert.equal((await request('/dashboard')).status, 303);
	console.log('Password change, sign-in with new password, logout and route protection passed.');
	await db.auth.signOut();
} finally {
	try {
		process.kill(-server.pid, 'SIGTERM');
	} catch {}
}
