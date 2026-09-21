<script>
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import ActionButton from '$lib/components/ActionButton.svelte';
	import {
		LayoutDashboard,
		Heart,
		Wallet,
		Settings,
		Menu,
		X,
		ArrowUpRight,
		ChevronRight,
		LogOut
	} from '@lucide/svelte';
	import { creator, ready, creatorPath } from '$lib/demo.js';
	import Brand from '$lib/components/Brand.svelte';
	import ZoboCup from '$lib/components/ZoboCup.svelte';
	let { children } = $props();
	let open = $state(false);
	let closeButton;
	let menuButton;
	let drawer;
	const items = [
		{ label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
		{ label: 'Supporters', href: '/dashboard/supporters', icon: Heart },
		{ label: 'Payouts', href: '/dashboard/payouts', icon: Wallet },
		{ label: 'Settings', href: '/dashboard/settings', icon: Settings }
	];
	let current = $derived(
		items.find((item) => item.href === page.url.pathname)?.label || 'Overview'
	);
	$effect(() => {
		if (open) {
			closeButton?.focus();
			const old = document.body.style.overflow;
			document.body.style.overflow = 'hidden';
			return () => (document.body.style.overflow = old);
		}
	});
	function close() {
		open = false;
		menuButton?.focus();
	}
	function keydown(e) {
		if (!open) return;
		if (e.key === 'Escape') {
			close();
			return;
		}
		if (e.key === 'Tab') {
			const nodes = drawer.querySelectorAll('a,button');
			const first = nodes[0],
				last = nodes[nodes.length - 1];
			if (e.shiftKey && document.activeElement === first) {
				e.preventDefault();
				last.focus();
			} else if (!e.shiftKey && document.activeElement === last) {
				e.preventDefault();
				first.focus();
			}
		}
	}
</script>

<svelte:head
	><meta name="robots" content="noindex,nofollow" /><title>{current} — Buy Me Zobo</title
	></svelte:head
>
<svelte:window onkeydown={keydown} />
<div class="dashboard-shell">
	{#if open}<button class="drawer-scrim" aria-label="Close navigation" onclick={close}
		></button>{/if}
	<aside class="dash-sidebar" class:open bind:this={drawer}>
		<div class="sidebar-brand">
			<Brand /><button
				class="drawer-close"
				bind:this={closeButton}
				aria-label="Close navigation"
				onclick={close}><X size={20} /></button
			>
		</div>
		<span class="sidebar-caption">WORKSPACE</span>
		<nav aria-label="Dashboard navigation">
			{#each items as item}<a
					href={item.href}
					class:active={page.url.pathname === item.href}
					aria-current={page.url.pathname === item.href ? 'page' : undefined}
					onclick={() => (open = false)}
					><item.icon size={18} />{item.label}{#if page.url.pathname === item.href}<ChevronRight
							size={15}
						/>{/if}</a
				>{/each}
		</nav>
		<div class="sidebar-nudge">
			<ZoboCup class="sidebar-cup" /><strong>Keep creating.</strong>
			<p>A little support goes a long way.</p>
			<a href="/example">Explore the example <ArrowUpRight size={14} /></a>
		</div>
		<a href="/dashboard/settings" class="sidebar-user"
			><span class="avatar"
				>{#if $creator.photo}<img src={$creator.photo} alt="" />{:else}{($creator.displayName ||
						'Y')[0].toUpperCase()}{/if}</span
			>
			<div>
				<strong>{$creator.displayName || 'Your creator page'}</strong><span
					>{$creator.username ? `@${$creator.username}` : 'Make it yours in Settings'}</span
				>
			</div></a
		>
		<ActionButton
			class="sidebar-logout"
			busyLabel="Leaving…"
			action={async () => {
				open = false;
				await goto('/login');
			}}
			success="Demo closed. Your profile is still saved on this device."
			><LogOut size={16} /> Log out</ActionButton
		>
	</aside>
	<div class="dash-main">
		<header class="dash-topbar">
			<div>
				<button
					bind:this={menuButton}
					class="dash-menu"
					aria-label="Open navigation"
					aria-expanded={open}
					onclick={() => (open = true)}><Menu size={20} /></button
				><span>Your page <span class="breadcrumb-slash">/</span> <strong>{current}</strong></span>
			</div>
			<div>
				<span class="badge">DEMO WORKSPACE</span>{#if $creator.username}<a
						href={creatorPath($creator.username)}
						class="text-link">View page <ArrowUpRight size={15} /></a
					>{/if}
			</div>
		</header>
		<main class="dashboard-content" inert={open}>
			{#if $ready}{@render children()}{:else}<p role="status">Loading your creative corner…</p>{/if}
		</main>
	</div>
</div>

<style>
	.dashboard-shell {
		min-height: 100vh;
		background: #f7f2ed;
		display: grid;
		grid-template-columns: 235px minmax(0, 1fr);
	}
	.dash-sidebar {
		position: sticky;
		top: 0;
		height: 100dvh;
		padding: 30px 22px 20px;
		border-right: 1px solid var(--line);
		display: flex;
		flex-direction: column;
		background: #fcf7ef;
		overflow-y: auto;
	}
	.sidebar-brand {
		margin-bottom: 24px;
		display: flex;
		justify-content: space-between;
	}
	.sidebar-caption {
		font-size: 11px;
		letter-spacing: 0.1em;
		color: var(--muted);
		margin: 0 12px 15px;
	}
	.dash-sidebar nav {
		display: flex;
		flex-direction: column;
		gap: 7px;
	}
	.dash-sidebar nav a {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 12px 14px;
		border-radius: 8px;
		color: var(--muted);
		font-size: 14px;
		font-weight: 550;
	}
	.dash-sidebar nav a.active {
		background: var(--plum);
		color: var(--cream);
	}
	.dash-sidebar nav a :global(svg:last-child:not(:first-child)) {
		margin-left: auto;
	}
	.sidebar-nudge {
		flex-shrink: 0;
		background: #f0d7df;
		border-radius: 12px;
		padding: 20px;
		margin-top: auto;
		margin-bottom: 25px;
		position: relative;
		overflow: hidden;
	}
	:global(.sidebar-cup) {
		width: 48px;
		float: right;
		transform: rotate(10deg);
		margin: 0 -10px 5px 0;
	}
	.sidebar-nudge strong {
		font-size: 16px;
		letter-spacing: -0.04em;
		line-height: 1.3;
		display: block;
		margin: 10px 0;
	}
	.sidebar-nudge p {
		font-size: 14px;
		clear: both;
		margin: 10px 0;
	}
	.sidebar-nudge a {
		display: flex;
		gap: 8px;
		font-size: 14px;
		font-weight: 600;
		align-items: center;
	}
	.sidebar-user {
		border-top: 1px solid var(--line);
		padding-top: 20px;
		display: flex;
		gap: 10px;
		align-items: center;
	}
	.sidebar-user div {
		min-width: 0;
	}
	.sidebar-user strong {
		font-size: 14px;
		display: block;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.sidebar-user div > span {
		display: block;
		font-size: 14px;
		color: var(--muted);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.dash-topbar {
		min-height: 80px;
		border-bottom: 1px solid var(--line);
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 15px 40px;
		gap: 20px;
		font-size: 14px;
		background: #fffcf750;
	}
	.dash-topbar > div {
		display: flex;
		align-items: center;
		gap: 20px;
	}
	.breadcrumb-slash {
		padding: 0 12px;
		color: #baa1ab;
	}
	.dashboard-content {
		padding: 40px;
		max-width: 1180px;
		margin: auto;
	}
	.dash-menu,
	.drawer-close {
		display: none;
	}
	.drawer-scrim {
		position: fixed;
		inset: 0;
		background: #351c2960;
		border: 0;
		z-index: 30;
	}
	.dash-main {
		min-width: 0;
	}
	.sidebar-nudge {
		margin-top: 24px;
	}
	.sidebar-user {
		margin-top: auto;
		flex-shrink: 0;
	}
	:global(.sidebar-logout) {
		display: flex;
		align-items: center;
		gap: 10px;
		min-height: 44px;
		padding: 10px 12px;
		margin-top: 10px;
		border: 1px solid var(--line);
		border-radius: 8px;
		background: transparent;
		color: var(--wine);
		flex-shrink: 0;
	}
	@media (max-height: 740px) {
		.sidebar-nudge {
			padding: 12px;
			margin-block: 18px;
		}
		.sidebar-nudge p {
			display: none;
		}
		.sidebar-nudge strong {
			margin-top: 0;
		}
		.sidebar-nudge a {
			clear: both;
			font-size: 12px;
		}
	}
	@media (max-width: 1000px) {
		.dashboard-shell {
			grid-template-columns: 210px minmax(0, 1fr);
		}
		.dashboard-content {
			padding: 28px;
		}
		.dash-topbar {
			padding: 15px 28px;
		}
		.dash-sidebar {
			padding: 25px 16px;
		}
		.dash-topbar .badge {
			display: none;
		}
	}
	@media (max-width: 760px) {
		.dashboard-shell {
			display: block;
		}
		.dash-sidebar {
			display: none;
			position: fixed;
			left: 0;
			top: 0;
			width: 270px;
			z-index: 40;
		}
		.dash-sidebar.open {
			display: flex;
		}
		.dash-topbar {
			padding: 17px 20px;
			min-height: 70px;
		}
		.dash-topbar > div {
			gap: 10px;
		}
		.dash-topbar > div > span {
			font-size: 14px;
		}
		.breadcrumb-slash {
			padding: 0 5px;
		}
		.dashboard-content {
			padding: 28px 20px;
		}
		.dash-menu,
		.drawer-close {
			display: flex;
			border: 0;
			background: transparent;
			color: var(--plum);
			padding: 4px;
		}
		.sidebar-brand {
			align-items: center;
		}
	}
</style>
