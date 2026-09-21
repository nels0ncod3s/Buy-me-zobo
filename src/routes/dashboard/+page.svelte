<script>
	import { getContext } from 'svelte';
	const creator = getContext('creator');
	import { ArrowUpRight, Copy, Heart, Wallet, Check, Sparkles } from '@lucide/svelte';
	import { creatorPath, copyPage, naira } from '$lib/ui.js';
	import ActionButton from '$lib/components/ActionButton.svelte';
	import ZoboCup from '$lib/components/ZoboCup.svelte';
	let earned = $derived($creator.totals.earned);
	let paid = $derived($creator.totals.paid);
	let checklist = $derived([
		{
			label: 'Make your profile feel like you',
			done: Boolean($creator.displayName && $creator.bio),
			href: '/dashboard/settings'
		},
		{
			label: 'Add a payout destination',
			done: Boolean($creator.bank),
			href: '/dashboard/payouts'
		},
		{
			label: 'Preview your creator page',
			done: Boolean($creator.username),
			href: $creator.username ? creatorPath($creator.username) : '/signup',
			external: Boolean($creator.username)
		}
	]);
</script>

<div class="page-heading">
	<span class="eyebrow">YOUR CREATIVE CORNER</span>
	<h2>
		{$creator.displayName
			? `Hello, ${$creator.displayName.split(' ')[0]}.`
			: 'Make yourself at home.'} <span class="hello-flower">✳</span>
	</h2>
	<p>A little space for your work, your people, and the kindness they send.</p>
