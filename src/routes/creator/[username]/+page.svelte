<script>
	import { page } from '$app/state';
	import { creator, ready } from '$lib/demo.js';
	import CreatorPage from '$lib/components/CreatorPage.svelte';
	import Brand from '$lib/components/Brand.svelte';
</script>

<svelte:head><meta name="robots" content="noindex,nofollow" /></svelte:head>
{#if !$ready}<div class="missing-page">
		<Brand />
		<p role="status">Loading this creator page…</p>
	</div>{:else if $creator.username && page.params.username === $creator.username}<CreatorPage
	/>{:else}<div class="missing-page">
		<Brand />
		<h1>This little corner isn't here yet.</h1>
		<p>
			Demo profiles are saved in the browser where they were created. Try our example creator page
			or make a page of your own.
		</p>
		<div>
			<a class="button" href="/example">View the example</a><a
				class="button secondary"
				href="/signup">Create your page</a
			>
		</div>
	</div>{/if}

<style>
	.missing-page {
		max-width: 650px;
		margin: 80px auto;
		padding: 25px;
		display: flex;
		align-items: flex-start;
		flex-direction: column;
		gap: 25px;
	}
	.missing-page h1 {
		font-size: 42px;
	}
	.missing-page p {
		font-size: 14px;
	}
	.missing-page > div {
		display: flex;
		flex-wrap: wrap;
		gap: 15px;
	}
</style>
