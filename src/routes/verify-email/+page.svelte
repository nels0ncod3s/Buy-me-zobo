<script>
	import AuthScreen from '$lib/components/AuthScreen.svelte';
	let { form, data } = $props();
</script>

<AuthScreen mode="verify-email" {form} verification={data} />
