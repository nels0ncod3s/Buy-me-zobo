<script>
	import { enhance } from '$app/forms';
	import { onMount, tick } from 'svelte';
	let { data, form } = $props();
	let digits = $state(['', '', '', '', '', '']),
		busy = $state(false),
		resending = $state(false),
		now = $state(Date.now());
	let boxes = [],
		verificationForm;
	let remaining = $derived(Math.max(0, 600 - Math.floor((now - data.sentAt) / 1000)));
	let cooldown = $derived(Math.max(0, 60 - Math.floor((now - data.sentAt) / 1000)));
	let complete = $derived(digits.every((d) => /^[0-9]$/.test(d)));
	onMount(() => {
		boxes[0]?.focus();
		const timer = setInterval(() => (now = Date.now()), 1000);
		return () => clearInterval(timer);
	});
	async function fill(index, value) {
		const clean = value.replace(/[^0-9]/g, '');
		const next = [...digits];
		if (!clean) next[index] = '';
		else for (let i = 0; i < clean.length && index + i < 6; i++) next[index + i] = clean[i];
		digits = next;
		await tick();
		boxes[Math.min(index + clean.length, 5)]?.focus();
		if (digits.every((d) => /^[0-9]$/.test(d)) && !busy && remaining > 0)
			verificationForm.requestSubmit();
	}
	function keydown(event, index) {
		if (event.key === 'Backspace' && !digits[index] && index > 0) {
			event.preventDefault();
			digits[index - 1] = '';
			boxes[index - 1]?.focus();
		}
		if (event.key === 'ArrowLeft' && index > 0) {
			event.preventDefault();
			boxes[index - 1]?.focus();
		}
		if (event.key === 'ArrowRight' && index < 5) {
			event.preventDefault();
			boxes[index + 1]?.focus();
		}
	}
</script>

<p class="verification-intro">Enter the six-digit code sent to <strong>{data.email}</strong>.</p>
<form
	method="POST"
	action="?/verify"
	bind:this={verificationForm}
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
	<input type="hidden" name="code" value={digits.join('')} />
	<fieldset class="code-field">
		<legend>Verification code</legend>
		<div class="code-boxes">
			{#each digits as digit, i}<input
					bind:this={boxes[i]}
					value={digit}
					aria-label={`Digit ${i + 1} of 6`}
					inputmode="numeric"
					autocomplete={i === 0 ? 'one-time-code' : 'off'}
					maxlength="6"
					pattern="[0-9]*"
					disabled={busy || resending || remaining === 0}
					onfocus={(e) => e.currentTarget.select()}
					oninput={(e) => fill(i, e.currentTarget.value)}
					onkeydown={(e) => keydown(e, i)}
					onpaste={(e) => {
						e.preventDefault();
						fill(i, e.clipboardData.getData('text'));
					}}
				/>{/each}
		</div>
	</fieldset>
	<p class="code-timer">
		{remaining > 0
			? `Code expires in ${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2, '0')}`
			: 'Your code has expired. Request a fresh one below.'}
	</p>
	{#if form?.error}<p class="auth-error" role="alert">{form.error}</p>{/if}
	{#if form?.success}<p class="code-success" role="status">{form.success}</p>{/if}
	<button
		class="button full"
		disabled={!complete || busy || resending || remaining === 0}
		aria-busy={busy}>{busy ? 'Verifying your email…' : 'Verify and continue →'}</button
	>
</form>
<form
	method="POST"
	action="?/resend"
	class="resend-form"
	use:enhance={() => {
		resending = true;
		return async ({ result, update }) => {
			try {
				await update({ reset: false });
				if (result.type === 'success') {
					digits = ['', '', '', '', '', ''];
					now = Date.now();
					resending = false;
					await tick();
					boxes[0]?.focus();
				}
			} finally {
				resending = false;
			}
		};
	}}
>
	<button class="text-link" disabled={cooldown > 0 || busy || resending} aria-busy={resending}
		>{resending
			? 'Sending a new code…'
			: cooldown > 0
				? `Resend code in ${cooldown}s`
				: 'Resend code'}</button
	>
	<a class="text-link" href="/signup">Use a different email</a>
</form>

<style>
	.verification-intro {
		margin: 0 0 24px;
		font-size: 15px;
		overflow-wrap: anywhere;
	}
	.verification-intro strong {
		color: var(--ink);
	}
	.code-field {
		border: 0;
		padding: 0;
		margin: 0;
		min-width: 0;
	}
	.code-field legend {
		font-size: 13px;
		margin-bottom: 10px;
		font-weight: 600;
	}
	.code-boxes {
		display: grid;
		grid-template-columns: repeat(6, minmax(0, 1fr));
		gap: 9px;
	}
	.code-boxes input {
		width: 100%;
		min-width: 0;
		height: 58px;
		border: 1px solid var(--line);
		border-radius: 9px;
		background: var(--paper);
		text-align: center;
		font-size: 24px;
		font-weight: 600;
		color: var(--plum);
		padding: 0;
	}
	.code-timer {
		font-size: 13px;
	}
	.code-success {
		font-size: 14px;
		color: var(--wine);
	}
	.resend-form {
		display: flex !important;
		flex-direction: row !important;
		justify-content: space-between;
		gap: 12px !important;
		margin-top: 22px;
		flex-wrap: wrap;
	}
	.resend-form button {
		background: none;
		border: 0;
		padding: 0;
		font: inherit;
		font-size: 13px;
	}
	.resend-form a {
		font-size: 13px;
	}
	button:disabled {
		opacity: 0.55;
		cursor: default;
	}
	@media (max-width: 380px) {
		.code-boxes {
			gap: 6px;
		}
		.code-boxes input {
			height: 48px;
		}
	}
</style>