</div>
<section class="share-banner">
	<div>
		<span class="eyebrow"
			>{$creator.active ? 'YOUR NEXT LITTLE BEGINNING' : 'YOUR PAGE IS PAUSED'}</span
		>
		<h3>
			{$creator.username ? 'Good things start with a shared link.' : 'Give your creativity a home.'}
		</h3>
		<p>
			{$creator.username ? `/${$creator.username}` : 'Choose your name and make this space yours.'}
		</p>
		<div class="share-actions">
			{#if $creator.username}<ActionButton
					class="button cream small"
					action={() => copyPage($creator.username)}
					success="Your page link is copied."
					busyLabel="Copying…"><Copy size={14} /> Copy your link</ActionButton
				><a
					href={creatorPath($creator.username)}
					target="_blank"
					rel="noopener noreferrer"
					class="text-link">Preview page <ArrowUpRight size={15} /></a
				>{:else}<a href="/signup" class="button cream small"
					>Create a page <ArrowUpRight size={15} /></a
				>{/if}
		</div>
	</div>
	<ZoboCup class="banner-cup" />
</section>
<div class="metrics">
	<article class="panel">
		<span class="metric-label"><Wallet size={15} /> Total support</span><strong
			>{naira(earned)}</strong
		><small>A little fuel for what comes next.</small>
	</article>
	<article class="panel">
		<span class="metric-label"><Heart size={15} /> Gifts received</span><strong
			>{$creator.totals.count}<span> gifts</span></strong
		><small>Every gift has a story behind it.</small>
	</article>
	<article class="panel">
		<span class="metric-label"><Sparkles size={15} /> Available balance</span><strong
			>{naira($creator.totals.balance)}</strong
		><small>After fees and reserved payouts.</small>
	</article>
</div>
<div class="overview-grid">
	<section class="panel">
		<div class="row">
			<h3 class="section-title">A little love, lately</h3>
			<a class="text-link" href="/dashboard/supporters">See all <ArrowUpRight size={14} /></a>
		</div>
		{#if $creator.gifts.length}<div class="recent-list">
				{#each $creator.gifts.slice(0, 4) as gift}<article>
						<span class="avatar">{gift.name[0].toUpperCase()}</span>
						<div>
							<strong>{gift.name}</strong>
							<p>{gift.note || 'Sent a little kindness your way.'}</p>
						</div>
						<strong>{naira(gift.amount)}</strong>
					</article>{/each}
			</div>{:else}<div class="empty">
				<ZoboCup class="empty-cup" />
				<h3>Your first zobo is out there.</h3>
				<p>Share your page so your people can support your next creation.</p>
				<a
					class="text-link"
					href={$creator.username ? creatorPath($creator.username) : '/example'}
					target="_blank"
					rel="noopener noreferrer">View your page <ArrowUpRight size={15} /></a
				>
			</div>{/if}
	</section>
	<section class="panel">
		<span class="badge">A GOOD PLACE TO START</span>
		<h3 class="setup-title">Make it feel like you.</h3>
		<p class="inline-note">A few little touches before you share your page.</p>
		<div class="checklist">
			{#each checklist as item}<a
					href={item.href}
					target={item.external ? '_blank' : undefined}
					rel={item.external ? 'noopener noreferrer' : undefined}
					><span class="check-circle" class:done={item.done}
						>{#if item.done}<Check size={12} />{:else}•{/if}</span
					>{item.label}<ArrowUpRight size={13} /></a
				>{/each}
		</div>
		<div class="divider"></div>
		<p class="inline-note">
			Your page is ready to share. Keep your profile and payout destination up to date.
		</p>
	</section>
</div>

<style>
	.hello-flower {
		color: #b96b85;
		font-weight: 400;
		font-size: 25px;
		margin-left: 8px;
	}
	.share-banner {
		background: var(--plum);
		border-radius: 14px;
		padding: 32px;
		color: var(--cream);
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 20px;
		overflow: hidden;
	}
	.share-banner .eyebrow {
		color: #dda9bc;
		font-size: 14px;
	}
	.share-banner h3 {
		font-size: 28px;
		margin: 14px 0;
		max-width: 350px;
	}
	.share-banner p {
		font-size: 14px;
		color: #ddbac8;
	}
	.share-actions {
		display: flex;
		align-items: center;
		gap: 22px;
		margin-top: 22px;
		flex-wrap: wrap;
	}
	:global(.banner-cup) {
		width: 120px;
		transform: rotate(12deg);
		margin: -10px 10px;
	}
	.metrics {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 16px;
		margin: 23px 0;
	}
	.metrics article {
		padding: 22px;
	}
	.metric-label {
		font-size: 14px;
		display: flex;
		align-items: center;
		gap: 8px;
		color: var(--muted);
	}
	.metrics strong {
		display: block;
		font-size: 35px;
		line-height: 1.1;
		letter-spacing: -0.05em;
		margin: 17px 0 10px;
	}
	.metrics strong > span {
		font-size: 15px;
		font-weight: 400;
		letter-spacing: -0.02em;
	}
	.metrics small {
		font-size: 14px;
		color: var(--muted);
	}
	.overview-grid {
		display: grid;
		grid-template-columns: 1.4fr 1fr;
		gap: 20px;
	}
	.setup-title {
		font-size: 25px;
		margin: 18px 0 12px;
	}
	.checklist {
		margin-top: 25px;
	}
	.checklist a > :global(svg) {
		margin-left: auto;
	}
	.recent-list article {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 20px 0;
		border-bottom: 1px solid var(--line);
	}
	.recent-list article:last-child {
		border: 0;
	}
	.recent-list article div {
		min-width: 0;
		flex: 1;
	}
	.recent-list strong {
		font-size: 14px;
	}
	.recent-list p {
		font-size: 14px;
		overflow-wrap: anywhere;
	}
	.recent-list article > strong {
		white-space: nowrap;
	}
	@media (max-width: 1000px) {
		.metrics {
			grid-template-columns: 1fr 1fr;
		}
		.metrics article:last-child {
			grid-column: 1/-1;
		}
		.overview-grid {
			grid-template-columns: 1fr;
		}
		.metrics strong {
			font-size: 29px;
		}
	}
	@media (max-width: 760px) {
		.share-banner {
			padding: 24px;
			position: relative;
		}
		.share-banner h3 {
			font-size: 24px;
			max-width: 240px;
		}
		:global(.banner-cup) {
			width: 85px;
			margin: 0 -14px 0 0;
		}
		.share-banner .eyebrow {
			font-size: 14px;
		}
		.metrics {
			gap: 10px;
		}
		.metrics article {
			padding: 18px 14px;
		}
		.metric-label {
			font-size: 14px;
		}
		.metrics small {
			font-size: 14px;
		}
		.metrics strong {
			font-size: 28px;
		}
		.share-actions {
			gap: 16px;
		}
		.share-actions .text-link {
			font-size: 14px;
		}
	}
</style>
