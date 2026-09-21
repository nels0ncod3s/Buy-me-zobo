import { writable } from 'svelte/store';
export const notice = writable(null);
let noticeId = 0;
export function notify(message, kind = 'success') {
	notice.set({ id: ++noticeId, message, kind });
}
const reserved = new Set([
	'example',
	'creator',
	'login',
	'signup',
	'dashboard',
	'admin',
	'settings',
	'api',
	'logout',
	'pricing',
	'support',
	'auth',
	'www'
]);
export function validateUsername(value) {
	const username = value.trim().toLowerCase();
	if (!/^[a-z0-9_]{3,24}$/.test(username))
		throw new Error('Use 3–24 letters, numbers, or underscores for your page address.');
	if (reserved.has(username)) throw new Error('That address is reserved. Please choose another.');
	return username;
}
export function creatorPath(username) {
	return `/creator/${encodeURIComponent(username)}`;
}
export function creatorUrl(username) {
	return `${window.location.origin}${creatorPath(username)}`;
}
export async function copyPage(username) {
	if (!username) throw new Error('Create your page first.');
	try {
		await navigator.clipboard.writeText(creatorUrl(username));
	} catch {
		throw new Error(
			'Clipboard access is unavailable. Open your page and copy the address from your browser.'
		);
	}
}
export const naira = (amount) =>
	new Intl.NumberFormat('en-NG', {
		style: 'currency',
		currency: 'NGN',
		minimumFractionDigits: 0,
		maximumFractionDigits: 2
	}).format(amount);
