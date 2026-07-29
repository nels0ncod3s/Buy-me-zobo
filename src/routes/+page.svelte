<script>
	import { onMount } from 'svelte';
	import { reveal } from '$lib/reveal.js';
	import { magnetic } from '$lib/magnetic.js';
	import { tilt } from '$lib/tilt.js';
	import {
		ArrowRight,
		ArrowUpRight,
		Menu,
		X,
		Banknote,
		Smartphone,
		ShieldCheck,
		MessageCircle,
		TrendingUp,
		Link2,
		Quote,
		Check,
		Gift,
		Music2
	} from '@lucide/svelte';

	let mobileNavOpen = $state(false);

	// Lock background scrolling while the full-screen mobile menu is open, so the
	// page underneath doesn't scroll behind the overlay.
	$effect(() => {
		if (typeof document === 'undefined') return;
		document.body.style.overflow = mobileNavOpen ? 'hidden' : '';
		return () => {
			document.body.style.overflow = '';
		};
	});

	// --- Hero claim-link form ---
	let claimUsername = $state('');
	function claimLink(e) {
		e.preventDefault();
		const u = claimUsername.trim();
		// Carry whatever the visitor typed straight into signup so they don't
		// have to retype their handle on the next screen.
		window.location.href = u ? `/signup?u=${encodeURIComponent(u)}` : '/signup';
	}

	// --- Animated hero stat counters ---
	let statPaid = $state(0);
	let statCreators = $state(0);
	let statPayout = $state(0);

	const statTargets = { paid: 48, creators: 3200, payout: 12 };

	onMount(() => {
		let cancelled = false;
		let frame;
		const duration = 1400;
		const start = performance.now();
		function tick(now) {
			if (cancelled) return;
			const t = Math.min((now - start) / duration, 1);
			const ease = 1 - Math.pow(1 - t, 3);
			statPaid = (statTargets.paid * ease).toFixed(1);
			statCreators = Math.floor(statTargets.creators * ease);
			statPayout = Math.max(1, Math.round(statTargets.payout * ease));
			if (t < 1) frame = requestAnimationFrame(tick);
		}
		frame = requestAnimationFrame(tick);

		return () => {
			cancelled = true;
			cancelAnimationFrame(frame);
		};
	});

	// --- Interactive "try it" demo card ---
	const demoAmounts = [500, 1000, 2000, 5000];
	let selectedAmount = $state(1000);
	let demoNote = $state('');
	let demoFeed = $state([
		{ id: 1, name: 'Tomiwa', amount: 5000, note: 'Love what you make 🍲' },
		{ id: 2, name: 'Zainab', amount: 2000, note: 'This got me through the week' },
		{ id: 3, name: 'Emeka', amount: 10000, note: 'Keep the podcast going!' }
	]);
	let demoTotal = $derived(demoFeed.reduce((sum, f) => sum + f.amount, 0));
	let nextDemoId = 4;

	function sendDemo() {
		const note = demoNote.trim() || 'Sending some love your way ❤️';
		demoFeed = [{ id: nextDemoId++, name: 'You', amount: selectedAmount, note }, ...demoFeed].slice(
			0,
			4
		);
		demoNote = '';
	}

	// --- "Receive support from your fans" preview card ---
	const supportTiers = [
		{ n: '1', amount: 1000 },
		{ n: '3', amount: 3000 },
		{ n: '5', amount: 5000 }
	];
	let selectedTierIdx = $state(2);
	let supportAmount = $derived(supportTiers[selectedTierIdx].amount);
	let supportFee = $derived(Math.round(supportAmount * 0.05));
	let supportTotal = $derived(supportAmount + supportFee);
	let cupFillPct = $derived(22 + (selectedTierIdx / (supportTiers.length - 1)) * 73);

	const compareRows = [
		{ label: 'Fees', us: '5% flat', them: '10–20%' },
		{ label: 'Payout speed', us: 'Same day', them: '7–30 days' },
		{ label: 'How fans pay', us: 'Card, transfer, USSD', them: 'Card only, usually' },
		{ label: 'Your supporter list', us: 'Yours to keep', them: 'Platform owned' }
	];

	const features = [
		{
			icon: Banknote,
			title: 'Paid in Naira, same day',
			body: 'Support lands in your bank account within hours — no dollar conversion, no week-long holds, no middleman eating your money.'
		},
		{
			icon: Smartphone,
			title: 'However your fans pay',
			body: 'Card, bank transfer, or USSD. Your audience uses what they already have on their phone. No app to install, no account to create.'
		},
		{
			icon: ShieldCheck,
			title: 'Clear, honest fees',
			body: 'One small percentage per gift, shown before checkout. What we quote is what you keep. No monthly charge, no surprise deductions.'
		},
		{
			icon: MessageCircle,
			title: 'Messages, not just money',
			body: 'Every gift can carry a note. Read what your work means to people, reply publicly, and turn one-off supporters into regulars.'
		},
		{
			icon: TrendingUp,
			title: 'See what is working',
			body: 'A simple dashboard shows where your support comes from and which posts convert, so you spend energy on what actually pays.'
		},
		{
			icon: Link2,
			title: 'One link, everywhere',
			body: 'Drop buymezobo.com/yourname in any bio. It works the same in a tweet, a WhatsApp status, or a YouTube description.'
		}
	];

	const steps = [
		{
			n: '01',
			title: 'Claim your link',
			body: 'Pick your username and your page is live. No setup fee, no review queue.'
		},
		{
			n: '02',
			title: 'Add it to your bio',
			body: 'Paste your Zobo link where your audience already finds you.'
		},
		{
			n: '03',
			title: 'Get supported',
			body: 'Fans send Zobos with a message. You withdraw to your bank whenever you like.'
		}
	];

	// --- Scroll-pinned reveal for the "how it works" steps ---
	let activeStep = $state(0);
	let pinEnabled = $state(false);
	let stepProgress = $state(0); // continuous 0→1 for the progress rail

	function pinSteps(node) {
		const reduce =
			typeof window !== 'undefined' &&
			window.matchMedia &&
			window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (reduce) return { destroy() {} };

		pinEnabled = true;
		let ticking = false;

		function update() {
			ticking = false;
			const rect = node.getBoundingClientRect();
			const total = node.offsetHeight - window.innerHeight;
			const progress = total > 0 ? Math.min(Math.max(-rect.top / total, 0), 1) : 0;
			stepProgress = progress;
			// Give each step an equal, generous band of scroll. A short hold at the
			// very start and end keeps the first/last step from feeling clipped.
			activeStep = Math.min(steps.length - 1, Math.floor(progress * steps.length));
		}
		function onScroll() {
			if (!ticking) {
				ticking = true;
				requestAnimationFrame(update);
			}
		}

		update();
		window.addEventListener('scroll', onScroll, { passive: true });
		window.addEventListener('resize', onScroll);

		return {
			destroy() {
				window.removeEventListener('scroll', onScroll);
				window.removeEventListener('resize', onScroll);
			}
		};
	}

	const testimonials = [
		{
			quote:
				'I stopped chasing brand deals I hated. My audience already wanted to pay me — Zobo just gave them the button.',
			name: 'Ifeoma A.',
			role: 'Food creator, Lagos',
			initials: 'IA',
			bg: '#7a1633'
		},
		{
			quote:
				'Getting paid used to mean waiting on a foreign platform and losing a chunk to conversion. Now it hits my bank same day.',
			name: 'Seyi O.',
			role: 'Music producer, Nairobi',
			initials: 'SO',
			bg: '#c98f3a'
		},
		{
			quote:
				'The messages are the best part. People tell me why my comics matter to them. That keeps me drawing more than the money does.',
			name: 'Blessing N.',
			role: 'Illustrator, Accra',
			initials: 'BN',
			bg: '#4a0d1f'
		}
	];

	// --- Ambient cursor accent (desktop pointer only, motion-safe) ---
	let cursorReady = $state(false);
	let cursorHover = $state(false);
	let cursorRingEl;

	onMount(() => {
		const fine = window.matchMedia('(pointer: fine)').matches;
		const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (!fine || reduce) return;

		cursorReady = true;
		let mx = window.innerWidth / 2;
		let my = window.innerHeight / 2;
		let rx = mx;
		let ry = my;
		let raf;

		function onMove(e) {
			mx = e.clientX;
			my = e.clientY;
		}
		function onOver(e) {
			if (e.target.closest('a, button, input, summary, .demo-chip, .support-tier')) {
				cursorHover = true;
			}
		}
		function onOut(e) {
			if (e.target.closest('a, button, input, summary, .demo-chip, .support-tier')) {
				cursorHover = false;
			}
		}
		function loop() {
			// Lerp toward the pointer so the ring trails slightly instead of
			// snapping — the classic soft-follow cursor accent.
			rx += (mx - rx) * 0.18;
			ry += (my - ry) * 0.18;
			if (cursorRingEl) {
				cursorRingEl.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
			}
			raf = requestAnimationFrame(loop);
		}

		window.addEventListener('mousemove', onMove, { passive: true });
		window.addEventListener('mouseover', onOver);
		window.addEventListener('mouseout', onOut);
		raf = requestAnimationFrame(loop);

		return () => {
			window.removeEventListener('mousemove', onMove);
			window.removeEventListener('mouseover', onOver);
			window.removeEventListener('mouseout', onOut);
			cancelAnimationFrame(raf);
		};
	});

	const faqs = [
		{
			q: 'How fast do I actually get paid?',
			a: 'Withdrawals are processed the same day, usually within a couple of hours. There is no weekly or monthly payout schedule to wait on.'
		},
		{
			q: 'Do my fans need a Zobo account to send money?',
			a: 'No. Anyone with a local card, bank transfer, or USSD code can support you in a few taps — they never need to sign up for anything.'
		},
		{
			q: 'What does Buy Me Zobo take in fees?',
			a: 'A flat 5% per gift, shown before your fan checks out. No monthly subscription, no hidden charges, no separate withdrawal fee.'
		},
		{
			q: 'Can I use this alongside brand deals or other platforms?',
			a: 'Yes. Most creators treat their Zobo link as one more income stream next to sponsorships, merch, or memberships elsewhere.'
		}
	];
