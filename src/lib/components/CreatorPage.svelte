<script>
	import { naira, copyPage, notify } from '$lib/ui.js';
	import { edge } from '$lib/supabase/client.js';
	import Brand from './Brand.svelte';
	import ZoboCup from './ZoboCup.svelte';
	import ActionButton from './ActionButton.svelte';
	import { Heart, ArrowUpRight, Check, Copy, ShieldCheck } from '@lucide/svelte';
	let { example = false, profileData = null, giftData = [], links = [] } = $props();
	let email = $state(''),
		showName = $state(false),
		showMessage = $state(false);
	const amara = {
		displayName: 'Amara Okafor',
		username: 'amara',
		bio: 'Finding the extraordinary in everyday Lagos. I write little stories about food, people, and the moments we almost miss.',
		photo: '',
		active: true
	};
	let profile = $derived(example ? amara : profileData);
	let quantity = $state(1),
		name = $state(''),
		note = $state(''),
		sent = $state(false);
	let amount = $derived(quantity * (profile.unitAmount || 1000));
	let busy = $state(false),
		error = $state('');
	let exampleGifts = $state([
		{
			id: '1',
			name: 'Tomi',
			note: 'Your stories feel like a conversation with an old friend.',
			amount: 3000
		},
		{ id: '2', name: 'A kind stranger', note: 'For the next story. Keep going!', amount: 1000 }
	]);
	let gifts = $derived(example ? exampleGifts : giftData);
	async function send(e) {
		e.preventDefault();
		if (busy) return;
		busy = true;
		error = '';
		try {
			await new Promise((resolve) => setTimeout(resolve, 300));
			if (!profile.active) throw new Error('This page is paused. Support is unavailable.');
			if (example)
				exampleGifts = [
					{
						id: crypto.randomUUID(),
						name: name.trim() || 'A kind supporter',
						note: note.trim(),
						amount
					},
					...exampleGifts
				];
			else {
				const result = await edge('create-payment', {
					username: profile.username,
					quantity,
					email,
					name,
					note,
					showName,
					showMessage
				});
				const url = new URL(result.url);
				if (url.protocol !== 'https:' || url.hostname !== 'checkout.paystack.com')
					throw new Error('Payment address could not be verified.');
				window.location.assign(url.href);
				return;
			}
			sent = true;
			notify('Your test zobo was delivered. No payment was taken.');
			name = '';
			note = '';
		} catch (err) {
			error = err.message || 'Could not start your payment. Please try again.';
			notify(error, 'error');
		} finally {
			busy = false;
		}
	}
</script>

<svelte:head
	><title>{profile.displayName || 'Your page'} — Buy Me Zobo</title><meta
		name="robots"
		content="noindex,nofollow"
	/></svelte:head
