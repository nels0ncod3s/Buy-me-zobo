<script>
	import { getContext } from 'svelte';
	import { invalidateAll } from '$app/navigation';
	import { edge } from '$lib/supabase/client.js';
	import { naira, notify } from '$lib/ui.js';
	import ActionButton from '$lib/components/ActionButton.svelte';
	import ZoboCup from '$lib/components/ZoboCup.svelte';
	const creator = getContext('creator');
	let editing = $state(false),
		banks = $state([]),
		bank = $state(''),
		account = $state(''),
		amount = $state(''),
		confirm = $state(false);
	let payoutKey = null;
	async function edit() {
		if (editing) {
			editing = false;
			return;
		}
		const result = await edge('list-banks');
		banks = result.banks;
		editing = true;
	}
	async function connect() {
		const result = await edge('create-payout-account', { bank, account });
		account = '';
		editing = false;
		await invalidateAll();
		notify('Verified ' + result.name + ' · ' + result.bank + ' · ' + result.last4);
	}
	async function payout() {
		const value = Number(amount);
		if (!Number.isFinite(value) || value < 100 || !/^\d+(\.\d{1,2})?$/.test(String(amount)))
			throw new Error('Enter a valid amount of at least ₦100.');
		payoutKey ||= crypto.randomUUID();
		const result = await edge('create-payout', {
			key: payoutKey,
			amount: Math.round(value * 100),
			destination: $creator.bank?.id
		});
		confirm = false;
		amount = '';
		payoutKey = null;
		await invalidateAll();
		notify(
			result.message || 'Payout requested. Its status will update after provider confirmation.'
		);
	}
	async function refresh(p) {
		const result = await edge('reconcile-payout', { id: p.id });
		await invalidateAll();
		notify('Payout status: ' + result.status + '.');
	}
</script>

<div class="page-heading">
	<span class="eyebrow">A LITTLE FUEL FOR WHAT'S NEXT</span>
	<h2>Your support, at a glance.</h2>
	<p>Manage your verified bank account and track your payouts.</p>
</div>
<div class="payout-grid">
	<section class="panel">
		<span class="eyebrow">AVAILABLE BALANCE</span><strong class="balance"
			>{naira($creator.totals.balance)}</strong
		>
		<p class="inline-note">
			After platform and processing fees. Pending payouts are already reserved.
		</p>
		<div class="payout-action">
			{#if $creator.bank}
				<label class="field"
					>Payout amount (₦)<input
						type="number"
						min="100"
						step="0.01"
						max={$creator.totals.balance}
						bind:value={amount}
						oninput={() => {
							confirm = false;
							payoutKey = null;
						}}
					/></label
				>
				{#if confirm}<p class="inline-note">
						Send {naira(Number(amount))} to {$creator.bank.accountName} at {$creator.bank.name},
						ending {$creator.bank.last4}?
					</p>
					<ActionButton action={payout} busyLabel="Requesting payout…">Confirm payout</ActionButton
					><button class="text-link" onclick={() => (confirm = false)}>Cancel</button>
				{:else}<button
						class="button"
						disabled={!amount || Number(amount) < 100 || Number(amount) > $creator.totals.balance}
						onclick={() => (confirm = true)}>Review payout →</button
					>{/if}
			{:else}<p class="inline-note">Connect a verified bank account to request a payout.</p>{/if}
		</div>
	</section>
	<section class="panel">
		<h3 class="section-title">Your destination</h3>
		<p class="destination">
			{$creator.bank
				? `${$creator.bank.name} · ending ${$creator.bank.last4}`
				: 'Give your support somewhere to land.'}
		</p>
		<p class="inline-note">
			{$creator.bank?.accountName ||
				'Your account is verified with Paystack. We store only a recipient token and masked account details.'}
		</p>
		<ActionButton class="button secondary small" action={edit} busyLabel="Loading banks…"
			>{editing ? 'Cancel' : $creator.bank ? 'Change destination' : 'Connect bank'}</ActionButton
		>
	</section>
</div>
{#if editing}<section class="panel bank-form">
		<h3 class="section-title">Verify your bank account</h3>
		<div class="field-grid">
			<label class="field"
				>Bank<select bind:value={bank}
					><option value="">Choose a bank</option>{#each banks as b}<option value={b.code}
							>{b.name}</option
						>{/each}</select
				></label
			><label class="field"
				>Account number<input
					bind:value={account}
					inputmode="numeric"
					maxlength="10"
					autocomplete="off"
				/></label
			>
		</div>
		<ActionButton action={connect} busyLabel="Verifying account…">Verify and save</ActionButton>
	</section>{/if}
<section class="panel">
	<h3 class="section-title">Your payout story</h3>
	<p class="inline-note">
		Latest 100 payouts. Refresh a pending payout to check with the provider.
	</p>
	{#if $creator.payouts.length}<div class="table-wrap">
			<table>
				<thead><tr><th>Date</th><th>Amount</th><th>Status</th><th>Action</th></tr></thead><tbody
					>{#each $creator.payouts as p}<tr
							><td>{new Date(p.date).toLocaleDateString('en-NG')}</td><td>{naira(p.amount)}</td><td
								><span class="badge">{p.status}</span></td
							><td
								>{#if ['pending', 'processing'].includes(p.status)}<ActionButton
										class="text-link"
										action={() => refresh(p)}
										busyLabel="Checking…">Refresh</ActionButton
									>{/if}</td
							></tr
						>{/each}</tbody
				>
			</table>
		</div>{:else}<div class="empty">
			<ZoboCup class="empty-cup" />
			<h3>No payouts just yet.</h3>
			<p>Your payouts will appear here when you request one.</p>
		</div>{/if}
</section>

<style>
	.payout-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 22px;
		margin-bottom: 25px;
	}
	.balance {
		display: block;
		font-size: 50px;
		line-height: 1.2;
		letter-spacing: -0.06em;
		margin: 20px 0 8px;
	}
	.payout-action {
		margin-top: 24px;
	}
	.destination {
		font-size: 18px;
		color: var(--ink);
		margin: 25px 0 12px;
		letter-spacing: -0.03em;
	}
	.payout-grid :global(.button.secondary) {
		margin-top: 24px;
	}
	.payout-grid .section-title {
		display: flex;
		gap: 9px;
		align-items: center;
	}
	.bank-form {
		margin-bottom: 25px;
	}
	.bank-form .field-grid {
		margin: 25px 0;
	}
	.bank-form :global(.button) {
		margin-top: 5px;
	}
	@media (max-width: 760px) {
		.payout-grid {
			grid-template-columns: 1fr;
		}
		.balance {
			font-size: 43px;
		}
	}
</style>