</script>

<svelte:head>
	<title>Buy Me Zobo — Get paid for your work, in Naira</title>
	<meta
		name="description"
		content="Buy Me Zobo lets your fans support you with a tap — card, transfer or USSD — and it lands in your bank the same day."
	/>
	<link rel="canonical" href="https://buymezobo.com/" />

	<meta property="og:type" content="website" />
	<meta property="og:site_name" content="Buy Me Zobo" />
	<meta property="og:title" content="Buy Me Zobo — Get paid for your work, in Naira" />
	<meta
		property="og:description"
		content="Buy Me Zobo lets your fans support you with a tap — card, transfer or USSD — and it lands in your bank the same day."
	/>
	<meta property="og:url" content="https://buymezobo.com/" />

	<meta name="twitter:card" content="summary" />
	<meta name="twitter:title" content="Buy Me Zobo — Get paid for your work, in Naira" />
	<meta
		name="twitter:description"
		content="Buy Me Zobo lets your fans support you with a tap — card, transfer or USSD — and it lands in your bank the same day."
	/>
</svelte:head>

<svelte:window
	onkeydown={(e) => {
		if (e.key === 'Escape' && mobileNavOpen) mobileNavOpen = false;
	}}
/>

<div class="page">
	<!-- ============ NAV ============ -->
	<header class="nav">
		<div class="nav-inner">
			<a href="/" class="brand">
				<span class="brand-mark" aria-hidden="true"></span>
				<span class="brand-name">Buy&nbsp;Me&nbsp;Zobo</span>
			</a>

			<nav class="nav-links" aria-label="Primary">
				<a href="#features">Features</a>
				<a href="#how">How it works</a>
				<a href="#stories">Stories</a>
				<a href="#pricing">Pricing</a>
				<a href="#faq">FAQ</a>
			</nav>

			<div class="nav-right">
				<div class="nav-actions">
					<a href="/login" class="nav-login">Log in</a>
					<a href="/signup" class="btn btn-primary" use:magnetic>Start my page</a>
				</div>

				<button
					class="nav-toggle"
					aria-label="Open menu"
					aria-expanded={mobileNavOpen}
					onclick={() => (mobileNavOpen = true)}
				>
					<Menu size={22} strokeWidth={1.75} />
				</button>
			</div>
		</div>
	</header>

	{#if mobileNavOpen}
		<div class="mobile-menu" role="dialog" aria-modal="true" aria-label="Menu">
			<div class="mobile-menu-top">
				<a href="/" class="brand" onclick={() => (mobileNavOpen = false)}>
					<span class="brand-mark" aria-hidden="true"></span>
					<span class="brand-name">Buy&nbsp;Me&nbsp;Zobo</span>
				</a>
				<button class="nav-toggle" aria-label="Close menu" onclick={() => (mobileNavOpen = false)}>
					<X size={24} strokeWidth={1.75} />
				</button>
			</div>
			<nav class="mobile-links" aria-label="Primary">
				<a href="#features" onclick={() => (mobileNavOpen = false)}>Features</a>
				<a href="#how" onclick={() => (mobileNavOpen = false)}>How it works</a>
				<a href="#stories" onclick={() => (mobileNavOpen = false)}>Stories</a>
				<a href="#pricing" onclick={() => (mobileNavOpen = false)}>Pricing</a>
				<a href="#faq" onclick={() => (mobileNavOpen = false)}>FAQ</a>
			</nav>
			<div class="mobile-actions">
				<a href="/login" class="btn btn-ghost btn-full" onclick={() => (mobileNavOpen = false)}
					>Log in</a
				>
				<a href="/signup" class="btn btn-primary btn-full" onclick={() => (mobileNavOpen = false)}
					>Start my page</a
				>
			</div>
		</div>
	{/if}

	<!-- ============ HERO ============ -->
	<section class="hero">
		<div class="hero-inner">
			<div class="hero-copy">
				<span class="pill" use:reveal>💛 Support that lands the same day</span>
				<h1 use:reveal={{ delay: 60 }}>Get paid for the work you already give away.</h1>
				<p class="hero-sub" use:reveal={{ delay: 140 }}>
					Buy Me Zobo lets your audience support you with a tap — card, transfer or USSD — and the
					money reaches your bank the same day. No dollars, no waiting, no cut you didn't agree to.
				</p>
				<form class="hero-claim" use:reveal={{ delay: 220 }} onsubmit={claimLink}>
					<div class="hero-claim-field">
						<span class="hero-claim-prefix">buymezobo.com/</span>
						<input
							class="hero-claim-input"
							type="text"
							bind:value={claimUsername}
							placeholder="yourname"
							autocomplete="off"
							spellcheck="false"
						/>
					</div>
					<button type="submit" class="hero-claim-btn" use:magnetic={{ max: 10 }}>
						Claim your link <ArrowRight size={16} strokeWidth={2.25} />
					</button>
				</form>

				<div class="hero-stats" use:reveal={{ delay: 300 }}>
					<div class="stat">
						<span class="stat-num">₦{statPaid}M</span>
						<span class="stat-label">paid to creators</span>
					</div>
					<div class="stat">
						<span class="stat-num">{Number(statCreators).toLocaleString('en-NG')}+</span>
						<span class="stat-label">creators onboard</span>
					</div>
					<div class="stat">
						<span class="stat-num">{statPayout}h</span>
						<span class="stat-label">avg. payout time</span>
					</div>
				</div>
			</div>

			<!-- Interactive "try it" card -->
			<div class="hero-visual" use:reveal={{ delay: 180, y: 28 }}>
				<div class="feed-card" use:tilt>
					<div class="feed-head">
						<span class="feed-dot"></span>
						Try sending a test Zobo
					</div>

					<div class="demo-controls">
						<div class="demo-amounts">
							{#each demoAmounts as amt (amt)}
								<button
									type="button"
									class="demo-chip"
									class:active={selectedAmount === amt}
									onclick={() => (selectedAmount = amt)}
								>
									₦{amt.toLocaleString('en-NG')}
								</button>
							{/each}
						</div>
						<div class="demo-row">
							<input
								class="demo-input"
								type="text"
								maxlength="40"
								placeholder="Add a quick note…"
								bind:value={demoNote}
							/>
							<button type="button" class="demo-send" onclick={sendDemo}>
								<Gift size={15} strokeWidth={2} /> Send
							</button>
						</div>
					</div>

					<div class="feed-list">
						{#each demoFeed as f, i (f.id)}
							<div class="feed-row" style="--i: {i}">
								<span class="feed-avatar">{f.name[0]}</span>
								<div class="feed-body">
									<p class="feed-line">
										<strong>{f.name}</strong> sent
										<strong class="feed-amount">₦{f.amount.toLocaleString('en-NG')}</strong>
									</p>
									<p class="feed-note">{f.note}</p>
								</div>
							</div>
						{/each}
					</div>
					<div class="feed-foot">
						<span>buymezobo.com/amara</span>
						<span class="feed-total">₦{demoTotal.toLocaleString('en-NG')} today</span>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- ============ MARQUEE STRIP ============ -->
	<div class="strip">
		<div class="strip-track">
			{#each ['Podcasters', 'Illustrators', 'Musicians', 'Writers', 'Streamers', 'Photographers', 'Comedians', 'Chefs', 'Teachers', 'Podcasters', 'Illustrators', 'Musicians', 'Writers', 'Streamers', 'Photographers', 'Comedians', 'Chefs', 'Teachers'] as tag}
				<span class="strip-item">{tag}</span>
				<span class="strip-sep">·</span>
			{/each}
		</div>
	</div>

	<!-- ============ RECEIVE SUPPORT PREVIEW ============ -->
	<section class="section support-preview">
		<div class="section-inner support-grid">
			<div class="support-copy" use:reveal>
				<div class="support-cup-lg" style="--fill: {cupFillPct}%" aria-hidden="true">
					<div class="cup-liquid"></div>
				</div>
				<h2>Receive support from your fans.</h2>
				<p>
					Add a support button to your page and let your audience back your work directly.
					Transparent fees, instant visibility into what you'll receive, and same-day withdrawal to
					your bank.
				</p>
			</div>

			<div class="support-card" use:reveal={{ delay: 120 }} use:tilt={{ max: 4 }}>
				<h3>
					Show Nelson some love
					<span class="support-cup-sm" style="--fill: {cupFillPct}%" aria-hidden="true">
						<span class="cup-liquid"></span>
					</span>
				</h3>
				<div class="support-tiers">
					{#each supportTiers as tier, i}
						<button
							type="button"
							class="support-tier"
							class:active={selectedTierIdx === i}
							onclick={() => (selectedTierIdx = i)}
						>
							{tier.n}
						</button>
					{/each}
				</div>
				<div class="support-breakdown">
					<div class="support-row">
						<span>Support amount</span>
						<span>₦{supportAmount.toLocaleString('en-NG')}</span>
					</div>
					<div class="support-row">
						<span>Service fee (5%)</span>
						<span>₦{supportFee.toLocaleString('en-NG')}</span>
					</div>
					<div class="support-row support-total">
						<span>Total</span>
						<span>₦{supportTotal.toLocaleString('en-NG')}</span>
					</div>
				</div>
				<a href="/signup" class="btn btn-primary btn-full btn-lg support-cta" use:magnetic={{ max: 8 }}>
					Support ₦{supportTotal.toLocaleString('en-NG')}
				</a>
			</div>
		</div>
	</section>

	<!-- ============ FEATURES ============ -->
	<section class="section features" id="features">
		<div class="section-inner">
			<div class="section-head" use:reveal>
				<span class="eyebrow">Why creators switch</span>
				<h2>Everything an overseas tip jar gets wrong for you.</h2>
			</div>

			<div class="feature-grid">
				{#each features as f, i}
					<article class="feature-card" use:reveal={{ delay: (i % 3) * 90 }}>
						<span class="feature-icon"><f.icon size={20} strokeWidth={1.75} /></span>
						<h3>{f.title}</h3>
						<p>{f.body}</p>
					</article>
				{/each}
			</div>
		</div>
	</section>

	<!-- ============ WHY USERS SWITCH (comparison) ============ -->
	<section class="section compare">
		<div class="section-inner">
			<div class="section-head" use:reveal>
				<span class="eyebrow gold">Side by side</span>
				<h2>No middlemen. No delays. No limits.</h2>
			</div>

			<div class="compare-table" use:reveal>
				<div class="compare-row compare-head">
					<span></span>
					<span>Buy Me Zobo</span>
					<span>Traditional platforms</span>
				</div>
				{#each compareRows as row}
					<div class="compare-row">
						<span class="compare-label">{row.label}</span>
						<span class="compare-us">{row.us}</span>
						<span class="compare-them">{row.them}</span>
					</div>
				{/each}
			</div>
		</div>
	</section>

	<!-- ============ HOW IT WORKS (scroll-pinned) ============ -->
	<section class="section how" id="how">
		<div class="section-inner">
			<div class="section-head" use:reveal>
				<span class="eyebrow">Live in 60 seconds</span>
				<h2>Three steps between you and your first Zobo.</h2>
			</div>
		</div>

		<div class="how-pin" class:pin-enabled={pinEnabled} use:pinSteps>
			<div class="how-sticky">
				<div class="how-stage">
					{#each steps as step, i}
						<div class="how-step" class:active={i === activeStep} aria-hidden={i !== activeStep}>
							<span class="step-n">{step.n}</span>
							<h3>{step.title}</h3>
							<p>{step.body}</p>
						</div>
					{/each}
				</div>
				<div class="how-rail" aria-hidden="true">
					<div class="how-rail-track">
						<span class="how-rail-fill" style="width: {stepProgress * 100}%"></span>
					</div>
					<div class="how-rail-nodes">
						{#each steps as step, i}
							<span class="how-node" class:active={i <= activeStep}>{i + 1}</span>
						{/each}
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- ============ STORIES ============ -->
	<section class="section stories" id="stories">
		<div class="section-inner">
			<div class="section-head" use:reveal>
				<span class="eyebrow">Creator stories</span>
				<h2>People are already getting paid to keep going.</h2>
			</div>

			<div class="story-grid">
				{#each testimonials as t, i}
					<figure class="story-card" use:reveal={{ delay: i * 100 }}>
						<Quote size={22} strokeWidth={1.5} class="story-quote" />
						<blockquote>{t.quote}</blockquote>
						<figcaption>
							<span class="story-avatar" style="background: {t.bg}">{t.initials}</span>
							<span>
								<strong>{t.name}</strong>
								<em>{t.role}</em>
							</span>
						</figcaption>
					</figure>
				{/each}
			</div>
		</div>
	</section>

	<!-- ============ PRICING ============ -->
	<section class="section pricing" id="pricing">
		<div class="section-inner">
			<div class="pricing-box" use:reveal>
				<div class="pricing-left">
					<span class="eyebrow gold">Pricing, plainly</span>
					<h2>Free to start. We only earn when you do.</h2>
					<p>
						No monthly subscription and no charge to open your page. We take a flat 5% on each gift
						— that's it. Compare that to losing 10–15% to currency conversion and international fees
						on platforms built for somewhere else.
					</p>
					<a href="/signup" class="btn btn-primary btn-lg" use:magnetic>
						Create your free page <ArrowRight size={18} strokeWidth={2} />
					</a>
				</div>
				<ul class="pricing-list">
					{#each ['₦0 to create your page', '₦0 monthly fee', '5% flat per gift, shown upfront', 'Same-day withdrawals to your bank', 'Card, transfer & USSD included', 'Keep 100% of your supporter list'] as item}
						<li><Check size={16} strokeWidth={2.5} /> {item}</li>
					{/each}
				</ul>
			</div>
		</div>
	</section>

	<!-- ============ FAQ ============ -->
	<section class="section faq" id="faq">
		<div class="section-inner">
			<div class="section-head" use:reveal>
				<span class="eyebrow">Questions</span>
				<h2>Everything you're probably wondering.</h2>
			</div>

			<div class="faq-list">
				{#each faqs as item, i}
					<details class="faq-item" use:reveal={{ delay: (i % 4) * 60 }}>
						<summary>
							<span>{item.q}</span>
							<span class="faq-icon" aria-hidden="true"></span>
						</summary>
						<p>{item.a}</p>
					</details>
				{/each}
			</div>
		</div>
	</section>

	<!-- ============ FINAL CTA ============ -->
	<section class="final">
		<div class="final-inner" use:reveal>
			<h2>Your next post could pay for itself.</h2>
			<p>Set up your page in under a minute and share it today.</p>
			<a href="/signup" class="btn btn-cream btn-lg" use:magnetic>
				Start my page <ArrowUpRight size={18} strokeWidth={2} />
			</a>
		</div>
	</section>

	<!-- ============ FOOTER ============ -->
	<footer class="footer">
		<span class="footer-watermark" aria-hidden="true">Buy Me Zobo</span>
		<div class="footer-inner">
			<div class="footer-brand">
				<span class="brand-mark" aria-hidden="true"></span>
				<span class="brand-name">Buy Me Zobo</span>
				<p>Support for creators, paid in Naira.</p>
			</div>
			<div class="footer-cols">
				<div class="footer-col">
					<h4>Product</h4>
					<a href="#features">Features</a>
					<a href="#pricing">Pricing</a>
					<a href="/login">Log in</a>
				</div>
				<div class="footer-col">
					<h4>Company</h4>
					<a href="#stories">Stories</a>
					<a href="#faq">FAQ</a>
					<a href="mailto:hello@buymezobo.com">Contact</a>
				</div>
				<div class="footer-col">
					<h4>Legal</h4>
					<span class="footer-static" title="Coming soon">Terms</span>
					<span class="footer-static" title="Coming soon">Privacy</span>
				</div>
			</div>
		</div>
		<div class="footer-bar">
			<span>© {new Date().getFullYear()} Buy Me Zobo. Made in Lagos.</span>
			<div class="footer-social">
				<span class="social-chip" role="img" aria-label="Instagram — coming soon">
					<svg
						width="16"
						height="16"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<rect x="3" y="3" width="18" height="18" rx="5" ry="5" />
						<circle cx="12" cy="12" r="4" />
						<circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" stroke="none" />
					</svg>
				</span>
				<span class="social-chip" role="img" aria-label="X — coming soon">
					<svg
						width="14"
						height="14"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2.5"
						stroke-linecap="round"
					>
						<line x1="4" y1="4" x2="20" y2="20" />
						<line x1="20" y1="4" x2="4" y2="20" />
					</svg>
				</span>
				<span class="social-chip" role="img" aria-label="TikTok — coming soon">
					<Music2 size={16} strokeWidth={2} />
				</span>
			</div>
		</div>
	</footer>

	{#if cursorReady}
		<div
			class="cursor-ring"
			class:hover={cursorHover}
			bind:this={cursorRingEl}
			aria-hidden="true"
		></div>
	{/if}
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
	:global(html) {
		scroll-behavior: smooth;
	}
	:global(body) {
		margin: 0;
	}

	.page {
		position: relative;
		font-family: 'Geist Variable', ui-sans-serif, system-ui, 'Segoe UI', Roboto, sans-serif;
		background: var(--cream);
		color: var(--ink);
		/* clip (not hidden) so this doesn't implicitly turn overflow-y into
		   'auto' and break position:sticky for the nav / pinned steps section */
		overflow-x: clip;
	}
	/* A faint film grain over the whole page — flat color blocks read as
	   printed/tactile instead of a plain digital gradient. Static (no
	   animation cost) and non-interactive. */
	.page::before {
		content: '';
		position: fixed;
		inset: 0;
		z-index: 990;
		pointer-events: none;
		opacity: 0.035;
		mix-blend-mode: overlay;
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
	}
	/* Ambient cursor accent: a soft-follow ring that inverts against
	   whatever's underneath, so it reads on both the cream and dark
	   sections without per-section theming. */
	.cursor-ring {
		position: fixed;
		top: 0;
		left: 0;
		width: 28px;
		height: 28px;
		border-radius: 50%;
		border: 1.5px solid #fff;
		pointer-events: none;
		z-index: 1000;
		mix-blend-mode: difference;
		transition:
			width 0.25s cubic-bezier(0.22, 1, 0.36, 1),
			height 0.25s cubic-bezier(0.22, 1, 0.36, 1);
	}
	.cursor-ring.hover {
		width: 50px;
		height: 50px;
	}
	@media (pointer: coarse) {
		.cursor-ring {
			display: none;
		}
	}
	* {
		box-sizing: border-box;
	}
	h1,
	h2,
	h3,
	h4 {
		margin: 0;
		font-weight: 700;
		letter-spacing: -0.02em;
		line-height: 1.1;
	}
	a {
		text-decoration: none;
		color: inherit;
	}

	.section-inner {
		max-width: 1120px;
		margin: 0 auto;
		padding: 0 1.5rem;
	}
	/* More generous vertical rhythm between sections — negative space is
	   most of what separates a "designed" page from a merely styled one. */
	.section {
		padding: clamp(5rem, 10vw, 8.5rem) 0;
	}

	.eyebrow {
		display: inline-block;
		font-size: 0.78rem;
		font-weight: 600;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--zobo-700);
		margin-bottom: 0.9rem;
	}
	.eyebrow.gold {
		color: var(--gold);
	}
	.section-head {
		max-width: 640px;
		margin: 0 auto clamp(3rem, 6vw, 4.5rem);
		text-align: center;
	}
	.section-head h2 {
		font-size: clamp(2rem, 4.4vw, 3.2rem);
		letter-spacing: -0.03em;
	}

	/* ============ BUTTONS ============ */
	.btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		font-weight: 600;
		font-size: 0.95rem;
		font-family: inherit;
		padding: 0.7rem 1.3rem;
		border-radius: 999px;
		border: 1.5px solid transparent;
		cursor: pointer;
		transition:
			transform 0.15s ease,
			background 0.15s ease,
			box-shadow 0.15s ease;
		white-space: nowrap;
	}
	.btn:hover {
		transform: translateY(-1px);
	}
	.btn-primary {
		background: var(--zobo-800);
		color: var(--cream);
		box-shadow: 0 8px 20px -8px rgba(92, 16, 41, 0.6);
	}
	.btn-primary:hover {
		background: var(--zobo-700);
	}
	.btn-ghost {
		background: transparent;
		border-color: rgba(92, 16, 41, 0.28);
		color: var(--zobo-900);
	}
	.btn-ghost:hover {
		background: rgba(92, 16, 41, 0.05);
	}
	.btn-cream {
		background: var(--cream);
		color: var(--zobo-950);
	}
	.btn-cream:hover {
		background: #fff;
	}
	.btn-lg {
		padding: 0.9rem 1.7rem;
		font-size: 1rem;
	}
	.btn-full {
		width: 100%;
	}

	/* ============ NAV ============ */
	.nav {
		position: sticky;
		top: 0;
		z-index: 40;
		background: color-mix(in srgb, var(--cream) 88%, transparent);
		backdrop-filter: blur(12px);
		border-bottom: 1px solid rgba(92, 16, 41, 0.08);
	}
	.nav-inner {
		max-width: 1200px;
		margin: 0 auto;
		padding: 0.85rem 1.5rem;
		display: grid;
		grid-template-columns: 1fr auto 1fr;
		align-items: center;
		gap: 1rem;
	}
	.brand {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		justify-self: start;
	}
	.brand-mark {
		width: 28px;
		height: 28px;
		border-radius: 50% 50% 50% 5px;
		background: linear-gradient(150deg, var(--zobo-600), var(--zobo-900));
		flex-shrink: 0;
	}
	.brand-name {
		font-weight: 700;
		font-size: 1.05rem;
		color: var(--zobo-950);
		letter-spacing: -0.01em;
	}
	.nav-links {
		display: flex;
		gap: 1.6rem;
		font-size: 0.92rem;
		font-weight: 500;
		color: var(--zobo-900);
		justify-self: center;
		white-space: nowrap;
	}
	.nav-links a {
		position: relative;
		padding: 0.2rem 0;
	}
	.nav-links a::after {
		content: '';
		position: absolute;
		left: 0;
		bottom: -2px;
		width: 0;
		height: 2px;
		background: var(--zobo-600);
		transition: width 0.2s ease;
	}
	.nav-links a:hover::after {
		width: 100%;
	}
	.nav-right {
		display: flex;
		align-items: center;
		justify-self: end;
	}
	.nav-actions {
		display: flex;
		align-items: center;
		gap: 1rem;
	}
	.nav-actions .btn-primary {
		box-shadow: none;
	}
	.nav-login {
		font-size: 0.92rem;
		font-weight: 600;
		color: var(--zobo-900);
	}
	.nav-login:hover {
		color: var(--zobo-600);
	}
	.nav-toggle {
		display: none;
		background: none;
		border: none;
		color: var(--zobo-950);
		cursor: pointer;
		padding: 0.25rem;
	}

	/* Mobile menu */
	.mobile-menu {
		display: none;
	}

	/* ============ HERO ============ */
	.hero {
		position: relative;
		/* Fills the space under the sticky nav (measured ~75px/4.7rem) and
		   centers its content in it, so the whole hero lands within one
		   screen on a typical laptop viewport instead of pushing the fold
		   down. Rounded up slightly to clear the nav with a hair of margin. */
		min-height: calc(100svh - 4.8rem);
		display: flex;
		align-items: center;
		background:
			radial-gradient(70% 60% at 82% 0%, rgba(151, 27, 61, 0.12), transparent 70%),
			radial-gradient(50% 50% at 0% 100%, rgba(201, 143, 58, 0.1), transparent 70%), var(--cream);
	}
	.hero-inner {
		max-width: 1200px;
		width: 100%;
		margin: 0 auto;
		padding: clamp(0.75rem, 2vw, 1.25rem) 1.5rem clamp(1.5rem, 3vw, 2.25rem);
		display: grid;
		grid-template-columns: 1.05fr 0.95fr;
		gap: clamp(1.5rem, 4vw, 3rem);
		align-items: center;
	}
	.hero-copy,
	.hero-visual {
		min-width: 0;
	}
	.pill {
		display: inline-block;
		background: rgba(92, 16, 41, 0.08);
		color: var(--zobo-800);
		font-size: 0.8rem;
		font-weight: 600;
		padding: 0.35rem 0.85rem;
		border-radius: 999px;
		margin-bottom: 0.85rem;
	}
	.hero h1 {
		font-size: clamp(2.1rem, 4.2vw, 3.4rem);
		line-height: 1.06;
		letter-spacing: -0.03em;
		color: var(--zobo-950);
	}
	.hero-sub {
		font-size: clamp(0.94rem, 1.15vw, 1.02rem);
		line-height: 1.55;
		color: #5a4038;
		max-width: 480px;
		margin: 1rem 0 1.35rem;
	}
	.hero-claim {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		max-width: 480px;
		background: #fffdf9;
		border: 1.5px solid rgba(92, 16, 41, 0.18);
		border-radius: 999px;
		padding: 0.35rem 0.35rem 0.35rem 1.1rem;
		transition: border-color 0.15s ease;
	}
	.hero-claim:focus-within {
		border-color: var(--zobo-700);
	}
	.hero-claim-field {
		display: flex;
		align-items: center;
		flex: 1;
		min-width: 0;
	}
	.hero-claim-prefix {
		font-size: 0.92rem;
		color: #9a7a6f;
		white-space: nowrap;
		flex-shrink: 0;
	}
	.hero-claim-input {
		flex: 1;
		min-width: 0;
		border: none;
		outline: none;
		background: none;
		font-family: inherit;
		font-size: 0.92rem;
		color: var(--ink);
		padding: 0.55rem 0;
	}
	.hero-claim-btn {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		font-family: inherit;
		font-weight: 600;
		font-size: 0.88rem;
		padding: 0.65rem 1.15rem;
		border-radius: 999px;
		border: none;
		background: var(--zobo-800);
		color: var(--cream);
		cursor: pointer;
		flex-shrink: 0;
		white-space: nowrap;
		transition:
			background 0.15s ease,
			transform 0.15s ease;
	}
	.hero-claim-btn:hover {
		background: var(--zobo-700);
		transform: translateY(-1px);
	}
	.hero-stats {
		display: flex;
		gap: clamp(1.1rem, 3.5vw, 2.2rem);
		margin-top: 1.5rem;
		flex-wrap: wrap;
	}
	.stat {
		display: flex;
		flex-direction: column;
	}
	.stat-num {
		font-size: clamp(1.25rem, 2.2vw, 1.6rem);
		font-weight: 700;
		color: var(--zobo-800);
		letter-spacing: -0.02em;
	}
	.stat-label {
		font-size: 0.8rem;
		color: #8a6a60;
		margin-top: 0.15rem;
	}

	/* Interactive demo card */
	.hero-visual {
		display: flex;
		justify-content: center;
	}
	.feed-card {
		width: 100%;
		max-width: 360px;
		background: #fffdf9;
		border: 1px solid rgba(92, 16, 41, 0.12);
		border-radius: 22px;
		box-shadow: 0 30px 60px -24px rgba(43, 6, 15, 0.32);
		overflow: hidden;
	}
	.feed-head {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 1rem 1.25rem;
		font-size: 0.8rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--zobo-700);
		border-bottom: 1px solid rgba(92, 16, 41, 0.08);
	}
	.feed-dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: #d64d6f;
		box-shadow: 0 0 0 0 rgba(214, 77, 111, 0.5);
		animation: pulse 2s infinite;
		flex-shrink: 0;
	}
	@keyframes pulse {
		0% {
			box-shadow: 0 0 0 0 rgba(214, 77, 111, 0.5);
		}
		70% {
			box-shadow: 0 0 0 8px rgba(214, 77, 111, 0);
		}
		100% {
			box-shadow: 0 0 0 0 rgba(214, 77, 111, 0);
		}
	}
	.demo-controls {
		padding: 0.7rem 1.25rem 0.55rem;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		border-bottom: 1px solid rgba(92, 16, 41, 0.08);
	}
	.demo-amounts {
		display: flex;
		gap: 0.4rem;
		flex-wrap: wrap;
	}
	.demo-chip {
		font-family: inherit;
		font-size: 0.78rem;
		font-weight: 600;
		padding: 0.35rem 0.7rem;
		border-radius: 999px;
		border: 1.5px solid rgba(92, 16, 41, 0.18);
		background: transparent;
		color: var(--zobo-800);
		cursor: pointer;
		transition:
			background 0.15s ease,
			color 0.15s ease,
			border-color 0.15s ease;
	}
	.demo-chip.active {
		background: var(--zobo-800);
		border-color: var(--zobo-800);
		color: var(--cream);
	}
	.demo-row {
		display: flex;
		gap: 0.5rem;
	}
	.demo-input {
		flex: 1;
		min-width: 0;
		font-family: inherit;
		font-size: 0.85rem;
		padding: 0.55rem 0.75rem;
		border-radius: 10px;
		border: 1.5px solid rgba(92, 16, 41, 0.15);
		background: var(--cream);
		color: var(--ink);
	}
	.demo-input:focus {
		outline: none;
		border-color: var(--zobo-700);
	}
	.demo-send {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		font-family: inherit;
		font-size: 0.85rem;
		font-weight: 600;
		padding: 0.55rem 0.9rem;
		border-radius: 10px;
		border: none;
		background: var(--zobo-800);
		color: var(--cream);
		cursor: pointer;
		flex-shrink: 0;
		transition: background 0.15s ease;
	}
	.demo-send:hover {
		background: var(--zobo-700);
	}
	.feed-list {
		padding: 0.5rem;
		max-height: 190px;
		overflow: hidden;
		/* Fade the clipped last row instead of cutting it off hard — reads as
		   "there's more" rather than a layout bug. */
		mask-image: linear-gradient(to bottom, black calc(100% - 28px), transparent 100%);
		-webkit-mask-image: linear-gradient(to bottom, black calc(100% - 28px), transparent 100%);
	}
	.feed-row {
		display: flex;
		gap: 0.75rem;
		align-items: flex-start;
		padding: 0.7rem 0.75rem;
		border-radius: 12px;
		animation: feedIn 0.5s cubic-bezier(0.22, 1, 0.36, 1) backwards;
		animation-delay: calc(var(--i) * 0.12s + 0.3s);
	}
	.feed-row:hover {
		background: rgba(92, 16, 41, 0.04);
	}
	@keyframes feedIn {
		from {
			opacity: 0;
			transform: translateY(10px);
		}
		to {
			opacity: 1;
			transform: none;
		}
	}
	.feed-avatar {
		width: 34px;
		height: 34px;
		border-radius: 50%;
		background: linear-gradient(150deg, var(--zobo-600), var(--zobo-900));
		color: var(--cream);
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: 600;
		font-size: 0.9rem;
		flex-shrink: 0;
	}
	.feed-body {
		min-width: 0;
	}
	.feed-line {
		margin: 0;
		font-size: 0.88rem;
		color: var(--ink);
	}
	.feed-amount {
		color: var(--zobo-700);
	}
	.feed-note {
		margin: 0.15rem 0 0;
		font-size: 0.8rem;
		color: #9a7a6f;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.feed-foot {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.85rem 1.25rem;
		border-top: 1px solid rgba(92, 16, 41, 0.08);
		font-size: 0.78rem;
		color: #9a7a6f;
	}
	.feed-total {
		font-weight: 700;
		color: var(--zobo-800);
	}

	/* ============ MARQUEE STRIP ============ */
	.strip {
		background: var(--zobo-950);
		overflow: hidden;
		padding: 0.85rem 0;
	}
	.strip-track {
		display: flex;
		align-items: center;
		gap: 1.25rem;
		white-space: nowrap;
		width: max-content;
		animation: scrollX 28s linear infinite;
	}
	.strip-item {
		color: var(--cream);
		font-weight: 600;
		font-size: 0.95rem;
		opacity: 0.9;
	}
	.strip-sep {
		color: var(--gold-light);
	}
	@keyframes scrollX {
		from {
			transform: translateX(0);
		}
		to {
			transform: translateX(-50%);
		}
	}

	/* ============ RECEIVE SUPPORT PREVIEW ============ */
	.support-preview {
		background: var(--cream-2);
	}
	.support-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: clamp(2rem, 5vw, 4rem);
		align-items: center;
	}
	.support-copy,
	.support-card {
		min-width: 0;
	}
	.support-copy h2 {
		font-size: clamp(2.1rem, 4vw, 3rem);
		letter-spacing: -0.03em;
		color: var(--zobo-950);
		margin: 1.25rem 0 1rem;
	}
	.support-copy p {
		font-size: 1rem;
		line-height: 1.6;
		color: #6b5049;
		max-width: 460px;
	}

	/* Cup-fill motif, shared by the big and small variants */
	.support-cup-lg,
	.support-cup-sm {
		position: relative;
		overflow: hidden;
		border: solid var(--zobo-800);
		border-top: none;
		border-radius: 0 0 20px 20px;
		background: rgba(92, 16, 41, 0.05);
		flex-shrink: 0;
	}
	.support-cup-lg {
		display: block;
		width: 64px;
		height: 78px;
		border-width: 3px;
	}
	.support-cup-lg::after {
		content: '';
		position: absolute;
		right: -14px;
		top: 12px;
		width: 14px;
		height: 24px;
		border: 3px solid var(--zobo-800);
		border-left: none;
		border-radius: 0 12px 12px 0;
	}
	.support-cup-sm {
		display: inline-block;
		width: 20px;
		height: 24px;
		border-width: 2px;
		border-radius: 0 0 8px 8px;
	}
	.cup-liquid {
		position: absolute;
		left: 0;
		right: 0;
		bottom: 0;
		height: var(--fill, 40%);
		background: linear-gradient(180deg, var(--gold-light), var(--gold));
		transition: height 0.4s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.support-card {
		background: #fffdf9;
		border: 1px solid rgba(92, 16, 41, 0.12);
		border-radius: 22px;
		padding: 1.75rem;
		box-shadow: 0 30px 60px -24px rgba(43, 6, 15, 0.28);
	}
	.support-card h3 {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		font-size: 1.1rem;
		color: var(--zobo-950);
		margin: 0 0 1.25rem;
	}
	.support-tiers {
		display: flex;
		gap: 0.6rem;
		margin-bottom: 1.5rem;
	}
	.support-tier {
		flex: 1;
		padding: 0.6rem;
		border-radius: 12px;
		border: 1.5px solid rgba(92, 16, 41, 0.15);
		background: transparent;
		font-family: inherit;
		font-weight: 700;
		font-size: 0.95rem;
		color: var(--zobo-800);
		cursor: pointer;
		transition:
			background 0.15s ease,
			color 0.15s ease,
			border-color 0.15s ease;
	}
	.support-tier.active {
		background: var(--zobo-800);
		border-color: var(--zobo-800);
		color: var(--cream);
	}
	.support-breakdown {
		border-top: 1px solid rgba(92, 16, 41, 0.1);
		border-bottom: 1px solid rgba(92, 16, 41, 0.1);
		padding: 1rem 0;
		margin-bottom: 1.25rem;
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
	}
	.support-row {
		display: flex;
		justify-content: space-between;
		font-size: 0.9rem;
		color: #6b5049;
	}
	.support-row.support-total {
		font-weight: 700;
		color: var(--zobo-950);
		font-size: 1rem;
	}

	/* ============ WHY USERS SWITCH (comparison) ============ */
	.compare {
		background: var(--cream);
	}
	.compare-table {
		background: linear-gradient(165deg, var(--zobo-900), var(--zobo-950));
		border-radius: 22px;
		padding: 0.5rem clamp(1rem, 3vw, 2rem);
		box-shadow: 0 30px 60px -30px rgba(43, 6, 15, 0.5);
	}
	.compare-row {
		display: grid;
		grid-template-columns: 1.2fr 1fr 1fr;
		gap: 1rem;
		padding: 1.1rem 0.5rem;
		align-items: center;
	}
	.compare-row + .compare-row {
		border-top: 1px solid rgba(251, 243, 231, 0.1);
	}
	.compare-head {
		font-size: 0.72rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: rgba(251, 243, 231, 0.5);
	}
	.compare-label {
		font-weight: 600;
		color: var(--cream);
		font-size: 0.95rem;
	}
	.compare-us {
		font-weight: 700;
		color: var(--gold-light);
		font-size: 0.95rem;
	}
	.compare-them {
		color: rgba(251, 243, 231, 0.55);
		font-size: 0.9rem;
	}

	/* ============ FEATURES ============ */
	.features {
		background: var(--cream);
	}
	.feature-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 1.25rem;
	}
	.feature-card {
		background: #fffdf9;
		border: 1px solid rgba(92, 16, 41, 0.1);
		border-radius: 18px;
		padding: 1.75rem;
		transition:
			transform 0.2s ease,
			border-color 0.2s ease;
	}
	.feature-card:hover {
		transform: translateY(-4px);
		border-color: rgba(92, 16, 41, 0.25);
	}
	.feature-icon {
		display: inline-flex;
		width: 44px;
		height: 44px;
		align-items: center;
		justify-content: center;
		border-radius: 12px;
		background: rgba(151, 27, 61, 0.1);
		color: var(--zobo-700);
		margin-bottom: 1.1rem;
	}
	.feature-card h3 {
		font-size: 1.12rem;
		margin-bottom: 0.5rem;
		color: var(--zobo-950);
	}
	.feature-card p {
		margin: 0;
		font-size: 0.92rem;
		line-height: 1.55;
		color: #6b5049;
	}

	/* ============ HOW IT WORKS (scroll-pinned) ============ */
	.how {
		background: var(--cream-2);
	}
	.how-pin {
		position: relative;
	}
	/* Total height minus the 100vh sticky viewport = the scroll budget shared
	   across the steps. 360vh → ~87vh of scroll per step, so each one holds
	   long enough to read before the next. */
	.how-pin.pin-enabled {
		height: 360vh;
	}
	.how-sticky {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 2rem;
		min-height: 40vh;
	}
	.how-pin.pin-enabled .how-sticky {
		position: sticky;
		top: 0;
		height: 100vh;
		min-height: 0;
	}
	.how-stage {
		position: relative;
		width: 100%;
		max-width: 420px;
		padding: 0 1.5rem;
	}
	.how-step {
		text-align: center;
		display: flex;
		flex-direction: column;
		align-items: center;
	}
	.how-pin.pin-enabled .how-step {
		position: absolute;
		inset: 0;
		opacity: 0;
		transform: translateY(18px);
		transition:
			opacity 0.45s ease,
			transform 0.45s ease;
		pointer-events: none;
	}
	.how-pin.pin-enabled .how-step.active {
		opacity: 1;
		transform: none;
		pointer-events: auto;
		position: relative;
	}
	.how-pin:not(.pin-enabled) .how-stage {
		display: flex;
		flex-direction: column;
		gap: 2.5rem;
		max-width: 480px;
	}
	.step-n {
		display: inline-flex;
		width: 52px;
		height: 52px;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
		background: var(--zobo-800);
		color: var(--cream);
		font-weight: 700;
		font-size: 1.05rem;
		margin-bottom: 1.1rem;
		box-shadow: 0 8px 18px -8px rgba(92, 16, 41, 0.6);
	}
	.how-step h3 {
		font-size: clamp(1.6rem, 3vw, 2.1rem);
		letter-spacing: -0.03em;
		margin-bottom: 0.6rem;
		color: var(--zobo-950);
	}
	.how-step p {
		margin: 0 auto;
		max-width: 320px;
		font-size: 0.98rem;
		line-height: 1.6;
		color: #6b5049;
	}
	/* Numbered progress rail: a track that fills continuously as you scroll,
	   with a node lighting up as each step becomes active. */
	.how-rail {
		--node: 30px;
		position: relative;
		width: min(320px, 78vw);
	}
	.how-rail-track {
		position: absolute;
		top: 50%;
		left: calc(var(--node) / 2);
		right: calc(var(--node) / 2);
		height: 3px;
		transform: translateY(-50%);
		background: rgba(92, 16, 41, 0.14);
		border-radius: 999px;
		overflow: hidden;
	}
	.how-rail-fill {
		display: block;
		height: 100%;
		background: linear-gradient(90deg, var(--zobo-700), var(--gold));
		border-radius: 999px;
		transition: width 0.12s linear;
	}
	.how-rail-nodes {
		position: relative;
		display: flex;
		justify-content: space-between;
	}
	.how-node {
		width: var(--node);
		height: var(--node);
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 0.8rem;
		font-weight: 700;
		background: var(--cream);
		border: 2px solid rgba(92, 16, 41, 0.16);
		color: var(--zobo-800);
		transition:
			background 0.3s ease,
			border-color 0.3s ease,
			color 0.3s ease,
			transform 0.3s ease;
	}
	.how-node.active {
		background: var(--zobo-800);
		border-color: var(--zobo-800);
		color: var(--cream);
		transform: scale(1.08);
	}
	.how-pin:not(.pin-enabled) .how-rail {
		display: none;
	}

	/* ============ STORIES ============ */
	.stories {
		background: var(--cream);
	}
	.story-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 1.25rem;
	}
	.story-card {
		margin: 0;
		background: #fffdf9;
		border: 1px solid rgba(92, 16, 41, 0.1);
		border-radius: 18px;
		padding: 1.75rem;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
	.story-card :global(.story-quote) {
		color: var(--gold);
	}
	.story-card blockquote {
		margin: 0;
		font-size: 1rem;
		line-height: 1.55;
		color: var(--zobo-950);
		flex: 1;
	}
	.story-card figcaption {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}
	.story-avatar {
		width: 40px;
		height: 40px;
		border-radius: 50%;
		color: var(--cream);
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: 700;
		font-size: 0.85rem;
		flex-shrink: 0;
	}
	.story-card figcaption strong {
		display: block;
		font-size: 0.9rem;
		color: var(--ink);
	}
	.story-card figcaption em {
		font-style: normal;
		font-size: 0.8rem;
		color: #9a7a6f;
	}

	/* ============ PRICING ============ */
	.pricing {
		background: var(--cream-2);
	}
	.pricing-box {
		background: linear-gradient(165deg, var(--zobo-900), var(--zobo-950));
		border-radius: 26px;
		padding: clamp(2rem, 5vw, 3.5rem);
		display: grid;
		grid-template-columns: 1.1fr 0.9fr;
		gap: clamp(2rem, 5vw, 4rem);
		align-items: center;
		box-shadow: 0 30px 60px -30px rgba(43, 6, 15, 0.5);
	}
	.pricing-left .eyebrow {
		margin-bottom: 0.75rem;
	}
	.pricing-left h2 {
		color: var(--cream);
		font-size: clamp(1.8rem, 3.6vw, 2.6rem);
		letter-spacing: -0.03em;
		margin-bottom: 1rem;
	}
	.pricing-left p {
		color: rgba(251, 243, 231, 0.78);
		line-height: 1.6;
		margin: 0 0 1.75rem;
		font-size: 0.98rem;
	}
	.pricing-list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0.85rem;
	}
	.pricing-list li {
		display: flex;
		align-items: center;
		gap: 0.7rem;
		color: var(--cream);
		font-size: 0.95rem;
		font-weight: 500;
	}
	.pricing-list :global(svg) {
		color: var(--gold-light);
		flex-shrink: 0;
	}

	/* ============ FAQ ============ */
	.faq {
		background: var(--cream);
	}
	.faq-list {
		max-width: 720px;
		margin: 0 auto;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}
	.faq-item {
		background: #fffdf9;
		border: 1px solid rgba(92, 16, 41, 0.1);
		border-radius: 14px;
		padding: 0.3rem 1.5rem;
	}
	.faq-item summary {
		list-style: none;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		padding: 1.1rem 0;
		font-weight: 600;
		font-size: 1rem;
		color: var(--zobo-950);
		cursor: pointer;
	}
	.faq-item summary::-webkit-details-marker {
		display: none;
	}
	.faq-icon {
		position: relative;
		flex-shrink: 0;
		width: 18px;
		height: 18px;
	}
	.faq-icon::before,
	.faq-icon::after {
		content: '';
		position: absolute;
		background: var(--zobo-700);
		border-radius: 2px;
		transition: transform 0.2s ease;
	}
	.faq-icon::before {
		top: 8px;
		left: 1px;
		width: 16px;
		height: 2px;
	}
	.faq-icon::after {
		top: 1px;
		left: 8px;
		width: 2px;
		height: 16px;
	}
	.faq-item[open] .faq-icon::after {
		transform: rotate(90deg);
	}
	.faq-item p {
		margin: 0 0 1.2rem;
		font-size: 0.92rem;
		line-height: 1.6;
		color: #6b5049;
	}

	/* ============ FINAL CTA ============ */
	.final {
		background: var(--zobo-950);
	}
	.final-inner {
		max-width: 720px;
		margin: 0 auto;
		padding: clamp(4rem, 9vw, 6.5rem) 1.5rem;
		text-align: center;
	}
	.final h2 {
		color: var(--cream);
		font-size: clamp(2.2rem, 5vw, 3.6rem);
		letter-spacing: -0.035em;
		margin-bottom: 0.75rem;
	}
	.final p {
		color: rgba(251, 243, 231, 0.72);
		font-size: 1.05rem;
		margin: 0 0 2rem;
	}

	/* ============ FOOTER ============ */
	.footer {
		position: relative;
		background: var(--zobo-950);
		color: rgba(251, 243, 231, 0.7);
		border-top: 1px solid rgba(251, 243, 231, 0.1);
		overflow: hidden;
	}
	.footer-watermark {
		position: absolute;
		left: 50%;
		bottom: -8%;
		transform: translateX(-50%);
		font-size: clamp(5rem, 22vw, 15rem);
		font-weight: 800;
		letter-spacing: -0.03em;
		color: rgba(251, 243, 231, 0.032);
		white-space: nowrap;
		pointer-events: none;
		z-index: 0;
		line-height: 1;
	}
	.footer-inner {
		position: relative;
		z-index: 1;
		max-width: 1120px;
		margin: 0 auto;
		padding: 3.5rem 1.5rem 2.5rem;
		display: grid;
		grid-template-columns: 1.3fr 2fr;
		gap: 2.5rem;
	}
	.footer-brand {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}
	.footer-brand .brand-name {
		color: var(--cream);
		font-size: 1.05rem;
	}
	.footer-brand p {
		margin: 0.25rem 0 0;
		font-size: 0.88rem;
		max-width: 240px;
		line-height: 1.5;
	}
	.footer-cols {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 1.5rem;
	}
	.footer-col {
		display: flex;
		flex-direction: column;
		gap: 0.7rem;
	}
	.footer-col h4 {
		color: var(--cream);
		font-size: 0.8rem;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		font-weight: 600;
		margin-bottom: 0.2rem;
	}
	.footer-col a {
		font-size: 0.9rem;
	}
	.footer-col a:hover {
		color: var(--cream);
	}
	.footer-static {
		font-size: 0.9rem;
		opacity: 0.55;
		cursor: default;
	}
	.footer-bar {
		position: relative;
		z-index: 1;
		max-width: 1120px;
		margin: 0 auto;
		padding: 1.5rem;
		border-top: 1px solid rgba(251, 243, 231, 0.1);
		display: flex;
		align-items: center;
		justify-content: space-between;
		font-size: 0.85rem;
		gap: 1rem;
		flex-wrap: wrap;
	}
	.footer-social {
		display: flex;
		gap: 0.6rem;
	}
	.social-chip {
		display: inline-flex;
		width: 32px;
		height: 32px;
		align-items: center;
		justify-content: center;
		border-radius: 8px;
		background: rgba(251, 243, 231, 0.1);
		color: var(--cream);
		font-size: 0.72rem;
		font-weight: 600;
		transition: background 0.15s ease;
	}
	.social-chip:hover {
		background: rgba(251, 243, 231, 0.2);
	}

	/* ============ RESPONSIVE ============ */
	@media (max-width: 900px) {
		.nav-links,
		.nav-actions {
			display: none;
		}
		.nav-inner {
			grid-template-columns: 1fr auto;
		}
		.nav-toggle {
			display: flex;
		}

		.mobile-menu {
			display: flex;
			flex-direction: column;
			position: fixed;
			inset: 0;
			z-index: 60;
			background: var(--cream);
			padding: 0.85rem 1.5rem 2rem;
		}
		.mobile-menu-top {
			display: flex;
			align-items: center;
			justify-content: space-between;
			padding: 0.15rem 0 1.5rem;
		}
		.mobile-links {
			display: flex;
			flex-direction: column;
			flex: 1;
			justify-content: center;
			gap: 0.5rem;
		}
		.mobile-links a {
			font-size: 1.6rem;
			font-weight: 700;
			color: var(--zobo-950);
			padding: 0.5rem 0;
			letter-spacing: -0.02em;
		}
		.mobile-actions {
			display: flex;
			flex-direction: column;
			gap: 0.75rem;
		}

		.hero-inner {
			grid-template-columns: 1fr;
		}
		.hero-visual {
			order: -1;
		}
		.hero-copy {
			text-align: center;
		}
		.hero-claim {
			margin: 0 auto;
		}
		.hero-stats {
			justify-content: center;
			text-align: center;
		}
		.support-grid {
			grid-template-columns: 1fr;
			text-align: center;
		}
		.support-cup-lg {
			margin: 0 auto;
		}
		.support-copy p {
			margin: 0 auto;
		}
		.feature-grid {
			grid-template-columns: 1fr;
		}
		/* Was 210vh → only ~37vh of scroll per step, so a quick swipe blew
		   through 1→3. Match the desktop budget so mobile paces the same. */
		.how-pin.pin-enabled {
			height: 340vh;
		}
		.story-grid {
			grid-template-columns: 1fr;
		}
		.pricing-box {
			grid-template-columns: 1fr;
		}
		.pricing-left {
			text-align: center;
		}
		.pricing-left a.btn {
			margin: 0 auto;
		}
		.footer-watermark {
			/* nowrap at the desktop clamp would overflow a narrow viewport far
			   enough to clip nearly the whole word — shrink it so it still
			   reads as "Buy Me Zobo" instead of a random slice of letters. */
			font-size: clamp(2.25rem, 13vw, 6rem);
			bottom: -5%;
		}
		.footer-inner {
			grid-template-columns: 1fr;
			gap: 1.25rem;
			padding: 1.5rem 1.5rem 1rem;
			text-align: center;
		}
		.footer-brand {
			align-items: center;
		}
		.footer-cols {
			text-align: left;
			gap: 1.25rem;
		}
		.footer-bar {
			padding: 1rem 1.5rem;
		}
		.final-inner {
			padding: clamp(2.5rem, 8vw, 4rem) 1.5rem;
		}
	}

	@media (max-width: 640px) {
		.section {
			padding: clamp(3rem, 12vw, 4.5rem) 0;
		}
		.demo-row {
			flex-direction: column;
		}
		.demo-send {
			justify-content: center;
		}
		.feed-note {
			white-space: normal;
		}
		.hero-claim {
			flex-direction: column;
			align-items: stretch;
			border-radius: 20px;
			padding: 0.4rem;
			gap: 0.4rem;
		}
		.hero-claim-field {
			padding: 0.3rem 0.6rem;
		}
		.hero-claim-btn {
			justify-content: center;
			border-radius: 14px;
		}
		.compare-row {
			gap: 0.5rem;
			padding: 0.9rem 0.25rem;
		}
		.compare-label,
		.compare-us,
		.compare-them {
			font-size: 0.8rem;
		}
	}

	@media (max-width: 520px) {
		.footer-cols {
			gap: 0.75rem;
		}
		.hero-stats {
			gap: 1.25rem 2rem;
		}
		.footer-bar {
			justify-content: center;
			text-align: center;
		}
		.stat {
			align-items: center;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		:global(html) {
			scroll-behavior: auto;
		}
		.strip-track,
		.feed-row,
		.feed-dot {
			animation: none;
		}
		.feed-row {
			opacity: 1;
		}
		.cursor-ring {
			display: none;
		}
	}
</style>
