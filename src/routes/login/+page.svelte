<script>
	import { goto } from '$app/navigation';
	import Brand from '$lib/components/Brand.svelte';
	import ZoboCup from '$lib/components/ZoboCup.svelte';
	import ActionButton from '$lib/components/ActionButton.svelte';
	import { creator } from '$lib/demo.js';
	import { ArrowLeft, ArrowRight } from '@lucide/svelte';
</script>

<svelte:head><title>Welcome back — Buy Me Zobo</title></svelte:head>
<div class="auth-shell">
	<aside class="auth-art">
		<Brand light />
		<div>
			<span class="eyebrow">THE GOOD THINGS ARE STILL HERE</span>
			<h2>Welcome back.<br /><span class="serif italic">We've kept your cup.</span></h2>
			<p>Your work. Your people. A little kindness to keep you going.</p>
			<ZoboCup class="auth-cup" />
		</div>
		<span class="auth-art-footer">MADE WITH HEART. SHARED WITH ZOBO.</span>
	</aside>
	<main class="auth-content">
		<div class="row">
			<a class="text-link" href="/"><ArrowLeft size={15} /> Back to home</a><a
				class="text-link"
				href="/signup">Start a page</a
			>
		</div>
		<div class="auth-form-wrap">
			<span class="eyebrow">YOUR CREATIVE CORNER</span>
			<h1>
				{$creator.displayName
					? `Hello again, ${$creator.displayName.split(' ')[0]}.`
					: 'Come on in.'}
			</h1>
			<p>Explore your workspace in demo mode.</p>
			<ActionButton
				class="button full"
				busyLabel="Opening your workspace…"
				action={() => goto('/dashboard')}>Open demo dashboard <ArrowRight size={16} /></ActionButton
			>
			<div class="auth-demo-note">
				Login is mocked for now. This opens the profile saved on this browser and does not
				authenticate an account.
			</div>
		</div>
		<span class="auth-bottom">A LITTLE LOVE FOR WHAT YOU MAKE.</span>
	</main>
</div>
