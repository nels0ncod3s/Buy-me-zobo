<script>
	import { ChevronDown, Heart, Wallet, Sparkles } from '@lucide/svelte';

	// Static/mock dashboard data — swap for real figures once payments are wired up.
	const username = 'trxpznxl';

	// Earnings breakdown: this month vs last month, per source (₦ thousands).
	const chart = [
		{ label: 'Supporters', now: 88, prev: 52 },
		{ label: 'Memberships', now: 64, prev: 70 },
		{ label: 'Shop', now: 41, prev: 30 },
		{ label: 'Tips', now: 55, prev: 38 },
		{ label: 'Commissions', now: 22, prev: 44 },
		{ label: 'Pay-per-post', now: 73, prev: 33 }
	];
	const chartMax = 100;

	// Right-panel accordion state
	let openDatasets = $state(true);
	let openAssets = $state(true);
	let openInsights = $state(true);

	const supporters = [
		{ name: 'Amara O.', detail: '5 Zobos · ₦5,000', icon: Heart, tint: 'rose' },
		{ name: 'Chidi N.', detail: '2 Zobos · ₦2,000', icon: Heart, tint: 'rose' }
	];
	const payouts = [
		{ name: 'GTBank ••4821', detail: 'Next payout Fri', icon: Wallet, tint: 'gold' }
	];
</script>

<svelte:head>
	<title>Home — Buy Me Zobo</title>
</svelte:head>

