<script>
	import { Wallet, Heart, Copy, Check, BarChart3 } from '@lucide/svelte';

	// Static/mock — this represents a brand-new creator's first day, before
	// any support has come in.
	const pageUrl = 'buymezobo.com/trxpznxl';

	const stats = [
		{ icon: Wallet, label: 'Earned so far', value: '₦0' },
		{ icon: Heart, label: 'Supporters', value: '0' }
	];

	let copied = $state(false);
	async function copyLink() {
		try {
			await navigator.clipboard.writeText(`https://${pageUrl}`);
			copied = true;
			setTimeout(() => (copied = false), 1800);
		} catch {
			// Clipboard API unavailable — nothing to fall back to in a mock.
		}
	}
</script>

<svelte:head>
	<title>Home — Buy Me Zobo</title>
</svelte:head>

<div class="dash">
	<div class="dash-welcome">
		<h2>Welcome, Nelson</h2>
		<p>Your page is live. Share it to start earning.</p>
	</div>

	<section class="share-card">
		<div class="share-text">
			<span class="share-label">Your page</span>
			<span class="share-url">{pageUrl}</span>
		</div>
		<button type="button" class="share-copy" onclick={copyLink}>
			{#if copied}
				<Check size={15} strokeWidth={2.5} /> Copied
			{:else}
				<Copy size={15} strokeWidth={2} /> Copy link
			{/if}
		</button>
	</section>

	<div class="stat-grid">
		{#each stats as s}
			<div class="stat-card">
				<span class="stat-icon"><s.icon size={17} strokeWidth={1.9} /></span>
				<span class="stat-value">{s.value}</span>
				<span class="stat-label">{s.label}</span>
			</div>
		{/each}
	</div>

	<div class="dash-grid">
		<section class="card">
			<div class="card-head">
				<h3>Earnings</h3>
			</div>
			<div class="empty-state">
				<span class="empty-icon"><BarChart3 size={18} strokeWidth={1.8} /></span>
				<h4>No earnings yet</h4>
				<p>Your chart will appear here once you get your first Zobo.</p>
			</div>
		</section>

		<section class="card">
			<div class="card-head">
				<h3>Recent supporters</h3>
				<a href="/dashboard/supporters" class="card-link">View all</a>
			</div>
			<div class="empty-state">
				<span class="empty-icon"><Heart size={18} strokeWidth={1.8} /></span>
				<h4>No supporters yet</h4>
				<p>Share your page to get your first one.</p>
			</div>
		</section>
	</div>
</div>

<style>
	.dash {
		flex: 1;
		min-width: 0;
		width: 100%;
		padding: 1.75rem clamp(1.25rem, 3vw, 2.25rem) 2.5rem;
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
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

	/* ============ SHARE CARD ============ */
	.share-card {
		background: linear-gradient(165deg, var(--zobo-900), var(--zobo-950));
		border-radius: 14px;
		padding: 1.1rem 1.4rem;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		flex-wrap: wrap;
	}
	.share-text {
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
		min-width: 0;
	}
	.share-label {
		font-size: 0.7rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: rgba(251, 243, 231, 0.55);
	}
	.share-url {
		font-size: 1rem;
		font-weight: 700;
		color: var(--cream);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.share-copy {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		font-family: inherit;
		font-weight: 600;
		font-size: 0.85rem;
		padding: 0.55rem 1rem;
		border-radius: 999px;
		border: none;
		background: var(--cream);
		color: var(--zobo-950);
		cursor: pointer;
		flex-shrink: 0;
		transition: background 0.15s ease;
	}
	.share-copy:hover {
		background: #fff;
	}

	/* ============ STAT CARDS ============ */
	.stat-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 1rem;
	}
	.stat-card {
		background: var(--sheet);
		border: 1px solid var(--line);
		border-radius: 14px;
		padding: 1.1rem 1.2rem;
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
		min-width: 0;
	}
	.stat-icon {
		width: 32px;
		height: 32px;
		border-radius: 9px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(151, 27, 61, 0.09);
		color: var(--zobo-700);
		margin-bottom: 0.3rem;
	}
	.stat-value {
		font-size: 1.35rem;
		font-weight: 700;
		letter-spacing: -0.02em;
		color: var(--zobo-950);
	}
	.stat-label {
		font-size: 0.78rem;
		color: var(--muted);
	}

	/* ============ MAIN GRID ============ */
	.dash-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1.25rem;
		align-items: start;
	}
	.card {
		background: var(--sheet);
		border: 1px solid var(--line);
		border-radius: 14px;
		padding: 1.4rem 1.5rem;
		min-width: 0;
	}
	.card-head {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 1rem;
		margin-bottom: 0.5rem;
	}
	.card-head h3 {
		font-size: 1rem;
		font-weight: 700;
		color: var(--zobo-950);
		margin: 0;
	}
	.card-link {
		font-size: 0.8rem;
		font-weight: 600;
		color: var(--zobo-700);
		white-space: nowrap;
	}
	.card-link:hover {
		color: var(--zobo-600);
	}

	/* ============ EMPTY STATES ============ */
	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		gap: 0.5rem;
		padding: 2rem 1rem;
	}
	.empty-icon {
		width: 40px;
		height: 40px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--canvas);
		color: var(--muted-2);
		margin-bottom: 0.25rem;
	}
	.empty-state h4 {
		font-size: 0.88rem;
		font-weight: 600;
		color: var(--ink);
		margin: 0;
	}
	.empty-state p {
		font-size: 0.8rem;
		color: var(--muted);
		margin: 0;
		max-width: 22rem;
	}

	/* ============ MOBILE ============ */
	@media (max-width: 1000px) {
		.dash-grid {
			grid-template-columns: 1fr;
		}
	}
	@media (max-width: 480px) {
		.stat-grid {
			grid-template-columns: 1fr;
		}
		.share-card {
			flex-direction: column;
			align-items: stretch;
			text-align: center;
		}
		.share-copy {
			justify-content: center;
		}
	}
</style>
