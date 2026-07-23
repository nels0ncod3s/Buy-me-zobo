<script>
	import { page } from '$app/stores';
	import {
		LayoutDashboard,
		Heart,
		Wallet,
		Settings,
		CircleHelp,
		PanelLeft,
		Menu,
		X
	} from '@lucide/svelte';

	let { children } = $props();

	let sidebarOpen = $state(false); // mobile drawer
	let collapsed = $state(false); // web-view collapsed rail

	// Kept deliberately short for an MVP — every item here has a real page behind it.
	const navGroups = [
		{
			heading: 'Overview',
			items: [{ label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' }]
		},
		{
			heading: 'Earn',
			items: [
				{ label: 'Supporters', icon: Heart, href: '/dashboard/supporters' },
				{ label: 'Payouts', icon: Wallet, href: '/dashboard/payouts' }
			]
		},
		{
			heading: 'Account',
			items: [{ label: 'Settings', icon: Settings, href: '/dashboard/settings' }]
		}
	];

	let currentPath = $derived($page.url.pathname);
	let currentLabel = $derived(
		navGroups.flatMap((g) => g.items).find((item) => item.href === currentPath)?.label ?? 'Home'
	);
</script>

<div class="canvas" class:collapsed>
	<!-- ============ FLAT SIDEBAR (on the canvas) ============ -->
	<aside class="sidebar" class:open={sidebarOpen}>
		<div class="sidebar-top">
			<!-- Collapsed (web only): the logo itself expands the rail back out. -->
			<a
				href="/"
				class="sidebar-mark"
				aria-label={collapsed ? 'Expand sidebar' : 'Buy Me Zobo home'}
				onclick={(e) => {
					if (collapsed) {
						e.preventDefault();
						collapsed = false;
					}
				}}
			></a>
			{#if !collapsed}
				<button
					class="sidebar-toggle desktop-toggle"
					aria-label="Collapse sidebar"
					onclick={() => (collapsed = true)}
				>
					<PanelLeft size={18} strokeWidth={1.75} />
				</button>
			{/if}
			<button
				class="sidebar-toggle mobile-toggle"
				aria-label="Close menu"
				onclick={() => (sidebarOpen = false)}
			>
				<X size={20} strokeWidth={1.75} />
			</button>
		</div>

		<nav class="sidebar-nav" aria-label="Dashboard">
			{#each navGroups as group}
				<div class="nav-group">
					<span class="nav-heading">{group.heading}</span>
					{#each group.items as item}
						<a
							href={item.href}
							class="nav-item"
							class:active={currentPath === item.href}
							title={collapsed ? item.label : undefined}
							onclick={() => (sidebarOpen = false)}
						>
							<item.icon size={18} strokeWidth={1.75} />
							<span class="nav-label">{item.label}</span>
						</a>
					{/each}
				</div>
			{/each}
		</nav>

		<div class="sidebar-foot">
			<a
				href="mailto:hello@buymezobo.com"
				class="nav-item"
				title={collapsed ? 'Help & support' : undefined}
			>
				<CircleHelp size={18} strokeWidth={1.75} />
				<span class="nav-label">Help &amp; support</span>
			</a>
			<a href="/" class="nav-user" title={collapsed ? 'Your account' : undefined}>
				<span class="nav-user-avatar">N</span>
				<span class="nav-label nav-user-meta">
					<strong>Nelson</strong>
					<em>buymezobo.com/trxpznxl</em>
				</span>
			</a>
		</div>
	</aside>

	{#if sidebarOpen}
		<button class="canvas-scrim" onclick={() => (sidebarOpen = false)} aria-label="Close menu"
		></button>
	{/if}

	<!-- ============ THE ISLAND (elevated sheet) ============ -->
	<main class="island">
		<header class="island-head">
			<div class="island-head-left">
				<button
					class="island-menu-btn"
					onclick={() => {
						collapsed = false;
						sidebarOpen = true;
					}}
					aria-label="Open menu"
				>
					<Menu size={18} strokeWidth={1.75} />
				</button>
				<h1 class="island-title">{currentLabel}</h1>
			</div>
		</header>

		<div class="island-body">
			{@render children()}
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
		--gold: #c98f3a;
		--gold-light: #e0b565;
		/* Island neutrals */
		--canvas: #f7f5f2;
		--sheet: #ffffff;
		--line: #ece7e0;
		--ink: #26201c;
		--muted: #8c817a;
		--muted-2: #b3a99f;
	}
	:global(body) {
		margin: 0;
		background: var(--canvas);
	}

	.canvas {
		font-family: 'Geist Variable', ui-sans-serif, system-ui, sans-serif;
		display: grid;
		grid-template-columns: 260px 1fr;
		height: 100vh;
		width: 100%;
		background: var(--canvas);
		color: var(--ink);
		overflow: hidden;
		transition: grid-template-columns 0.24s cubic-bezier(0.4, 0, 0.2, 1);
	}
	.canvas.collapsed {
		grid-template-columns: 76px 1fr;
	}
	a {
		text-decoration: none;
		color: inherit;
	}

	/* ============ SIDEBAR ============ */
	.sidebar {
		display: flex;
		flex-direction: column;
		padding: 1.5rem 1rem;
		height: 100%;
		/* Stationary by design — the MVP nav is short enough to never need to scroll. */
		overflow: hidden;
	}
	.sidebar-top {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0 0.5rem 1.75rem;
	}
	.sidebar-mark {
		width: 32px;
		height: 32px;
		border-radius: 9px;
		background: linear-gradient(150deg, var(--zobo-600), var(--zobo-900));
		box-shadow: 0 2px 6px -1px rgba(92, 16, 41, 0.4);
		flex-shrink: 0;
	}
	.sidebar-toggle {
		background: none;
		border: none;
		color: var(--muted-2);
		cursor: pointer;
		padding: 0.25rem;
		display: flex;
		flex-shrink: 0;
	}
	.sidebar-toggle:hover {
		color: var(--muted);
	}
	.mobile-toggle {
		display: none;
	} /* only shown in mobile drawer */

	.sidebar-nav {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
		flex: 1;
	}
	.nav-group {
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
	}
	.nav-heading {
		font-size: 0.68rem;
		font-weight: 700;
		letter-spacing: 0.09em;
		text-transform: uppercase;
		color: var(--muted-2);
		padding: 0 0.75rem;
		margin-bottom: 0.35rem;
		white-space: nowrap;
		overflow: hidden;
	}

	.nav-item {
		display: flex;
		align-items: center;
		width: 100%;
		gap: 0.7rem;
		padding: 0.6rem 0.75rem;
		border-radius: 9px;
		font-size: 0.875rem;
		font-weight: 500;
		font-family: inherit;
		color: #6b615a;
		white-space: nowrap;
		background: none;
		border: none;
		cursor: pointer;
		text-align: left;
		transition:
			background 0.15s ease,
			color 0.15s ease;
	}
	.nav-item:hover {
		background: rgba(92, 16, 41, 0.05);
		color: var(--ink);
	}
	.nav-item.active {
		background: rgba(92, 16, 41, 0.09);
		color: var(--zobo-800);
		font-weight: 600;
	}
	.nav-item :global(svg) {
		flex-shrink: 0;
	}

	/* ---- Collapsed rail (web) ---- */
	.canvas.collapsed .sidebar-top {
		justify-content: center;
	}
	.canvas.collapsed .nav-label {
		opacity: 0;
		width: 0;
		overflow: hidden;
	}
	.canvas.collapsed .nav-item {
		justify-content: center;
		padding: 0.6rem;
		gap: 0;
	}
	.canvas.collapsed .nav-heading {
		opacity: 0;
		height: 0;
		margin: 0;
		padding: 0;
	}
	.canvas.collapsed .sidebar-nav {
		gap: 0.6rem;
	}
	.canvas.collapsed .nav-user {
		justify-content: center;
		padding: 0.4rem;
	}
	.canvas.collapsed .nav-user-meta {
		display: none;
	}

	/* ---- Sidebar footer / user ---- */
	.sidebar-foot {
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
		padding-top: 0.85rem;
		margin-top: 0.85rem;
		border-top: 1px solid var(--line);
	}
	.nav-user {
		display: flex;
		align-items: center;
		gap: 0.65rem;
		padding: 0.5rem 0.6rem;
		border-radius: 9px;
		transition: background 0.15s ease;
	}
	.nav-user:hover {
		background: rgba(92, 16, 41, 0.05);
	}
	.nav-user-avatar {
		width: 30px;
		height: 30px;
		border-radius: 8px;
		background: linear-gradient(150deg, var(--zobo-600), var(--zobo-900));
		color: var(--cream);
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: 700;
		font-size: 0.85rem;
		flex-shrink: 0;
	}
	.nav-user-meta {
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}
	.nav-user-meta strong {
		font-size: 0.82rem;
		color: var(--ink);
		line-height: 1.2;
	}
	.nav-user-meta em {
		font-style: normal;
		font-size: 0.72rem;
		color: var(--muted-2);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	/* ============ ISLAND ============ */
	.island {
		margin: 0.75rem 0.75rem 0.75rem 0;
		background: var(--sheet);
		border: 1px solid var(--line);
		border-radius: 16px;
		box-shadow:
			0 10px 34px -12px rgba(43, 6, 15, 0.1),
			0 4px 12px -8px rgba(43, 6, 15, 0.06);
		display: flex;
		flex-direction: column;
		overflow: hidden;
		min-width: 0;
	}
	.island-head {
		height: 56px;
		border-bottom: 1px solid var(--line);
		padding: 0 1.25rem;
		display: flex;
		align-items: center;
		flex-shrink: 0;
	}
	.island-head-left {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}
	.island-menu-btn {
		display: none;
		background: none;
		border: none;
		color: var(--ink);
		cursor: pointer;
		padding: 0.25rem;
	}
	.island-title {
		font-size: 0.9rem;
		font-weight: 600;
		color: var(--ink);
		margin: 0;
	}

	.island-body {
		flex: 1;
		overflow-y: auto;
		min-height: 0;
		display: flex;
	}

	/* ============ MOBILE ============ */
	.canvas-scrim {
		display: none;
	}

	@media (max-width: 900px) {
		.canvas,
		.canvas.collapsed {
			grid-template-columns: 1fr;
		}
		.sidebar {
			position: fixed;
			inset: 0;
			z-index: 60;
			width: 100vw;
			background: var(--canvas);
			transform: translateX(-100%);
			transition: transform 0.25s ease;
			overflow-y: auto;
		}
		/* The collapsed-rail centering is web-only — force the normal
		   logo-left / close-right layout in the mobile drawer regardless. */
		.canvas.collapsed .sidebar-top {
			justify-content: space-between;
		}
		.sidebar.open {
			transform: translateX(0);
		}
		/* On mobile the rail-collapse never applies — always show full labels */
		.canvas.collapsed .nav-label {
			opacity: 1;
			width: auto;
		}
		.canvas.collapsed .nav-item {
			justify-content: flex-start;
			padding: 0.6rem 0.75rem;
			gap: 0.7rem;
		}
		.canvas.collapsed .nav-heading {
			opacity: 1;
			height: auto;
			margin-bottom: 0.35rem;
			padding: 0 0.75rem;
		}
		.canvas.collapsed .sidebar-nav {
			gap: 1.25rem;
		}
		.canvas.collapsed .nav-user {
			justify-content: flex-start;
			padding: 0.5rem 0.6rem;
		}
		.canvas.collapsed .nav-user-meta {
			display: flex;
		}
		.desktop-toggle {
			display: none;
		}
		.mobile-toggle {
			display: flex;
		}
		.canvas-scrim {
			display: block;
			position: fixed;
			inset: 0;
			z-index: 55;
			background: rgba(43, 6, 15, 0.32);
			border: none;
			padding: 0;
		}
		.island {
			margin: 0.5rem;
		}
		.island-menu-btn {
			display: flex;
		}
	}
</style>
