<script>
	import { notice } from '$lib/demo.js';
	import { Check, AlertCircle, X } from '@lucide/svelte';
	$effect(() => {
		const current = $notice;
		if (!current) return;
		const timer = setTimeout(
			() => {
				if ($notice?.id === current.id) notice.set(null);
			},
			current.kind === 'error' ? 10000 : 5500
		);
		return () => clearTimeout(timer);
	});
</script>

<div class="toast-region" aria-live="polite" aria-atomic="true">
	{#if $notice}<div class="toast" class:error={$notice.kind === 'error'}>
			{#if $notice.kind === 'error'}<AlertCircle size={20} />{:else}<Check size={20} />{/if}
			<span>{$notice.message}</span><button
				aria-label="Dismiss notification"
				onclick={() => notice.set(null)}><X size={18} /></button
			>
		</div>{/if}
</div>