<div class="workspace">
	<!-- ============ LEFT: ANALYTICS PANE (70%) ============ -->
	<section class="analytics">
		<div class="analytics-top">
			<h2 class="analytics-title">Earnings breakdown by source</h2>
			<p class="analytics-desc">
				Across your active revenue streams, one-off Zobo support and pay-per-post are trending up
				month-over-month, while commissions have cooled. Supporters remain your steadiest source.
			</p>

			<div class="chart">
				<div class="chart-grid" aria-hidden="true">
					<span></span><span></span><span></span><span></span>
				</div>
				<div class="chart-bars">
					{#each chart as col}
						<div class="chart-col">
							<div class="chart-pair">
								<div
									class="bar bar-now"
									style="height: {(col.now / chartMax) * 100}%"
									title="This month: ₦{col.now}k"
								></div>
								<div
									class="bar bar-prev"
									style="height: {(col.prev / chartMax) * 100}%"
									title="Last month: ₦{col.prev}k"
								></div>
							</div>
							<span class="chart-label">{col.label}</span>
						</div>
					{/each}
				</div>
			</div>
		</div>

		<div class="chart-legend">
			<span class="legend-item"><span class="legend-swatch now"></span> This month</span>
			<span class="legend-item"><span class="legend-swatch prev"></span> Last month</span>
		</div>
	</section>

	<!-- ============ RIGHT: INSPECT PANEL (30%) ============ -->
	<aside class="inspect">
		<!-- Recent supporters -->
		<div class="inspect-module">
			<button class="inspect-head" onclick={() => (openDatasets = !openDatasets)}>
				<span>Recent supporters</span>
				<ChevronDown size={16} strokeWidth={2} class={openDatasets ? '' : 'chev-collapsed'} />
			</button>
			{#if openDatasets}
				<div class="inspect-cards">
					{#each supporters as s}
						<div class="mini-card">
							<span class="mini-icon rose"><s.icon size={15} strokeWidth={2} /></span>
							<div>
								<h4>{s.name}</h4>
								<span>{s.detail}</span>
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</div>

		<!-- Payouts -->
		<div class="inspect-module">
			<button class="inspect-head" onclick={() => (openAssets = !openAssets)}>
				<span>Payouts</span>
				<ChevronDown size={16} strokeWidth={2} class={openAssets ? '' : 'chev-collapsed'} />
			</button>
			{#if openAssets}
				<div class="inspect-cards">
					{#each payouts as p}
						<div class="mini-card">
							<span class="mini-icon gold"><p.icon size={15} strokeWidth={2} /></span>
							<div>
								<h4>{p.name}</h4>
								<span>{p.detail}</span>
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</div>

		<!-- Insights -->
		<div class="inspect-module">
			<button class="inspect-head" onclick={() => (openInsights = !openInsights)}>
				<span>Insights</span>
				<ChevronDown size={16} strokeWidth={2} class={openInsights ? '' : 'chev-collapsed'} />
			</button>
			{#if openInsights}
				<div class="inspect-insight">
					<span class="mini-icon plum"><Sparkles size={15} strokeWidth={2} /></span>
					<p>Posts with a photo earn about 2× more Zobos. Try adding one to your next update.</p>
				</div>
			{/if}
		</div>
	</aside>
</div>

<style>
	.workspace {
		display: grid;
		grid-template-columns: 70% 30%;
		flex: 1;
		min-height: 0;
		width: 100%;
	}

	/* ============ ANALYTICS PANE ============ */
	.analytics {
		padding: 2rem;
		border-right: 1px solid var(--line);
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		overflow-y: auto;
		min-width: 0;
	}
	.analytics-title {
		font-size: 1.6rem;
		font-weight: 700;
		letter-spacing: -0.02em;
		color: var(--zobo-950);
		margin: 0 0 0.5rem;
		font-family: 'Geist Variable', ui-sans-serif, system-ui, sans-serif;
	}
	.analytics-desc {
		font-size: 0.875rem;
		line-height: 1.6;
		color: var(--muted);
		max-width: 44rem;
		margin: 0 0 2.5rem;
	}

	/* ============ CHART ============ */
	.chart {
		position: relative;
		height: 260px;
		margin-top: 1rem;
		border-bottom: 1px solid var(--line);
	}
	.chart-grid {
		position: absolute;
		inset: 0 0 24px 0;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		pointer-events: none;
		opacity: 0.6;
	}
	.chart-grid span {
		height: 0;
		border-bottom: 1px dashed var(--line);
	}
	.chart-grid span:last-child { border-bottom: none; }

	.chart-bars {
		position: relative;
		height: 100%;
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
		gap: 1rem;
		padding: 0 0.5rem;
	}
	.chart-col {
		display: flex;
		flex-direction: column;
		align-items: center;
		flex: 1;
		height: 100%;
		justify-content: flex-end;
	}
	.chart-pair {
		display: flex;
		align-items: flex-end;
		gap: 5px;
		height: calc(100% - 28px);
		width: 100%;
		justify-content: center;
	}
	.bar {
		width: 20px;
		border-radius: 5px 5px 0 0;
		transition: height 0.5s cubic-bezier(0.34, 1.1, 0.5, 1);
	}
	.bar-now { background: var(--zobo-700); }
	.bar-prev { background: var(--gold-light); }
	.chart-label {
		font-size: 0.62rem;
		color: var(--muted-2);
		margin-top: 0.5rem;
		text-align: center;
		font-weight: 500;
		line-height: 1.2;
		max-width: 72px;
	}

	.chart-legend {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 1.5rem;
		margin-top: 1.5rem;
		padding-top: 1rem;
	}
	.legend-item {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.78rem;
		font-weight: 500;
		color: var(--muted);
	}
	.legend-swatch { width: 10px; height: 10px; border-radius: 3px; }
	.legend-swatch.now { background: var(--zobo-700); }
	.legend-swatch.prev { background: var(--gold-light); }

	/* ============ INSPECT PANEL ============ */
	.inspect {
		background: #fdfbf8;
		overflow-y: auto;
		min-width: 0;
	}
	.inspect-module {
		padding: 1.25rem;
		border-bottom: 1px solid var(--line);
	}
	.inspect-head {
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: space-between;
		background: none;
		border: none;
		font-family: inherit;
		font-size: 0.875rem;
		font-weight: 600;
		color: #4a423c;
		cursor: pointer;
		padding: 0;
		margin-bottom: 0.85rem;
	}
	.inspect-head:hover { color: var(--ink); }
	.inspect-head :global(.chev-collapsed) { transform: rotate(-90deg); }
	.inspect-head :global(svg) { color: var(--muted-2); }

	.inspect-cards { display: flex; flex-direction: column; gap: 0.6rem; }
	.mini-card {
		display: flex;
		align-items: flex-start;
		gap: 0.75rem;
		background: var(--sheet);
		border: 1px solid var(--line);
		border-radius: 12px;
		padding: 0.8rem;
		box-shadow: 0 1px 2px rgba(43, 6, 15, 0.04);
	}
	.mini-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 30px;
		height: 30px;
		border-radius: 8px;
		flex-shrink: 0;
	}
	.mini-icon.rose { background: rgba(151, 27, 61, 0.1); color: var(--zobo-600); }
	.mini-icon.gold { background: rgba(201, 143, 58, 0.14); color: var(--gold); }
	.mini-icon.plum { background: rgba(74, 13, 31, 0.1); color: var(--zobo-800); }
	.mini-card h4 { font-size: 0.78rem; font-weight: 600; color: var(--ink); margin: 0; }
	.mini-card span { font-size: 0.7rem; color: var(--muted-2); display: block; margin-top: 0.1rem; }

	.inspect-insight { display: flex; gap: 0.7rem; align-items: flex-start; }
	.inspect-insight p { font-size: 0.78rem; line-height: 1.5; color: var(--muted); margin: 0; }

	/* ============ MOBILE ============ */
	@media (max-width: 760px) {
		.workspace { grid-template-columns: 1fr; }
		.analytics { border-right: none; border-bottom: 1px solid var(--line); }
		.chart-label { font-size: 0.56rem; }
		.bar { width: 15px; }
	}
</style>