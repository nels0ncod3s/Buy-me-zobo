<script>
	import { Mail, Lock, Eye, EyeOff, ArrowRight, ArrowLeft } from '@lucide/svelte';

	// Static/mock auth — links straight to the dashboard.
	let email = $state('');
	let password = $state('');
	let showPassword = $state(false);

	function handleSubmit(e) {
		e.preventDefault();
		// mock — would authenticate then redirect
		window.location.href = '/dashboard';
	}
</script>

<svelte:head>
	<title>Log in — Buy Me Zobo</title>
</svelte:head>

<div class="auth">
	<!-- ===== LEFT BRAND PANEL ===== -->
	<aside class="auth-brand">
		<a href="/" class="back-link"><ArrowLeft size={16} strokeWidth={2} /> Back to site</a>

		<div class="brand-mid">
			<span class="brand-mark" aria-hidden="true"></span>
			<h2>Welcome back.</h2>
			<p>Your supporters have been busy. Log in to see who sent love while you were away.</p>

			<div class="brand-stat-card">
				<span class="bsc-dot"></span>
				<div>
					<strong>₦18,000</strong>
					<span>received since your last login</span>
				</div>
			</div>
		</div>

		<div class="brand-avatars">
			{#each [['TA', '#7a1633'], ['ZK', '#c98f3a'], ['EM', '#4a0d1f'], ['AI', '#971b3d']] as [initials, bg]}
				<span class="brand-avatar" style="background: {bg}">{initials}</span>
			{/each}
			<span class="brand-avatars-label">3,200+ creators paid this month</span>
		</div>
	</aside>

	<!-- ===== RIGHT FORM PANEL ===== -->
	<main class="auth-main">
		<div class="auth-mobile-top">
			<a href="/" class="brand-mini">
				<span class="brand-mark" aria-hidden="true"></span>
				<span>Buy Me Zobo</span>
			</a>
			<a href="/signup" class="auth-switch">Sign up</a>
		</div>

		<div class="auth-form-wrap">
			<div class="auth-form-head">
				<h1>Log in to your page</h1>
				<p>Enter your details to reach your dashboard.</p>
			</div>

			<div class="oauth-list">
				<a href="/dashboard" class="oauth-btn">
					<span class="oauth-icon" style="background:#fff; color:#4285F4; border:1px solid #eee;"
						>G</span
					>
					Continue with Google
				</a>
				<a href="/dashboard" class="oauth-btn">
					<span class="oauth-icon" style="background:#111; color:#fff;">A</span>
					Continue with Apple
				</a>
			</div>

			<div class="divider"><span>or</span></div>

			<form class="auth-form" onsubmit={handleSubmit}>
				<label class="field">
					<span class="field-label">Email</span>
					<span class="field-input">
						<Mail size={17} strokeWidth={1.75} />
						<input
							type="email"
							bind:value={email}
							placeholder="you@example.com"
							autocomplete="email"
							required
						/>
					</span>
				</label>

				<label class="field">
					<span class="field-label">Password</span>
					<span class="field-input">
						<Lock size={17} strokeWidth={1.75} />
						<input
							type={showPassword ? 'text' : 'password'}
							bind:value={password}
							placeholder="••••••••"
							autocomplete="current-password"
							required
						/>
						<button
							type="button"
							class="field-eye"
							aria-label="Toggle password"
							onclick={() => (showPassword = !showPassword)}
						>
							{#if showPassword}<EyeOff size={17} strokeWidth={1.75} />{:else}<Eye
									size={17}
									strokeWidth={1.75}
								/>{/if}
						</button>
					</span>
				</label>

				<div class="field-row">
					<label class="remember"><input type="checkbox" /> Remember me</label>
					<button type="button" class="forgot">Forgot password?</button>
				</div>

				<button type="submit" class="btn btn-primary btn-full btn-lg">
					Log in <ArrowRight size={18} strokeWidth={2} />
				</button>
			</form>

			<p class="auth-alt">New to Buy Me Zobo? <a href="/signup">Create your page</a></p>
		</div>
	</main>
</div>

<style>
	:global(:root) {
		--zobo-950: #2b060f;
		--zobo-900: #4a0d1f;
		--zobo-800: #5c1029;
		--zobo-700: #7a1633;
		--zobo-600: #971b3d;
		--cream: #fbf3e7;
		--cream-2: #f4e6d3;
		--ink: #23110f;
		--gold: #c98f3a;
		--gold-light: #e0b565;
	}
	:global(body) {
		margin: 0;
	}

	.auth {
		font-family: 'Geist Variable', ui-sans-serif, system-ui, 'Segoe UI', Roboto, sans-serif;
		min-height: 100vh;
		min-height: 100dvh;
		display: grid;
		grid-template-columns: 0.9fr 1.1fr;
		background: var(--cream);
		color: var(--ink);
	}
	* {
		box-sizing: border-box;
	}
	a {
		text-decoration: none;
		color: inherit;
	}
	h1,
	h2 {
		margin: 0;
		font-weight: 700;
		letter-spacing: -0.02em;
	}

	/* ===== BRAND PANEL ===== */
	.auth-brand {
		background: linear-gradient(165deg, var(--zobo-800), var(--zobo-950));
		color: var(--cream);
		padding: 2.25rem;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		min-width: 0;
	}
	.back-link {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		font-size: 0.88rem;
		font-weight: 500;
		color: rgba(251, 243, 231, 0.75);
		width: fit-content;
	}
	.back-link:hover {
		color: var(--cream);
	}
	.brand-mid {
		max-width: 340px;
	}
	.brand-mark {
		display: block;
		width: 40px;
		height: 40px;
		border-radius: 50% 50% 50% 6px;
		background: linear-gradient(150deg, var(--gold-light), var(--gold));
		margin-bottom: 1.75rem;
	}
	.brand-mid h2 {
		font-size: 2rem;
		margin-bottom: 0.75rem;
	}
	.brand-mid p {
		color: rgba(251, 243, 231, 0.75);
		line-height: 1.6;
		font-size: 1rem;
		margin: 0 0 1.75rem;
	}
	.brand-stat-card {
		display: flex;
		align-items: center;
		gap: 0.85rem;
		background: rgba(251, 243, 231, 0.06);
		border: 1px solid rgba(251, 243, 231, 0.12);
		border-radius: 14px;
		padding: 1rem 1.15rem;
	}
	.bsc-dot {
		width: 10px;
		height: 10px;
		border-radius: 50%;
		background: var(--gold-light);
		flex-shrink: 0;
	}
	.brand-stat-card strong {
		display: block;
		font-size: 1.2rem;
	}
	.brand-stat-card span {
		font-size: 0.82rem;
		color: rgba(251, 243, 231, 0.7);
	}
	.brand-avatars {
		display: flex;
		align-items: center;
	}
	.brand-avatar {
		width: 34px;
		height: 34px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 0.7rem;
		font-weight: 700;
		color: var(--cream);
		border: 2px solid var(--zobo-950);
		margin-left: -10px;
	}
	.brand-avatar:first-child {
		margin-left: 0;
	}
	.brand-avatars-label {
		font-size: 0.82rem;
		color: rgba(251, 243, 231, 0.7);
		margin-left: 0.85rem;
	}

	/* ===== FORM PANEL ===== */
	.auth-main {
		display: flex;
		flex-direction: column;
		padding: 2rem 2.5rem;
		/* Grid items default to min-width:auto, which lets a 1fr track blow out
		   past its container when content can't shrink further — clamp it. */
		min-width: 0;
	}
	.auth-mobile-top {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}
	.brand-mini {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-weight: 700;
		color: var(--zobo-950);
	}
	.brand-mini .brand-mark {
		width: 26px;
		height: 26px;
		margin: 0;
	}
	.auth-switch {
		font-size: 0.9rem;
		font-weight: 600;
		color: var(--zobo-800);
	}
	.auth-switch:hover {
		color: var(--zobo-600);
	}

	.auth-form-wrap {
		flex: 1;
		display: flex;
		flex-direction: column;
		justify-content: center;
		width: 100%;
		max-width: 400px;
		margin: 0 auto;
		padding: 2rem 0;
	}
	.auth-form-head {
		margin-bottom: 1.75rem;
	}
	.auth-form-head h1 {
		font-size: 1.75rem;
		color: var(--zobo-950);
		margin-bottom: 0.4rem;
	}
	.auth-form-head p {
		margin: 0;
		color: #6b5049;
		font-size: 0.95rem;
	}

	.oauth-list {
		display: flex;
		flex-direction: column;
		gap: 0.7rem;
		margin-bottom: 1.5rem;
	}
	.oauth-btn {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		border: 1.5px solid rgba(92, 16, 41, 0.15);
		border-radius: 12px;
		padding: 0.75rem 1rem;
		font-weight: 600;
		font-size: 0.95rem;
		background: #fffdf9;
		transition:
			border-color 0.15s ease,
			transform 0.15s ease;
	}
	.oauth-btn:hover {
		border-color: var(--zobo-700);
		transform: translateY(-1px);
	}
	.oauth-icon {
		width: 24px;
		height: 24px;
		border-radius: 6px;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 0.85rem;
		font-weight: 700;
		flex-shrink: 0;
	}

	.divider {
		display: flex;
		align-items: center;
		gap: 1rem;
		color: #9a7a6f;
		font-size: 0.85rem;
		margin: 0 0 1.5rem;
	}
	.divider::before,
	.divider::after {
		content: '';
		flex: 1;
		height: 1px;
		background: rgba(92, 16, 41, 0.15);
	}

	.auth-form {
		display: flex;
		flex-direction: column;
		gap: 1.1rem;
	}
	.field {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
	}
	.field-label {
		font-size: 0.85rem;
		font-weight: 600;
		color: var(--zobo-900);
	}
	.field-input {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		border: 1.5px solid rgba(92, 16, 41, 0.2);
		border-radius: 12px;
		padding: 0.7rem 0.9rem;
		background: #fffdf9;
		color: #9a7a6f;
		transition: border-color 0.15s ease;
	}
	.field-input:focus-within {
		border-color: var(--zobo-700);
	}
	.field-input input {
		flex: 1;
		border: none;
		outline: none;
		background: transparent;
		font-family: inherit;
		font-size: 0.95rem;
		color: var(--ink);
		min-width: 0;
	}
	.field-eye {
		background: none;
		border: none;
		color: #9a7a6f;
		cursor: pointer;
		display: flex;
		padding: 0;
	}
	.field-eye:hover {
		color: var(--zobo-700);
	}

	.field-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		font-size: 0.85rem;
	}
	.remember {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		color: #6b5049;
		cursor: pointer;
	}
	.remember input {
		accent-color: var(--zobo-800);
	}
	.forgot {
		background: none;
		border: none;
		padding: 0;
		font-family: inherit;
		color: var(--zobo-800);
		font-weight: 500;
		cursor: pointer;
	}
	.forgot:hover {
		color: var(--zobo-600);
	}

	.btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		font-family: inherit;
		font-weight: 600;
		font-size: 0.95rem;
		padding: 0.7rem 1.35rem;
		border-radius: 999px;
		border: none;
		cursor: pointer;
		transition:
			background 0.15s ease,
			transform 0.15s ease;
	}
	.btn-primary {
		background: var(--zobo-800);
		color: var(--cream);
	}
	.btn-primary:hover {
		background: var(--zobo-700);
		transform: translateY(-1px);
	}
	.btn-lg {
		padding: 0.9rem 1.7rem;
		font-size: 1rem;
	}
	.btn-full {
		width: 100%;
	}

	.auth-alt {
		text-align: center;
		margin: 1.5rem 0 0;
		font-size: 0.9rem;
		color: #6b5049;
	}
	.auth-alt a {
		color: var(--zobo-800);
		font-weight: 600;
	}
	.auth-alt a:hover {
		color: var(--zobo-600);
	}

	/* ===== RESPONSIVE ===== */
	@media (max-width: 860px) {
		.auth {
			grid-template-columns: 1fr;
		}
		.auth-brand {
			display: none;
		}
		.auth-main {
			padding: 1.25rem 1.5rem 2rem;
		}
	}
	@media (min-width: 861px) {
		.auth-mobile-top {
			display: none;
		}
	}
</style>
