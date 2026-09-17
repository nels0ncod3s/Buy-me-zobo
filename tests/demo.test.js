import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { get } from 'svelte/store';
import {
	creator,
	ready,
	notice,
	emptyProfile,
	createDemo,
	hydrate,
	saveProfile,
	addGift,
	validateUsername,
	connectDemoBank,
	simulatePayout
} from '../src/lib/demo.js';
let saved;
beforeEach(() => {
	saved = null;
	globalThis.localStorage = {
		getItem: () => saved,
		setItem: (_key, value) => {
			saved = value;
		}
	};
	creator.set(emptyProfile());
	ready.set(false);
	notice.set(null);
});
test('a chosen identity and profile edits survive reload with gift history intact', () => {
	createDemo('  ade_stories  ', 'ade@example.test', 'Ade Writer');
	addGift({ name: 'Tomi', note: 'Keep writing!', amount: 3000 });
	saveProfile({ displayName: 'Ade Stories', bio: 'Everyday Lagos stories.' });
	creator.set(emptyProfile());
	hydrate();
	assert.equal(get(creator).username, 'ade_stories');
	assert.equal(get(creator).displayName, 'Ade Stories');
	assert.equal(get(creator).gifts[0].amount, 3000);
	assert.equal(get(creator).gifts[0].note, 'Keep writing!');
	assert.equal(get(ready), true);
});
test('failed persistence never reports a profile change or a delivered gift', () => {
	createDemo('ade', 'ade@example.test', 'Ade');
	const original = get(creator);
	globalThis.localStorage.setItem = () => {
		throw new Error('quota exceeded');
	};
	assert.throws(() => saveProfile({ displayName: 'Changed' }), /Could not save/);
	assert.throws(() => addGift({ name: 'Tomi', note: '', amount: 1000 }), /Could not save/);
	assert.deepEqual(get(creator), original);
});
test('malformed stored data recovers to a usable empty workspace with feedback', () => {
	for (const value of [
		'{bad json',
		JSON.stringify({ username: 'ade', gifts: null }),
		JSON.stringify({ ...emptyProfile(), gifts: [{ id: 'bad', amount: '1000' }] })
	]) {
		saved = value;
		hydrate();
		assert.deepEqual(get(creator), emptyProfile());
		assert.equal(get(ready), true);
		assert.equal(get(notice).kind, 'error');
	}
});
test('paused pages reject test gifts and preserve their existing history', () => {
	createDemo('ade', '', 'Ade');
	addGift({ name: '', note: '', amount: 1000 });
	saveProfile({ active: false });
	assert.throws(() => addGift({ name: 'Tomi', note: '', amount: 2000 }), /not accepting support/);
	assert.equal(get(creator).gifts.length, 1);
	saveProfile({ active: true });
	addGift({ name: 'Tomi', note: 'Welcome back', amount: 2000 });
	assert.equal(get(creator).gifts.length, 2);
});
test('demo payouts only consume the current balance once and retain masked destinations', () => {
	createDemo('ade', '', 'Ade');
	assert.throws(() => simulatePayout(), /destination first/);
	assert.throws(() => connectDemoBank('Demo bank', '123'), /10-digit/);
	connectDemoBank('Demo bank', '0123456789');
	assert.deepEqual(get(creator).bank, { name: 'Demo bank', last4: '6789' });
	assert.equal(saved.includes('0123456789'), false);
	addGift({ name: 'Tomi', note: '', amount: 3000 });
	simulatePayout();
	assert.equal(get(creator).payouts[0].amount, 3000);
	assert.throws(() => simulatePayout(), /test gift/);
	addGift({ name: 'Bisi', note: '', amount: 1000 });
	simulatePayout();
	assert.equal(get(creator).payouts[0].amount, 1000);
	creator.set(emptyProfile());
	hydrate();
	assert.equal(get(creator).payouts.length, 2);
});
test('invalid usernames and amounts cannot create unusable pages or balances', () => {
	for (const username of ['ab', 'dashboard', 'space name', 'a'.repeat(25)])
		assert.throws(() => validateUsername(username));
	createDemo('ade', '', 'Ade');
	for (const amount of [0, -100, 100.5, NaN, Infinity, 1000001])
		assert.throws(() => addGift({ name: 'Tomi', note: '', amount }));
	assert.equal(get(creator).gifts.length, 0);
});
