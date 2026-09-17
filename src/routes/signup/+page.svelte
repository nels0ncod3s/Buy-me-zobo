<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { createDemo, validateUsername, notify } from '$lib/demo.js';
	import Brand from '$lib/components/Brand.svelte';
	import ZoboCup from '$lib/components/ZoboCup.svelte';
	import { ArrowRight, ArrowLeft, Check } from '@lucide/svelte';
	let step = $state(1),
		username = $state(''),
		displayName = $state(''),
		email = $state(''),
		busy = $state(false),
		error = $state('');
	onMount(() => {
		username = new URLSearchParams(window.location.search).get('u') || '';
	});
	function next(e) {
		e.preventDefault();
		try {
			username = validateUsername(username);
			error = '';
			step = 2;
		} catch (err) {
			error = err.message;
		}
	}
	async function submit(e) {
		e.preventDefault();
		busy = true;
		error = '';
		try {
			createDemo(username, email, displayName);
			await goto('/dashboard');
			notify('Your demo page is ready. Make yourself at home.');
		} catch (err) {
			error = err.message;
			notify(error, 'error');
		} finally {
			busy = false;
		}
	}
</script>

<svelte:head><title>Create your page — Buy Me Zobo</title></svelte:head>
<div class="auth-shell">
	<aside class="auth-art">
		<Brand light />
		<div>
			<span class="eyebrow">YOUR WORK DESERVES A LITTLE LOVE</span>
			<h2>A little corner.<br /><span class="serif italic">A lot of possibility.</span></h2>
			<p>Make a home for the people who want to see you keep going.</p>
			<ZoboCup class="auth-cup" />
		</div>
		<span class="auth-art-footer">MADE WITH HEART. SHARED WITH ZOBO.</span>
	</aside>
	<main class="auth-content">
		<div class="row">
			<a class="text-link" href="/"><ArrowLeft size={15} /> Back to home</a><a
				class="text-link"
				href="/login">Log in</a
			>
		</div>
		<div class="auth-form-wrap">
			<span class="eyebrow">YOUR NEXT LITTLE BEGINNING</span>
			<div class="auth-progress">
				<span class:current={step === 1}>01 / Your link</span><span class:current={step === 2}
					>02 / Your profile</span
				>
			</div>
			<h1>{step === 1 ? 'Make room for good things.' : 'Put a name to your creativity.'}</h1>
			<p>
				{step === 1
					? 'Pick a name for your creative corner.'
					: `You're creating /creator/${username}.`}
			</p>
			{#if step === 1}<form onsubmit={next}>
					<label class="field"
						>Your page name<input
							bind:value={username}
							maxlength="24"
							placeholder="yourname"
							autocapitalize="none"
							autocomplete="off"
							spellcheck="false"
							required
						/><small>3–24 letters, numbers, or underscores.</small></label
					>{#if error}<p class="auth-error" role="alert">{error}</p>{/if}<button class="button full"
						>Continue <ArrowRight size={16} /></button
					>
				</form>{:else}<form onsubmit={submit}>
					<label class="field"
						>What should we call you?<input
							bind:value={displayName}
							placeholder="Your display name"
							maxlength="60"
							autocomplete="name"
							required
						/></label
					><label class="field"
						>Your email<input
							type="email"
							bind:value={email}
							placeholder="you@example.com"
							autocomplete="email"
							required
						/></label
					>{#if error}<p class="auth-error" role="alert">{error}</p>{/if}<button
						class="button full"
						disabled={busy}
						aria-busy={busy}
						>{#if busy}<span class="spinner"></span>Creating your corner…{:else}Create my demo page <Check
								size={16}
							/>{/if}</button
					><button
						type="button"
						class="text-link auth-back"
						onclick={() => {
							step = 1;
							error = '';
						}}><ArrowLeft size={14} /> Change page name</button
					>
				</form>{/if}
			<div class="auth-demo-note">
				Demo mode: no password or authentication is required. Your profile is saved in this browser.
				Creating a new demo replaces the previous profile on this device.
			</div>
		</div>
		<span class="auth-bottom">A LITTLE LOVE FOR WHAT YOU MAKE.</span>
	</main>
</div>
