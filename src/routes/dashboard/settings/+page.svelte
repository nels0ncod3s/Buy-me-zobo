<script>
	import { User, Landmark, Bell } from '@lucide/svelte';

	// Static/mock settings — not wired to a backend.
	let displayName = $state('Nelson Adeyemi');
	let username = $state('trxpznxl');
	let bio = $state('Podcaster telling Lagos food stories, one episode at a time.');

	let notifyNewSupporter = $state(true);
	let notifyPayout = $state(true);
	let notifyDigest = $state(false);
</script>

<svelte:head>
	<title>Settings — Buy Me Zobo</title>
</svelte:head>

<div class="dash">
	<div class="dash-welcome">
		<div>
			<h2>Settings</h2>
			<p>Manage your page, payout details, and notifications.</p>
		</div>
	</div>

	<section class="card">
		<div class="card-head">
			<span class="card-icon"><User size={16} strokeWidth={1.9} /></span>
			<div>
				<h3>Profile</h3>
				<p>This is what fans see on your page.</p>
			</div>
		</div>

		<div class="avatar-row">
			<span class="avatar-circle">N</span>
			<div class="avatar-actions">
				<button type="button" class="btn-secondary">Change photo</button>
				<span class="avatar-hint">JPG or PNG, up to 1MB.</span>
			</div>
		</div>

		<div class="field-grid">
			<label class="field">
				<span>Display name</span>
				<input type="text" bind:value={displayName} />
			</label>
			<label class="field">
				<span>Page address</span>
				<span class="field-input-affix">
					<span>buymezobo.com/</span>
					<input type="text" bind:value={username} />
				</span>
			</label>
			<label class="field field-wide">
				<span>Bio</span>
				<textarea rows="2" bind:value={bio}></textarea>
			</label>
		</div>
	</section>

	<section class="card">
		<div class="card-head">
			<span class="card-icon"><Landmark size={16} strokeWidth={1.9} /></span>
			<div>
				<h3>Payout bank</h3>
				<p>Where your Friday payouts land.</p>
			</div>
		</div>
		<div class="field-grid">
			<label class="field">
				<span>Bank</span>
				<input type="text" placeholder="Not connected" readonly />
			</label>
			<label class="field">
				<span>Account number</span>
				<input type="text" placeholder="Not connected" readonly />
			</label>
		</div>
		<a href="/dashboard/payouts" class="btn-secondary bank-link">Connect a bank</a>
	</section>

	<section class="card">
		<div class="card-head">
			<span class="card-icon"><Bell size={16} strokeWidth={1.9} /></span>
			<div>
				<h3>Notifications</h3>
				<p>Choose what you hear about, and how often.</p>
			</div>
		</div>
		<div class="toggle-list">
			<label class="toggle-row">
				<div>
					<h4>New supporter</h4>
					<span>Get notified the moment someone sends a Zobo.</span>
				</div>
				<input type="checkbox" class="switch" bind:checked={notifyNewSupporter} />
			</label>
			<label class="toggle-row">
				<div>
					<h4>Payout sent</h4>
					<span>A heads up each time money lands in your bank.</span>
				</div>
				<input type="checkbox" class="switch" bind:checked={notifyPayout} />
			</label>
			<label class="toggle-row">
				<div>
					<h4>Weekly digest</h4>
					<span>A short summary of your page's performance.</span>
				</div>
				<input type="checkbox" class="switch" bind:checked={notifyDigest} />
			</label>
		</div>
	</section>

	<div class="save-row">
		<button type="button" class="danger-link">Deactivate my page</button>
		<button type="button" class="btn-save">Save changes</button>
	</div>
</div>

