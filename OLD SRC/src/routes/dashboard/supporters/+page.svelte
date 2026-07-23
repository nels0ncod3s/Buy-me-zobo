<script>
	import { Heart } from '@lucide/svelte';
</script>

<svelte:head>
	<title>Supporters — Buy Me Zobo</title>
</svelte:head>

<div class="dash">
	<div class="dash-welcome">
		<h2>Supporters</h2>
		<p>Everyone who's sent you a Zobo will show up here.</p>
	</div>

	<section class="card">
		<div class="empty-state">
			<span class="empty-icon"><Heart size={22} strokeWidth={1.8} /></span>
			<h4>No supporters yet</h4>
			<p>
				Once someone sends you a Zobo, they'll show up here with their name, message, and how much
				they sent.
			</p>
			<a href="/dashboard" class="btn-share">Share your page</a>
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
	}

	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		gap: 0.6rem;
		padding: 3.5rem 1.5rem;
	}
	.empty-icon {
		width: 52px;
		height: 52px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--canvas);
		color: var(--muted-2);
		margin-bottom: 0.3rem;
	}
	.empty-state h4 {
		font-size: 1rem;
		font-weight: 700;
		color: var(--ink);
		margin: 0;
	}
	.empty-state p {
		font-size: 0.85rem;
		line-height: 1.5;
		color: var(--muted);
		margin: 0;
		max-width: 26rem;
	}
	.btn-share {
		margin-top: 0.75rem;
		display: inline-flex;
		align-items: center;
		font-family: inherit;
		font-weight: 600;
		font-size: 0.85rem;
		padding: 0.6rem 1.25rem;
		border-radius: 999px;
		background: var(--zobo-800);
		color: var(--cream);
		transition: background 0.15s ease;
	}
	.btn-share:hover {
		background: var(--zobo-700);
	}
</style>
