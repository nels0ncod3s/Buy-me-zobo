<script>
	import { creator, saveProfile, validateUsername, notify, creatorPath } from '$lib/demo.js';
	import ActionButton from '$lib/components/ActionButton.svelte';
	import { ArrowUpRight, Upload, Check } from '@lucide/svelte';
	let displayName = $state($creator.displayName);
	let username = $state($creator.username);
	let bio = $state($creator.bio);
	let notifications = $state({ ...$creator.notifications });
	let fileInput;
	let uploading = $state(false);
	let confirmDeactivate = $state(false);
	async function save() {
		if (!displayName.trim()) throw new Error('Please add your display name.');
		const valid = validateUsername(username);
		saveProfile({
			displayName: displayName.trim(),
			username: valid,
			bio: bio.trim(),
			notifications: { ...notifications }
		});
		username = valid;
	}
	async function upload(e) {
		const file = e.target.files?.[0];
		if (!file) return;
		uploading = true;
		try {
			if (!['image/jpeg', 'image/png'].includes(file.type) || file.size > 1024 * 1024)
				throw new Error('Choose a JPG or PNG smaller than 1 MB.');
			const photo = await new Promise((resolve, reject) => {
				const reader = new FileReader();
				reader.onload = () => resolve(reader.result);
				reader.onerror = () => reject(new Error('Could not read this photo. Please try another.'));
				reader.readAsDataURL(file);
			});
			saveProfile({ photo });
			notify('Your profile photo has been updated.');
		} catch (error) {
			notify(error.message, 'error');
		} finally {
			uploading = false;
			e.target.value = '';
		}
	}
</script>

<div class="page-heading">
	<span class="eyebrow">MAKE YOURSELF AT HOME</span>
	<h2>A page that feels like you.</h2>
	<p>Your story, your little corner, your way.</p>
</div>
<div class="settings-stack">
	<section class="panel">
		<div class="row">
			<div>
				<h3 class="section-title">Your profile</h3>
				<p class="inline-note">The face and story behind every zobo.</p>
			</div>
			{#if $creator.username}<a class="text-link" href={creatorPath($creator.username)}
					>Preview <ArrowUpRight size={15} /></a
				>{/if}
		</div>
		<div class="photo-row">
			<span class="avatar large"
				>{#if $creator.photo}<img
						src={$creator.photo}
						alt="Your current profile"
					/>{:else}{(displayName || 'Y')[0].toUpperCase()}{/if}</span
			>
			<div>
				<button
					class="button secondary small"
					disabled={uploading}
					aria-busy={uploading}
					onclick={() => fileInput.click()}
					>{#if uploading}<span class="spinner"></span>Updating photo…{:else}<Upload size={14} /> Change
						photo{/if}</button
				>
				<p class="inline-note">JPG or PNG, up to 1 MB. Saved on this device.</p>
				<input
					class="file-input"
					bind:this={fileInput}
					type="file"
					accept="image/jpeg,image/png"
					onchange={upload}
					aria-label="Choose profile photo"
				/>
			</div>
		</div>
		<div class="field-grid">
			<label class="field"
				>Display name<input
					bind:value={displayName}
					maxlength="60"
					autocomplete="name"
					placeholder="What should we call you?"
				/></label
			><label class="field"
				>Page address<input
					bind:value={username}
					maxlength="24"
					autocapitalize="none"
					spellcheck="false"
					placeholder="yourname"
				/><small>/creator/{username || 'yourname'}</small></label
			><label class="field wide"
				>Your story<textarea
					rows="4"
					bind:value={bio}
					maxlength="300"
					placeholder="What do you make? What keeps you going?"></textarea><small
					>{bio.length}/300 characters</small
				></label
			>
		</div>
		<div class="save-row">
			<ActionButton
				action={save}
				success="Your profile and preferences are saved."
				busyLabel="Saving changes…">Save changes <Check size={15} /></ActionButton
			>
		</div>
	</section>
	<section class="panel">
		<h3 class="section-title">The things you'd like to hear about</h3>
		<p class="inline-note">These preferences are saved for the demo. Emails are not sent yet.</p>
		{#each [{ key: 'support', title: 'A new little kindness', description: 'When someone sends you a zobo.' }, { key: 'payout', title: 'Payout updates', description: 'When your payout status changes.' }, { key: 'digest', title: 'A weekly catch-up', description: 'Your week in gifts and good words.' }] as item}<label
				class="switch-row"
				><span>{item.title}<small>{item.description}</small></span><input
					type="checkbox"
					bind:checked={notifications[item.key]}
				/></label
			>{/each}
		<div class="save-row">
			<ActionButton
				action={save}
				success="Your profile and preferences are saved."
				busyLabel="Saving preferences…">Save preferences</ActionButton
			>
		</div>
	</section>
	<section class="panel">
		<div class="row">
			<div>
				<h3 class="section-title">Your demo payout destination</h3>
				<p class="inline-note">
					{$creator.bank
						? `${$creator.bank.name} · ending ${$creator.bank.last4}`
						: 'No destination added yet.'}
				</p>
			</div>
			<a href="/dashboard/payouts" class="button secondary small">Manage destination</a>
		</div>
	</section>
	<section class="panel pause-panel">
		<h3 class="section-title">Need a little pause?</h3>
		<p class="inline-note">
			Pause your demo page to stop accepting test gifts. Your profile and history stay here.
		</p>
		{#if !$creator.active}<ActionButton
				class="button secondary small"
				action={() => saveProfile({ active: true })}
				success="Your demo page is active again."
				busyLabel="Reactivating…">Reactivate my page</ActionButton
			>{:else if confirmDeactivate}<div class="status-line">
				Pause your page? Visitors will see that support is unavailable.
			</div>
			<div class="save-row">
				<button class="button secondary small" onclick={() => (confirmDeactivate = false)}
					>Keep my page active</button
				><ActionButton
					class="button small"
					action={() => {
						saveProfile({ active: false });
						confirmDeactivate = false;
					}}
					success="Your demo page is paused."
					busyLabel="Pausing…">Yes, pause my page</ActionButton
				>
			</div>{:else}<button class="text-link danger" onclick={() => (confirmDeactivate = true)}
				>Pause my page</button
			>{/if}
	</section>
</div>

<style>
	.settings-stack {
		display: flex;
		flex-direction: column;
		gap: 22px;
		max-width: 850px;
	}
	.photo-row {
		display: flex;
		align-items: center;
		gap: 20px;
		margin: 30px 0;
	}
	.photo-row p {
		margin-top: 7px;
	}
	.file-input {
		display: none;
	}
	.save-row {
		display: flex;
		justify-content: flex-end;
		gap: 12px;
		margin-top: 24px;
		flex-wrap: wrap;
	}
	.pause-panel > .inline-note {
		margin: 12px 0 20px;
	}
	.pause-panel > .text-link {
		border: 0;
		background: transparent;
		padding: 0;
	}
	.settings-stack .section-title {
		margin-bottom: 6px;
	}
</style>