<style>
	.dash {
		flex: 1;
		min-width: 0;
		width: 100%;
		padding: 1.75rem clamp(1.25rem, 3vw, 2.25rem) 2.5rem;
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
		max-width: 900px;
		margin: 0 auto;
	}
	.dash-welcome h2 {
		font-size: 1.5rem;
		font-weight: 700;
		letter-spacing: -0.02em;
		color: var(--zobo-950);
		margin: 0 0 0.3rem;
	}
	.dash-welcome p {
		font-size: 0.9rem;
		color: var(--muted);
		margin: 0;
	}

	.card {
		background: var(--sheet);
		border: 1px solid var(--line);
		border-radius: 14px;
		padding: 1.4rem 1.5rem;
		min-width: 0;
	}
	.card-head {
		display: flex;
		align-items: flex-start;
		gap: 0.75rem;
		margin-bottom: 1.25rem;
	}
	.card-icon {
		width: 34px;
		height: 34px;
		border-radius: 9px;
		flex-shrink: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(151, 27, 61, 0.09);
		color: var(--zobo-700);
	}
	.card-head h3 {
		font-size: 0.95rem;
		font-weight: 700;
		color: var(--zobo-950);
		margin: 0 0 0.2rem;
	}
	.card-head p {
		font-size: 0.8rem;
		color: var(--muted);
		margin: 0;
	}

	/* ============ AVATAR ============ */
	.avatar-row {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding-bottom: 1.4rem;
		margin-bottom: 1.4rem;
		border-bottom: 1px solid var(--line);
	}
	.avatar-circle {
		width: 56px;
		height: 56px;
		border-radius: 50%;
		flex-shrink: 0;
		background: linear-gradient(150deg, var(--zobo-600), var(--zobo-900));
		color: var(--cream);
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: 700;
		font-size: 1.35rem;
	}
	.avatar-actions {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
	}
	.btn-secondary {
		display: inline-flex;
		align-items: center;
		align-self: flex-start;
		font-family: inherit;
		font-weight: 600;
		font-size: 0.8rem;
		color: var(--zobo-800);
		background: var(--canvas);
		border: 1px solid var(--line);
		border-radius: 999px;
		padding: 0.4rem 0.9rem;
		cursor: pointer;
		transition:
			background 0.15s ease,
			border-color 0.15s ease;
	}
	.bank-link {
		margin-top: 1.1rem;
	}
	.btn-secondary:hover {
		background: rgba(92, 16, 41, 0.06);
		border-color: rgba(92, 16, 41, 0.2);
	}
	.avatar-hint {
		font-size: 0.72rem;
		color: var(--muted-2);
	}

	.field-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
	}
	.field {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
		min-width: 0;
	}
	.field-wide {
		grid-column: 1 / -1;
	}
	.field span:first-child {
		font-size: 0.78rem;
		font-weight: 600;
		color: var(--ink);
	}
	.field input,
	.field textarea {
		width: 100%;
		min-width: 0;
		box-sizing: border-box;
		font-family: inherit;
		font-size: 0.85rem;
		color: var(--ink);
		background: var(--canvas);
		border: 1px solid var(--line);
		border-radius: 9px;
		padding: 0.55rem 0.75rem;
		resize: vertical;
	}
	.field input:focus,
	.field textarea:focus {
		outline: none;
		border-color: var(--zobo-700);
	}
	.field input[readonly] {
		color: var(--muted);
		cursor: not-allowed;
	}
	.field-input-affix {
		display: flex;
		align-items: center;
		background: var(--canvas);
		border: 1px solid var(--line);
		border-radius: 9px;
		padding: 0 0 0 0.75rem;
		overflow: hidden;
		min-width: 0;
	}
	.field-input-affix span {
		font-size: 0.85rem;
		color: var(--muted-2);
		white-space: nowrap;
		flex-shrink: 0;
	}
	.field-input-affix input {
		flex: 1;
		width: auto;
		min-width: 0;
		border: none;
		background: none;
		padding: 0.55rem 0.75rem 0.55rem 0.1rem;
	}
	.field-input-affix:focus-within {
		border-color: var(--zobo-700);
	}

	/* ============ TOGGLES ============ */
	.toggle-list {
		display: flex;
		flex-direction: column;
		gap: 0.9rem;
	}
	.toggle-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		cursor: pointer;
	}
	.toggle-row h4 {
		font-size: 0.85rem;
		font-weight: 600;
		color: var(--ink);
		margin: 0;
	}
	.toggle-row span {
		font-size: 0.76rem;
		color: var(--muted-2);
	}
	.switch {
		appearance: none;
		width: 38px;
		height: 22px;
		border-radius: 999px;
		background: var(--line);
		position: relative;
		flex-shrink: 0;
		cursor: pointer;
		transition: background 0.15s ease;
	}
	.switch::after {
		content: '';
		position: absolute;
		top: 2px;
		left: 2px;
		width: 18px;
		height: 18px;
		border-radius: 50%;
		background: #fff;
		box-shadow: 0 1px 2px rgba(43, 6, 15, 0.25);
		transition: transform 0.15s ease;
	}
	.switch:checked {
		background: var(--zobo-700);
	}
	.switch:checked::after {
		transform: translateX(16px);
	}

	.save-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		flex-wrap: wrap;
	}
	.danger-link {
		font-family: inherit;
		font-size: 0.82rem;
		font-weight: 500;
		color: var(--muted-2);
		background: none;
		border: none;
		cursor: pointer;
		padding: 0.4rem 0;
		transition: color 0.15s ease;
	}
	.danger-link:hover {
		color: #c94b4b;
	}
	.btn-save {
		font-family: inherit;
		font-weight: 600;
		font-size: 0.88rem;
		color: var(--cream);
		background: var(--zobo-800);
		border: none;
		border-radius: 999px;
		padding: 0.65rem 1.5rem;
		cursor: pointer;
		transition: background 0.15s ease;
	}
	.btn-save:hover {
		background: var(--zobo-700);
	}

	@media (max-width: 560px) {
		.field-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
