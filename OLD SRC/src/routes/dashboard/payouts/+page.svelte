<script>
	import { Wallet, Clock, Landmark } from '@lucide/svelte';
</script>

<svelte:head>
	<title>Payouts — Buy Me Zobo</title>
</svelte:head>

<div class="dash">
	<div class="dash-welcome">
		<h2>Payouts</h2>
		<p>You're paid out automatically every Friday — no need to request anything.</p>
	</div>

	<div class="payout-grid">
		<section class="card bank-card">
			<span class="bank-icon"><Landmark size={18} strokeWidth={1.8} /></span>
			<div class="bank-text">
				<h3>No bank connected</h3>
				<p>Add your bank details to receive payouts.</p>
			</div>
			<button type="button" class="btn-connect">Connect bank</button>
		</section>

		<section class="card next-card">
			<span class="next-label">Next payout</span>
			<span class="next-amount">₦0</span>
			<span class="next-date"><Clock size={13} strokeWidth={2} /> Connect a bank first</span>
		</section>
	</div>

	<section class="card">
		<div class="card-head">
			<h3>Payout history</h3>
		</div>
		<div class="empty-state">
			<span class="empty-icon"><Wallet size={22} strokeWidth={1.8} /></span>
			<h4>No payouts yet</h4>
			<p>Your first payout will land here the Friday after you get your first Zobo.</p>
		</div>
	</section>
</div>

<style>
	.dash {
		flex: 1;
		min-width: 0;
		width: 100%;
		padding: 1.75rem clamp(1.25rem, 3vw, 2.25rem) 2.5rem;
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}
	.dash-welcome h2 {
		font-size: 1.5rem;
		font-weight: 700;
		letter-spacing: -0.02em;
		color: var(--zobo-950);
		margin: 0 0 0.3rem;
	}
	.dash-welcome p {
		font-size: 0.9rem;
		color: var(--muted);
		margin: 0;
	}

	.card {
		background: var(--sheet);
		border: 1px solid var(--line);
		border-radius: 14px;
		padding: 1.4rem 1.5rem;
		min-width: 0;
	}
	.card-head {
		margin-bottom: 0.5rem;
	}
	.card-head h3 {
		font-size: 1rem;
		font-weight: 700;
		color: var(--zobo-950);
		margin: 0;
	}

	.payout-grid {
		display: grid;
		grid-template-columns: 1.4fr 1fr;
		gap: 1.25rem;
	}

	.bank-card {
		display: flex;
		align-items: center;
		gap: 0.9rem;
		flex-wrap: wrap;
	}
	.bank-icon {
		width: 42px;
		height: 42px;
		border-radius: 11px;
		flex-shrink: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(151, 27, 61, 0.09);
		color: var(--zobo-700);
	}
	.bank-text {
		min-width: 0;
		flex: 1;
	}
	.bank-card h3 {
		font-size: 0.95rem;
		font-weight: 700;
		color: var(--zobo-950);
		margin: 0;
	}
	.bank-card p {
		font-size: 0.8rem;
		color: var(--muted);
		margin: 0.15rem 0 0;
	}
	.btn-connect {
		margin-left: auto;
		font-family: inherit;
		font-weight: 600;
		font-size: 0.82rem;
		color: var(--cream);
		background: var(--zobo-800);
		border: none;
		border-radius: 999px;
		padding: 0.55rem 1.1rem;
		cursor: pointer;
		flex-shrink: 0;
		transition: background 0.15s ease;
	}
	.btn-connect:hover {
		background: var(--zobo-700);
	}

	.next-card {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		background: linear-gradient(165deg, var(--zobo-900), var(--zobo-950));
		border: none;
	}
	.next-label {
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: rgba(251, 243, 231, 0.6);
	}
	.next-amount {
		font-size: 1.6rem;
		font-weight: 700;
		color: var(--cream);
		letter-spacing: -0.02em;
	}
	.next-date {
		display: inline-flex;
		align-items: center;
		gap: 0.3rem;
		font-size: 0.78rem;
		color: rgba(251, 243, 231, 0.7);
		margin-top: 0.15rem;
	}

	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		gap: 0.5rem;
		padding: 2.5rem 1rem;
	}
	.empty-icon {
		width: 44px;
		height: 44px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--canvas);
		color: var(--muted-2);
		margin-bottom: 0.25rem;
	}
	.empty-state h4 {
		font-size: 0.92rem;
		font-weight: 700;
		color: var(--ink);
		margin: 0;
	}
	.empty-state p {
		font-size: 0.82rem;
		line-height: 1.5;
		color: var(--muted);
		margin: 0;
		max-width: 24rem;
	}

	@media (max-width: 640px) {
		.payout-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
