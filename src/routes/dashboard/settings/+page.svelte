<script>
	import { getContext } from 'svelte';
	const creator = getContext('creator');
	import { validateUsername, notify, creatorPath } from '$lib/ui.js';
	import { saveProfile, uploadImage, logout } from '$lib/account.js';
	import { getSupabase } from '$lib/supabase/client.js';
	import { invalidateAll } from '$app/navigation';
	let unitAmount = $state($creator.unitAmount),
		cta = $state($creator.cta),
		linkTitle = $state(''),
		linkUrl = $state('');
	let coverInput,
		coverBusy = $state(false);
	let editLinkId = $state(null);
	async function saveLink() {
		let url;
		try {
			url = new URL(linkUrl);
		} catch {
			throw new Error('Enter a valid website address.');
		}
		if (!['https:', 'http:'].includes(url.protocol))
			throw new Error('Use an http or https address.');
		if (!linkTitle.trim()) throw new Error('Give your link a title.');
		const db = getSupabase(),
			payload = { title: linkTitle.trim(), url: url.href };
		const result = editLinkId
			? await db.from('creator_links').update(payload).eq('id', editLinkId)
			: await db
					.from('creator_links')
					.insert({ ...payload, creator_id: $creator.id, position: $creator.links.length });
		if (result.error) throw new Error('Could not save your link.');
		linkTitle = '';
		linkUrl = '';
		editLinkId = null;
		await invalidateAll();
	}
	async function changeLink(link, remove = false) {
		const db = getSupabase();
		const result = remove
			? await db.from('creator_links').delete().eq('id', link.id)
			: await db.from('creator_links').update({ is_visible: !link.is_visible }).eq('id', link.id);
		if (result.error) throw new Error('Could not update your link.');
		await invalidateAll();
	}
	async function coverUpload(e) {
		const file = e.target.files?.[0];
		if (!file) return;
		coverBusy = true;
		try {
			await uploadImage(file, 'cover');
			notify('Cover updated.');
		} catch (error) {
			notify(error.message, 'error');
		} finally {
			coverBusy = false;
			e.target.value = '';
		}
	}
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
		if (
			!Number.isFinite(Number(unitAmount)) ||
			Number(unitAmount) < 100 ||
			Number(unitAmount) > 1000000
		)
			throw new Error('Set a zobo price between ₦100 and ₦1,000,000.');
		await saveProfile({
			displayName: displayName.trim(),
			username: valid,
			bio: bio.trim(),
			unitAmount: Number(unitAmount),
			cta: cta.trim(),
			notifications: { ...notifications }
		});
		username = valid;
	}
	async function upload(e) {
		const file = e.target.files?.[0];
		if (!file) return;
		uploading = true;
		try {
			await uploadImage(file);
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
				<p class="inline-note">JPG, PNG or WebP, up to 2 MB.</p>
				<input
					class="file-input"
					bind:this={fileInput}
					type="file"
					accept="image/jpeg,image/png,image/webp"
					onchange={upload}
					aria-label="Choose profile photo"
				/>
			</div>
		</div>
		<div class="photo-row">
			<div>
				{#if $creator.cover}<img
						class="cover-preview"
						src={$creator.cover}
						alt="Your cover"
					/>{/if}<button
					class="button secondary small"
					disabled={coverBusy}
					aria-busy={coverBusy}
					onclick={() => coverInput.click()}
					>{coverBusy ? 'Uploading cover…' : 'Change cover'}</button
				>
				<p class="inline-note">JPG, PNG or WebP, up to 5 MB.</p>
				<input
					class="file-input"
					bind:this={coverInput}
					type="file"
					accept="image/jpeg,image/png,image/webp"
					onchange={coverUpload}
					aria-label="Choose cover image"
				/>
			</div>
		</div>
		<div class="field-grid">
			<label class="field"
				>Price per zobo (₦)<input
					type="number"
					min="100"
					max="1000000"
					step="0.01"
					bind:value={unitAmount}
				/></label
			>
			<label class="field">Support button text<input maxlength="160" bind:value={cta} /></label>
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
		<p class="inline-note">Your preferences are saved. Notification delivery is not enabled yet.</p>
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
				<h3 class="section-title">Your payout destination</h3>
				<p class="inline-note">
					{$creator.bank
						? `${$creator.bank.name} · ending ${$creator.bank.last4}`
						: 'No destination added yet.'}
				</p>
			</div>
			<a href="/dashboard/payouts" class="button secondary small">Manage destination</a>
		</div>
	</section>
	<section class="panel">
		<h3 class="section-title">Your links</h3>
		<p class="inline-note">Give your people a way to find your work.</p>
		{#each $creator.links as link}<div class="link-row">
				<a href={link.url} target="_blank" rel="noopener noreferrer">{link.title} ↗</a><button
					class="text-link"
					onclick={() => {
						editLinkId = link.id;
						linkTitle = link.title;
						linkUrl = link.url;
					}}>Edit</button
				><ActionButton
					class="text-link"
					action={() => changeLink(link)}
					success="Link visibility updated.">{link.is_visible ? 'Hide' : 'Show'}</ActionButton
				><ActionButton
					class="text-link danger"
					action={() => changeLink(link, true)}
					success="Link removed.">Remove</ActionButton
				>
			</div>{/each}
		<div class="field-grid">
			<label class="field">Title<input bind:value={linkTitle} maxlength="80" /></label><label
				class="field"
				>Website address<input
					type="url"
					bind:value={linkUrl}
					maxlength="2048"
					placeholder="https://"
				/></label
			>
		</div>
		<div class="save-row">
			<ActionButton action={saveLink} success="Link saved." busyLabel="Saving link…"
				>{editLinkId ? 'Save link' : 'Add link'}</ActionButton
			>{#if editLinkId}<button
					class="text-link"
					onclick={() => {
						editLinkId = null;
						linkTitle = '';
						linkUrl = '';
					}}>Cancel edit</button
				>{/if}
		</div>
	</section>
	<section class="panel pause-panel">
		<h3 class="section-title">Need a little pause?</h3>
		<p class="inline-note">
			Pause your page to stop accepting support. Your profile and history stay here.
		</p>
		{#if !$creator.active}<ActionButton
				class="button secondary small"
				action={() => saveProfile({ active: true })}
				success="Your page is active again."
				busyLabel="Reactivating…">Reactivate my page</ActionButton
			>{:else if confirmDeactivate}<div class="status-line">
				Pause your page? Visitors will see that support is unavailable.
			</div>
			<div class="save-row">
				<button class="button secondary small" onclick={() => (confirmDeactivate = false)}
					>Keep my page active</button
				><ActionButton
					class="button small"
					action={async () => {
						await saveProfile({ active: false });
						confirmDeactivate = false;
					}}
					success="Your page is paused."
					busyLabel="Pausing…">Yes, pause my page</ActionButton
				>
			</div>{:else}<button class="text-link danger" onclick={() => (confirmDeactivate = true)}
				>Pause my page</button
			>{/if}
	</section>
	<section class="panel">
		<h3 class="section-title">Your account</h3>
		<p class="inline-note">{$creator.email}</p>
		<ActionButton action={logout} busyLabel="Signing out…">Log out</ActionButton>
	</section>
</div>

<style>
	.cover-preview {
		width: 100%;
		max-height: 140px;
		object-fit: cover;
		border-radius: 10px;
		margin-bottom: 12px;
	}
	.link-row {
		display: flex;
		align-items: center;
		gap: 16px;
		flex-wrap: wrap;
		padding: 16px 0;
	}
	.link-row a {
		margin-right: auto;
		overflow-wrap: anywhere;
	}

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
