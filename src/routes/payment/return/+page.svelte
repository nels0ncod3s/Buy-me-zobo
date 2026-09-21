<script>
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { edge } from '$lib/supabase/client.js';
	import Brand from '$lib/components/Brand.svelte';
	import ActionButton from '$lib/components/ActionButton.svelte';
	let status = $state('checking'),
		message = $state('');
	async function check() {
		status = 'checking';
		message = '';
		try {
			const result = await edge('payment-status', {
				reference: page.url.searchParams.get('reference')
			});
			status = result.status;
		} catch (error) {
			status = 'error';
			message = error.message;
		}
	}
	onMount(() => {
		check();
	});
</script>

<svelte:head
	><title>Payment status — Buy Me Zobo</title><meta
		name="robots"
		content="noindex,nofollow"
	/></svelte:head
>
<main class="wrap receipt">
	<Brand />
	<section class="panel">
		<span class="eyebrow">A LITTLE KINDNESS</span>
		<h1>
			{status === 'successful'
				? 'Your zobo is delivered.'
				: status === 'checking'
					? 'Checking your payment…'
					: status === 'pending'
						? 'Still waiting for confirmation.'
						: status === 'failed'
							? 'Your payment was not completed.'
							: status === 'refunded'
								? 'This payment was refunded.'
								: 'Let’s check your payment.'}
		</h1>
		<p role="status">
			{message ||
				(status === 'successful'
					? 'Thank you for supporting someone’s creativity.'
					: status === 'pending'
						? 'Confirmation can take a moment. Check again shortly; please do not pay twice.'
						: 'Only confirmed payments appear on a creator’s page.')}
		</p>
		{#if status !== 'successful'}<ActionButton
				action={check}
				busyLabel="Checking…"
				disabled={status === 'checking'}>Check again</ActionButton
			>{/if}
		<a class="text-link" href="/">Back to home →</a>
	</section>
</main>

<style>
	.receipt {
		max-width: 650px;
		padding-block: 40px;
		display: grid;
		gap: 30px;
	}
	.panel {
		display: grid;
		gap: 24px;
	}
	h1 {
		font-size: clamp(28px, 6vw, 42px);
	}
</style>
