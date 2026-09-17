import { writable, get } from 'svelte/store';

const KEY = 'zobo-demo-v1';
export const emptyProfile = () => ({
	displayName: '',
	username: '',
	email: '',
	bio: '',
	photo: '',
	active: true,
	bank: null,
	notifications: { support: true, payout: true, digest: false },
	gifts: [],
	payouts: []
});
export const creator = writable(emptyProfile());
export const ready = writable(false);
export const notice = writable(null);
let noticeId = 0;
export function notify(message, kind = 'success') {
	notice.set({ id: ++noticeId, message, kind });
}
export function hydrate() {
	try {
		const saved = JSON.parse(localStorage.getItem(KEY) || 'null');
		if (saved) {
			if (!validProfile(saved)) throw new Error('Invalid saved profile');
			creator.set({
				...emptyProfile(),
				...saved,
				notifications: { ...emptyProfile().notifications, ...saved.notifications }
			});
		}
	} catch {
		creator.set(emptyProfile());
		notify('Your saved demo could not be loaded. You can start a new page.', 'error');
	}
	ready.set(true);
}
function validProfile(saved) {
	return (
		typeof saved === 'object' &&
		['displayName', 'username', 'email', 'bio', 'photo'].every(
			(key) => typeof saved[key] === 'string'
		) &&
		typeof saved.active === 'boolean' &&
		['gifts', 'payouts'].every(
			(key) =>
				Array.isArray(saved[key]) &&
				saved[key].every(
					(entry) =>
						entry &&
						typeof entry.id === 'string' &&
						Number.isSafeInteger(entry.amount) &&
						entry.amount > 0 &&
						typeof entry.date === 'string' &&
						!Number.isNaN(Date.parse(entry.date)) &&
						(key === 'gifts'
							? typeof entry.name === 'string' &&
								entry.name.length > 0 &&
								typeof entry.note === 'string'
							: typeof entry.destination === 'string')
				)
		) &&
		(saved.bank === null ||
			(saved.bank && typeof saved.bank.name === 'string' && /^\d{4}$/.test(saved.bank.last4)))
	);
}
export function saveProfile(patch) {
	const next = { ...get(creator), ...patch };
	try {
		localStorage.setItem(KEY, JSON.stringify(next));
	} catch {
		throw new Error('Could not save on this device. Allow browser storage and try again.');
	}
	creator.set(next);
	return next;
}
const reserved = new Set([
	'example',
	'creator',
	'login',
	'signup',
	'dashboard',
	'admin',
	'settings'
]);
export function validateUsername(value) {
	const username = value.trim().toLowerCase();
	if (!/^[a-z0-9_]{3,24}$/.test(username))
		throw new Error('Use 3–24 letters, numbers, or underscores for your page address.');
	if (reserved.has(username)) throw new Error('That address is reserved. Please choose another.');
	return username;
}
export function createDemo(username, email, displayName) {
	username = validateUsername(username);
	return saveProfile({
		...emptyProfile(),
		username,
		email,
		displayName: displayName.trim() || username
	});
}
export function creatorPath(username) {
	return `/creator/${encodeURIComponent(username)}`;
}
export function creatorUrl(username) {
	return `${window.location.origin}${creatorPath(username)}`;
}
export async function copyPage(username) {
	if (!username) throw new Error('Create your demo page first.');
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
		maximumFractionDigits: 0
	}).format(amount);
export function addGift({ name, note, amount }) {
	const current = get(creator);
	if (!current.username || !current.active)
		throw new Error('This demo page is not accepting support.');
	if (!Number.isSafeInteger(amount) || amount < 100 || amount > 1000000)
		throw new Error('Choose an amount between ₦100 and ₦1,000,000.');
	saveProfile({
		gifts: [
			{
				id: crypto.randomUUID(),
				name: name.trim() || 'A kind supporter',
				note: note.trim(),
				amount,
				date: new Date().toISOString()
			},
			...current.gifts
		]
	});
}
export function connectDemoBank(name, account) {
	if (!name.trim()) throw new Error('Choose a demo bank.');
	if (!/^\d{10}$/.test(account)) throw new Error('Use a 10-digit sample account number.');
	saveProfile({ bank: { name, last4: account.slice(-4) } });
}
export function simulatePayout() {
	const current = get(creator);
	if (!current.bank) throw new Error('Add a demo destination first.');
	const balance =
		current.gifts.reduce((sum, gift) => sum + gift.amount, 0) -
		current.payouts.reduce((sum, payout) => sum + payout.amount, 0);
	if (balance <= 0) throw new Error('Send a test gift to your page first.');
	saveProfile({
		payouts: [
			{
				id: crypto.randomUUID(),
				amount: balance,
				date: new Date().toISOString(),
				destination: `${current.bank.name} · ${current.bank.last4}`
			},
			...current.payouts
		]
	});
}
