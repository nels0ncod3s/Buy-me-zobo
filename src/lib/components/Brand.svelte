<script>
	import ZoboCup from './ZoboCup.svelte';
	let { light = false } = $props();
</script>

<a href="/" class="brand" class:light aria-label="Buy Me Zobo home"
	><ZoboCup class="brand-cup" /><span
		>buy me<span class="brand-zobo">zobo<span class="brand-period">.</span></span></span
	></a
>
