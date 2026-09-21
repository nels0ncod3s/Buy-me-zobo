<script>
	import { getContext } from 'svelte';
	const creator = getContext('creator');
	import { naira, creatorPath } from '$lib/ui.js';
	import ActionButton from '$lib/components/ActionButton.svelte';
	import { getSupabase } from '$lib/supabase/client.js';
	import { invalidateAll } from '$app/navigation';
	async function moderate(gift) {
		const { error } = await getSupabase()
			.from('support_transactions')
			.update({ creator_hidden: !gift.hidden })
			.eq('id', gift.id);
		if (error) throw new Error('Could not update this gift.');
		await invalidateAll();
	}
	import ZoboCup from '$lib/components/ZoboCup.svelte';
	import { ArrowUpRight, Search } from '@lucide/svelte';
	let search = $state('');
	let filtered = $derived(
		$creator.gifts.filter((gift) =>
			`${gift.name} ${gift.note}`.toLowerCase().includes(search.toLowerCase())
		)
	);
</script>

<div class="page-heading">
	<span class="eyebrow">THE PEOPLE ROOTING FOR YOU</span>
	<h2>Little gifts. Good people.</h2>
	<p>Every bit of encouragement, all in one place.</p>
</div>
<section class="panel">
	<div class="row">
		<h3 class="section-title">
			Your gifts <span class="badge">{$creator.gifts.length}</span>
		</h3>
		{#if $creator.gifts.length}<label class="search-box"
				><Search size={15} /><input
					aria-label="Search supporters and messages"
					placeholder="Find a name or a kind word"
					bind:value={search}
				/></label
			>{/if}
	</div>
	{#if $creator.gifts.length}<div class="supporter-list">
			{#each filtered as gift}<article>
					<span class="avatar">{gift.name[0].toUpperCase()}</span>
					<div>
						<strong>{gift.name}</strong><span
							>{new Date(gift.date).toLocaleDateString('en-NG')} · Gift</span
						>
						<ActionButton
							class="text-link"
							action={() => moderate(gift)}
							success="Gift visibility updated."
							busyLabel="Updating…"
							>{gift.hidden ? 'Restore to public wall' : 'Hide from public wall'}</ActionButton
						>
						<p>{gift.note || 'A little kindness, no words needed.'}</p>
					</div>
					<strong>{naira(gift.amount)}</strong>
				</article>{/each}{#if !filtered.length}<div class="empty">
					<h3>No matching kind words.</h3>
					<p>Try another name or clear your search.</p>
					<button class="button secondary small" onclick={() => (search = '')}>Clear search</button>
				</div>{/if}
		</div>{:else}<div class="empty">
			<ZoboCup class="empty-cup" />
			<h3>Your people will find you.</h3>
			<p>
				Your latest 100 confirmed gifts appear here. Share your page to invite your first supporter.
			</p>
			<a
				class="button secondary small"
				href={$creator.username ? creatorPath($creator.username) : '/signup'}
				>{$creator.username ? 'Open your page' : 'Create your page'}
				<ArrowUpRight size={15} /></a
			>
		</div>{/if}
</section>

<style>
	.search-box {
		display: flex;
		align-items: center;
		gap: 9px;
		border: 1px solid var(--line);
		border-radius: 8px;
		padding: 8px 12px;
		max-width: 100%;
		font-size: 14px;
		color: var(--muted);
	}
	.search-box input {
		background: transparent;
		border: 0;
		min-width: 0;
		outline: 0;
		width: 190px;
	}
	.supporter-list article {
		display: flex;
		align-items: flex-start;
		gap: 15px;
		padding: 24px 0;
		border-bottom: 1px solid var(--line);
	}
	.supporter-list article:last-child {
		border: 0;
	}
	.supporter-list article > div {
		flex: 1;
		min-width: 0;
	}
	.supporter-list strong {
		font-size: 14px;
	}
	.supporter-list article > div > span {
		display: block;
		font-size: 14px;
		color: var(--muted);
		margin: 4px 0 10px;
	}
	.supporter-list p {
		font-size: 14px;
		overflow-wrap: anywhere;
	}
	.supporter-list article > strong {
		white-space: nowrap;
	}
</style>
