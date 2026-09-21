<script>
	import CreatorPage from '$lib/components/CreatorPage.svelte';
	let { data } = $props();
</script>

<CreatorPage profileData={data.profile} giftData={data.gifts} links={data.links} />
