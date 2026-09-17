<script>
	import { notify } from '$lib/demo.js';
	let {
		action,
		success = '',
		busyLabel = 'Working…',
		children,
		class: className = 'button',
		disabled = false,
		type = 'button',
		...rest
	} = $props();
	let busy = $state(false);
	async function run() {
		if (busy) return;
		busy = true;
		try {
			await action();
			if (success) notify(success);
		} catch (error) {
			notify(error?.message || 'Something went wrong. Please try again.', 'error');
		} finally {
			busy = false;
		}
	}
</script>

<button
	{type}
	class={className}
	disabled={disabled || busy}
	aria-busy={busy}
	onclick={run}
	{...rest}
>
	{#if busy}<span class="spinner" aria-hidden="true"
		></span>{busyLabel}{:else}{@render children()}{/if}
</button>
