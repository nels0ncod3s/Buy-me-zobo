<script>
	import { creator, connectDemoBank, simulatePayout, naira } from '$lib/demo.js';
	import ActionButton from '$lib/components/ActionButton.svelte';
	import ZoboCup from '$lib/components/ZoboCup.svelte';
	import { Landmark, ArrowUpRight } from '@lucide/svelte';
	let editing = $state(false),
		bank = $state($creator.bank?.name || ''),
		account = $state('');
	let balance = $derived(
		$creator.gifts.reduce((sum, g) => sum + g.amount, 0) -
			$creator.payouts.reduce((sum, p) => sum + p.amount, 0)
	);
	function connect() {
		connectDemoBank(bank, account);
		account = '';
		editing = false;
	}
</script>

<div class="page-heading">
	<span class="eyebrow">A LITTLE FUEL FOR WHAT'S NEXT</span>
	<h2>Your support, at a glance.</h2>
	<p>Explore the payout experience. Everything here is simulated.</p>
</div>
<div class="payout-grid">
	<section class="panel">
		<span class="eyebrow">AVAILABLE DEMO BALANCE</span><strong class="balance"
			>{naira(balance)}</strong
		>
		<p class="inline-note">Test gifts only. No real money will be sent.</p>
		<div class="payout-action">
			<ActionButton
				action={simulatePayout}
				success="Demo payout recorded. No bank transfer was made."
				busyLabel="Recording demo payout…"
				>Simulate a payout <ArrowUpRight size={15} /></ActionButton
			>
		</div>
	</section>
	<section class="panel">
		<div class="row">
			<h3 class="section-title"><Landmark size={17} /> Your destination</h3>
			<span class="badge">DEMO</span>
		</div>
		<p class="destination">
			{$creator.bank
				? `${$creator.bank.name} · ending ${$creator.bank.last4}`
				: 'Give your support somewhere to land.'}
		</p>
		<p class="inline-note">
			Use sample details. We only keep the last four digits and never contact a bank.
		</p>
		<button class="button secondary small" onclick={() => (editing = !editing)}
			>{editing ? 'Cancel' : $creator.bank ? 'Change destination' : 'Connect demo bank'}</button
		>
	</section>
</div>
{#if editing}<section class="panel bank-form">
		<h3 class="section-title">Add a demo destination</h3>
		<div class="field-grid">
			<label class="field"
				>Demo bank<select bind:value={bank}
					><option value="">Choose a bank</option><option>Access Bank</option><option>GTBank</option
					><option>UBA</option><option>Zenith Bank</option><option>Other demo bank</option></select
				></label
			><label class="field"
				>Sample account number<input
					bind:value={account}
					inputmode="numeric"
					maxlength="10"
					placeholder="0123456789"
				/></label
			>
		</div>
		<ActionButton
			action={connect}
			success="Demo destination saved. No bank verification was performed."
			busyLabel="Saving destination…">Save demo destination</ActionButton
		>
	</section>{/if}
<section class="panel">
	<h3 class="section-title">Your payout story</h3>
	{#if $creator.payouts.length}<div class="table-wrap">
			<table>
				<thead><tr><th>Date</th><th>Destination</th><th>Amount</th><th>Status</th></tr></thead
				><tbody
					>{#each $creator.payouts as payout}<tr
							><td>{new Date(payout.date).toLocaleDateString('en-NG')}</td><td
								>{payout.destination}</td
							><td>{naira(payout.amount)}</td><td><span class="badge">Simulated</span></td></tr
						>{/each}</tbody
				>
			</table>
		</div>{:else}<div class="empty">
			<ZoboCup class="empty-cup" />
			<h3>No payouts just yet.</h3>
			<p>When you simulate your first payout, its details will appear here.</p>
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
	.payout-grid .button.secondary {
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
