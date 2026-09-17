<script>
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { onMount } from 'svelte';
	import { hydrate } from '$lib/demo.js';
	import Toast from '$lib/components/Toast.svelte';
	onMount(hydrate);

	let { children } = $props();
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
{@render children()}
<Toast />
