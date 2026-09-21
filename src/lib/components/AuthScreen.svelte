<script>
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import Brand from './Brand.svelte';
	import ZoboCup from './ZoboCup.svelte';
	let { mode, form, initialUsername = '' } = $props();
	let busy = $state(false);
	const titles = {
		login: 'Come on in.',
		signup: 'Make room for good things.',
		onboarding: 'Make this page yours.',
		'forgot-password': 'A fresh start.',
		'reset-password': 'Choose a new password.'
	};
	const labels = {
		login: 'Log in',
		signup: 'Create account',
		onboarding: 'Create my page',
		'forgot-password': 'Send reset link',
		'reset-password': 'Save password'
	};
</script>

<svelte:head
	><title>{titles[mode]} — Buy Me Zobo</title><meta
		name="robots"
		content="noindex,nofollow"
	/></svelte:head
>
<div class="auth-shell">
	<aside class="auth-art">
		<Brand light />
		<div>
			<span class="eyebrow">YOUR WORK DESERVES A LITTLE LOVE</span>
			<h2>A little corner.<br /><span class="serif italic">A lot of possibility.</span></h2>
			<p>Your work. Your people. A little kindness to keep you going.</p>
			<ZoboCup class="auth-cup" />
		</div>
		<span class="auth-art-footer">MADE WITH HEART. SHARED WITH ZOBO.</span>
	</aside>
	<main class="auth-content">
		<div class="row">
			<a class="text-link" href="/">← Back to home</a><a
				class="text-link"
				href={mode === 'login' ? '/signup' : '/login'}
				>{mode === 'login' ? 'Start a page' : 'Log in'}</a
			>
		</div>
		<div class="auth-form-wrap">
			<span class="eyebrow">A HOME FOR YOUR CREATIVITY</span>
			<h1>{titles[mode]}</h1>
			<form
				method="POST"
				use:enhance={() => {
					busy = true;
					return async ({ update }) => {
						try {
							await update({ reset: false });
						} finally {
							busy = false;
						}
					};
				}}
			>
				{#if mode === 'signup'}<input
						type="hidden"
						name="username"
						value={page.url.searchParams.get('u') || ''}
					/>{/if}
				{#if mode === 'onboarding'}
					<label class="field"
						>Display name<input
							name="displayName"
							autocomplete="name"
							maxlength="60"
							required
						/></label
					>
					<label class="field"
						>Page address<input
							name="username"
							value={initialUsername}
							pattern={'[a-z0-9_]{3,24}'}
							minlength="3"
							maxlength="24"
							autocapitalize="none"
							required
						/><small>3–24 lowercase letters, numbers, or underscores.</small></label
					>
				{:else}
					{#if mode !== 'reset-password'}<label class="field"
							>Email<input
								name="email"
								type="email"
								autocomplete="email"
								maxlength="320"
								required
							/></label
						>{/if}
					{#if mode !== 'forgot-password'}<label class="field"
							>Password<input
								name="password"
								type="password"
								autocomplete={mode === 'login' ? 'current-password' : 'new-password'}
								minlength={mode === 'login' ? 1 : 10}
								maxlength="200"
								required
							/>{#if mode !== 'login'}<small>At least 10 characters.</small>{/if}</label
						>{/if}
				{/if}
				{#if form?.error}<p class="auth-error" role="alert">{form.error}</p>{/if}
				{#if form?.success}<p role="status">{form.success}</p>{/if}
				{#if page.url.searchParams.has('expired')}<p class="auth-error" role="alert">
						This link is invalid or expired. Request a new one.
					</p>{/if}
				{#if page.url.searchParams.has('reset')}<p role="status">
						Password updated. Sign in with your new password.
					</p>{/if}
				<button class="button full" disabled={busy} aria-busy={busy}
					>{busy ? 'One moment…' : labels[mode]}</button
				>
				{#if mode === 'login'}<a class="text-link" href="/forgot-password">Forgot your password?</a
					>{/if}
			</form>
		</div>
	</main>
</div>
