<script>
	import AuthScreen from '$lib/components/AuthScreen.svelte';
	let { form } = $props();
</script>

<AuthScreen mode="reset-password" {form} />