>
<div class="creator-page">
	<header class="creator-header wrap">
		<Brand /><a class="button secondary small" href="/signup"
			>Start your own page <ArrowUpRight size={15} /></a
		>
	</header>
	<div
		class="creator-cover"
		style:background-image={profile.cover ? `url("${profile.cover}")` : undefined}
		style:background-size="cover"
		style:background-position="center"
	>
		<span class="cover-flower">✳</span>
		<div class="cover-type serif italic">Good things take heart.</div>
		<ZoboCup class="cover-cup" />
	</div>
	<main class="creator-body wrap">
		<div class="creator-story">
			<span class="creator-avatar"
				>{#if profile.photo}<img src={profile.photo} alt={profile.displayName} />{:else}<span
						class="serif italic">{(profile.displayName || 'Y')[0].toLowerCase()}.</span
					>{/if}</span
			><span class="badge">{example ? 'EXAMPLE CREATOR' : 'CREATOR PAGE'}</span>
			<h1>{profile.displayName || 'Your creative corner'}</h1>
			<span class="creator-handle">@{profile.username}</span>
			<p class="creator-bio">
				{profile.bio ||
					'This is your little corner of the internet. Add your story in Settings and tell your people what keeps you creating.'}
			</p>
			<div class="creator-sharing">
				{#if example}<span class="creator-location">Stories & everyday Lagos</span
					>{:else}<ActionButton
						class="button secondary small"
						action={() => copyPage(profile.username)}
						success="Your page link is copied."
						busyLabel="Copying…"><Copy size={14} /> Copy page link</ActionButton
					>{/if}
			</div>
		</div>
		{#if links.length}<nav class="creator-links" aria-label="Creator links">
				{#each links as link}<a
						class="button secondary small"
						href={link.url}
						target="_blank"
						rel="noopener noreferrer">{link.title} ↗</a
					>{/each}
			</nav>{/if}
		<aside class="support-column">
			<section class="support-widget panel">
				<div class="widget-title">
					<ZoboCup class="widget-cup" />
					<div>
						<span class="eyebrow">A LITTLE LOVE GOES A LONG WAY</span>
						<h2>Buy {profile.displayName.split(' ')[0] || 'me'} a zobo.</h2>
					</div>
				</div>
				{#if profile.active}<form onsubmit={send}>
						{#if !example}<label class="field"
								>Email for your receipt<input
									type="email"
									bind:value={email}
									maxlength="320"
									autocomplete="email"
									required
								/><small>Your email stays private.</small></label
							>{/if}
						<fieldset class="field">
							<legend>How much kindness?</legend>
							<div class="quantity-picker">
								{#each [1, 3, 5] as q}<button
										type="button"
										class:selected={quantity === q}
										aria-pressed={quantity === q}
										onclick={() => {
											quantity = q;
											sent = false;
										}}>{q} {q === 1 ? 'zobo' : 'zobos'}</button
									>{/each}
							</div>
						</fieldset>
						<label class="field"
							>Your name <span class="optional">optional</span><input
								bind:value={name}
								maxlength="60"
								placeholder="A kind supporter"
								autocomplete="name"
							/></label
						><label class="field"
							>Leave a little good word <span class="optional">optional</span><textarea
								bind:value={note}
								maxlength="300"
								rows="3"
								placeholder="Your work made my day…"></textarea></label
						>
						{#if !example}<label class="consent"
								><input type="checkbox" bind:checked={showName} /> Show my name on the public gift wall</label
							><label class="consent"
								><input type="checkbox" bind:checked={showMessage} /> Show my message on the public gift
								wall</label
							>{/if}
						<div class="checkout-total">
							<div>
								<span>Support for {profile.displayName.split(' ')[0] || 'the creator'}</span><strong
									>{naira(amount)}</strong
								>
							</div>

							<div><span>Total</span><strong>{naira(amount)}</strong></div>
						</div>
						<button class="button full" disabled={busy} aria-busy={busy}
							>{#if busy}<span class="spinner"></span>Sending kindness…{:else if sent}<Check
									size={17}
								/> Send another test zobo{:else}{example
									? 'Send a test zobo'
									: profile.cta || 'Support with zobo'}
								<Heart size={17} />{/if}</button
						>{#if error}<p class="form-error" role="alert">{error}</p>{/if}{#if sent}<p
								class="gift-success"
								role="status"
							>
								A little kindness delivered. Thank you.
							</p>{/if}
					</form>{:else}<div class="status-line">
						This creator is taking a little pause. Support is unavailable.
					</div>{/if}<span class="microcopy"
					><ShieldCheck size={13} />
					{example ? 'Demo only. No payment will be taken.' : 'Secure checkout by Paystack.'}</span
				>
			</section>
			<p class="demo-explainer">
				{example
					? 'Meet an example page. These stories and gifts are illustrative; try sending one yourself.'
					: 'The creator receives your support less a 5% platform fee and payment processing fees.'}
			</p>
			<div class="powered-by"><span>GOOD THINGS GROW HERE</span><Brand /></div>
		</aside>
		<section class="creator-community">
			<div class="story-divider"></div>
			<div class="row">
				<h2>Good words, little gifts.</h2>
				<Heart size={18} />
			</div>
			<p class="community-note">
				{example
					? 'Illustrative messages from an example community.'
					: 'Kind words shared with permission. Supporters can keep their name and message private.'}
			</p>
			{#if gifts.length}<div class="gift-wall">
					{#each gifts.slice(0, 8) as gift}<article>
							<span class="avatar">{gift.name[0].toUpperCase()}</span>
							<div>
								<strong>{gift.name} <span>sent {naira(gift.amount)}</span></strong>
								<p>{gift.note || 'A little fuel for what comes next.'}</p>
							</div>
							<Heart size={13} />
						</article>{/each}
				</div>{:else}<div class="empty">
					<p>The first little kindness could be yours. Try the support form.</p>
				</div>{/if}
		</section>
	</main>
	<footer class="creator-footer">Made with heart. Shared with a little zobo.</footer>
</div>

<style>
	.consent {
		display: flex;
		gap: 10px;
		align-items: flex-start;
		font-size: 13px;
		color: var(--muted);
	}
	.consent input {
		margin-top: 4px;
	}
	.creator-links {
		display: flex;
		gap: 10px;
		flex-wrap: wrap;
		margin-top: 20px;
		grid-column: 1;
	}

	.creator-header {
		height: 95px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 20px;
	}
	.creator-cover {
		height: 240px;
		background: #e9c5d0;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 100px;
		position: relative;
		overflow: hidden;
	}
	.cover-type {
		font-size: 65px;
		color: var(--wine);
		transform: rotate(-4deg);
		line-height: 1.2;
	}
	.cover-flower {
		font-size: 100px;
		color: #b7758e;
		line-height: 1;
	}
	:global(.cover-cup) {
		width: 165px;
		transform: rotate(12deg);
		margin-bottom: -85px;
	}
	.creator-body {
		display: grid;
		grid-template-columns: 1.1fr 1fr;
		column-gap: 95px;
		row-gap: 0;
		align-items: start;
		padding-top: 0;
		padding-bottom: 70px;
		max-width: 1120px;
	}
	.creator-avatar {
		height: 110px;
		width: 110px;
		background: var(--wine);
		border: 6px solid var(--cream);
		border-radius: 50%;
		margin-top: -55px;
		position: relative;
		display: grid;
		place-items: center;
		overflow: hidden;
		color: var(--cream);
	}
	.creator-avatar .serif {
		font-size: 83px;
		line-height: 1;
	}
	.creator-avatar img {
		height: 100%;
		width: 100%;
		object-fit: cover;
	}
	.creator-story > .badge {
		margin-top: 22px;
	}
	.creator-story h1 {
		font-size: 42px;
		margin: 18px 0 8px;
		overflow-wrap: anywhere;
	}
	.creator-handle {
		color: var(--wine);
		font-size: 14px;
	}
	.creator-bio {
		font-size: 14px;
		line-height: 1.9;
		margin-top: 24px;
		overflow-wrap: anywhere;
	}
	.creator-sharing {
		margin-top: 22px;
	}
	.creator-location {
		font-size: 14px;
		color: var(--muted);
	}
	.story-divider {
		height: 1px;
		background: var(--line);
		margin: 32px 0;
	}
	.creator-community {
		grid-column: 1;
	}
	.creator-community h2 {
		font-size: 21px;
	}
	.community-note {
		font-size: 14px;
		margin: 12px 0 20px;
	}
	.gift-wall article {
		display: flex;
		gap: 12px;
		padding: 22px 0;
		border-bottom: 1px solid var(--line);
	}
	.gift-wall article > div {
		min-width: 0;
		flex: 1;
	}
	.gift-wall strong {
		font-size: 14px;
	}
	.gift-wall strong > span {
		font-weight: 400;
		display: block;
		color: var(--muted);
		font-size: 14px;
		margin-top: 3px;
	}
	.gift-wall p {
		font-size: 14px;
		line-height: 1.8;
		margin-top: 10px;
		overflow-wrap: anywhere;
	}
	.gift-wall article > :global(svg) {
		color: #ad7487;
		margin-top: 10px;
	}
	.support-column {
		grid-column: 2;
		grid-row: 1 / 3;
		padding-top: 38px;
	}
	.support-widget {
		padding: 28px;
		box-shadow: 0 15px 50px #3e102909;
		position: sticky;
		top: 24px;
	}
	.widget-title {
		display: flex;
		align-items: center;
		gap: 12px;
		margin-bottom: 25px;
	}
	:global(.widget-cup) {
		width: 48px;
		transform: rotate(-8deg);
	}
	.widget-title .eyebrow {
		font-size: 14px;
		letter-spacing: 0.1em;
	}
	.widget-title h2 {
		font-size: 24px;
		margin-top: 9px;
	}
	.support-widget form {
		display: flex;
		flex-direction: column;
		gap: 18px;
	}
	.quantity-picker {
		display: flex;
		gap: 9px;
	}
	.quantity-picker button {
		flex: 1;
		padding: 13px 5px;
		border: 1px solid #d5bec8;
		border-radius: 8px;
		background: transparent;
		font-size: 14px;
		color: var(--wine);
	}
	.quantity-picker button.selected {
		background: var(--pink);
		border: 2px solid var(--wine);
		padding: 12px 4px;
	}
	.optional {
		font-size: 14px;
		font-weight: 400;
		color: var(--muted);
	}
	.checkout-total {
		border-top: 1px solid var(--line);
		padding-top: 13px;
	}
	.checkout-total > div {
		display: flex;
		justify-content: space-between;
		gap: 15px;
		font-size: 14px;
		color: var(--muted);
		padding: 6px 0;
	}
	.checkout-total > div:last-child {
		border-top: 1px solid var(--line);
		padding-top: 12px;
		margin-top: 8px;
		color: var(--plum);
		font-size: 14px;
	}
	.demo-explainer {
		font-size: 14px;
		text-align: center;
		line-height: 1.8;
		margin: 20px 25px;
	}
	.powered-by {
		display: flex;
		align-items: center;
		flex-direction: column;
		gap: 15px;
		margin-top: 35px;
	}
	.powered-by > span {
		font-size: 14px;
		letter-spacing: 0.14em;
		color: var(--muted);
	}
	.creator-footer {
		border-top: 1px solid var(--line);
		padding: 24px;
		text-align: center;
		font-size: 14px;
		color: var(--muted);
	}
	.form-error {
		font-size: 14px;
		color: #a02c46;
	}
	.gift-success {
		font-size: 14px;
		color: var(--wine);
		text-align: center;
	}
	@media (max-width: 1000px) {
		.creator-body {
			gap: 45px;
		}
		.cover-type {
			font-size: 50px;
		}
		.creator-cover {
			gap: 50px;
		}
		.widget-title h2 {
			font-size: 20px;
		}
		.support-widget {
			padding: 23px;
		}
	}
	@media (max-width: 760px) {
		.creator-header {
			height: 80px;
		}
		.creator-cover {
			height: 155px;
			gap: 22px;
		}
		.cover-flower {
			font-size: 50px;
		}
		.cover-type {
			font-size: 31px;
			max-width: 220px;
		}
		:global(.cover-cup) {
			width: 75px;
			margin-bottom: -65px;
			position: absolute;
			right: 12px;
			bottom: 28px;
		}
		.creator-body {
			display: flex;
			flex-direction: column;
			gap: 20px;
			padding-bottom: 45px;
		}
		.creator-avatar {
			height: 87px;
			width: 87px;
			margin-top: -44px;
		}
		.creator-avatar .serif {
			font-size: 61px;
		}
		.creator-story h1 {
			font-size: 34px;
		}
		.creator-community {
			order: 3;
			width: 100%;
		}
		.support-column {
			padding-top: 5px;
		}
		.support-widget {
			position: static;
			padding: 25px;
		}
		.widget-title h2 {
			font-size: 25px;
		}
		.creator-bio {
			font-size: 13px;
			margin-top: 18px;
		}
		.creator-story > .badge {
			margin-top: 17px;
		}
		.creator-sharing {
			margin-top: 17px;
		}
	}
</style>
