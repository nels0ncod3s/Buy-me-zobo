<script>
	import AuthScreen from '$lib/components/AuthScreen.svelte';
	let { form, data } = $props();
</script>

<AuthScreen mode="onboarding" {form} initialUsername={data.suggestedUsername} />
