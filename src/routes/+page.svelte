<script>
	import { onMount } from 'svelte';
	import { reveal } from '$lib/reveal.js';
	import {
		ArrowRight,
		ArrowUpRight,
		Menu,
		X,
		Banknote,
		Smartphone,
		ShieldCheck,
		Gift,
		MessageCircle,
		TrendingUp,
		Link2,
		Star,
		Quote,
		Check
	} from '@lucide/svelte';

	let mobileNavOpen = $state(false);

	// --- Animated hero stat counters ---
	let statPaid = $state(0);
	let statCreators = $state(0);
	let statPayout = $state(0);

	const statTargets = { paid: 48, creators: 3200, payout: 12 };

	onMount(() => {
		const duration = 1400;
		const start = performance.now();
		function tick(now) {
			const t = Math.min((now - start) / duration, 1);
			const ease = 1 - Math.pow(1 - t, 3);
			statPaid = (statTargets.paid * ease).toFixed(1);
			statCreators = Math.floor(statTargets.creators * ease);
			statPayout = Math.max(1, Math.round(statTargets.payout * ease));
			if (t < 1) requestAnimationFrame(tick);
		}
		requestAnimationFrame(tick);
	});

	// --- Live support ticker ---
	const feed = [
		{ name: 'Tomiwa', amount: '₦5,000', note: 'For the Lagos food series 🍲' },
		{ name: 'Zainab', amount: '₦2,000', note: 'Your beats got me through exams' },
		{ name: 'Emeka', amount: '₦10,000', note: 'Keep the podcast going!' },
		{ name: 'Aisha', amount: '₦3,000', note: 'Love the illustrations' },
		{ name: 'Kunle', amount: '₦1,000', note: 'First time supporter ✨' }
	];

	const features = [
		{
			icon: Banknote,
			title: 'Paid in Naira, same day',
			body: 'Support lands in your Nigerian bank account within hours — no dollar conversion, no week-long holds, no middleman eating your money.'
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
		{ n: '01', title: 'Claim your link', body: 'Pick your username and your page is live. No setup fee, no review queue.' },
		{ n: '02', title: 'Add it to your bio', body: 'Paste your Zobo link where your audience already finds you.' },
		{ n: '03', title: 'Get supported', body: 'Fans send Zobos with a message. You withdraw to your bank whenever you like.' }
	];

	const testimonials = [
		{
			quote: 'I stopped chasing brand deals I hated. My audience already wanted to pay me — Zobo just gave them the button.',
			name: 'Ifeoma A.',
			role: 'Food creator, Lagos',
			initials: 'IA',
			bg: '#7a1633'
		},
		{
			quote: 'Getting paid used to mean waiting on a foreign platform and losing a chunk to conversion. Now it hits my GTBank same day.',
			name: 'Seyi O.',
			role: 'Music producer, Ibadan',
			initials: 'SO',
			bg: '#c98f3a'
		},
		{
			quote: 'The messages are the best part. People tell me why my comics matter to them. That keeps me drawing more than the money does.',
			name: 'Blessing N.',
			role: 'Illustrator, Abuja',
			initials: 'BN',
			bg: '#4a0d1f'
		}
	];
</script>

<svelte:head>
	<title>Buy Me Zobo — Get paid for your work, in Naira</title>
	<meta
		name="description"
		content="The support platform built for Nigerian creators. Your fans send you Zobos, you withdraw to your bank the same day."
	/>
</svelte:head>

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
			</nav>

			<div class="nav-actions">
				<a href="/login" class="nav-login">Log in</a>
				<a href="/signup" class="btn btn-primary">Start my page</a>
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
			</nav>
			<div class="mobile-actions">
				<a href="/login" class="btn btn-ghost btn-full" onclick={() => (mobileNavOpen = false)}>Log in</a>
				<a href="/signup" class="btn btn-primary btn-full" onclick={() => (mobileNavOpen = false)}>Start my page</a>
			</div>
		</div>
	{/if}

	<!-- ============ HERO ============ -->
	<section class="hero">
		<div class="hero-inner">
			<div class="hero-copy">
				<span class="pill" use:reveal>🇳🇬 Built for Nigerian creators</span>
				<h1 use:reveal={{ delay: 60 }}>
					Get paid for the work you already give away.
				</h1>
				<p class="hero-sub" use:reveal={{ delay: 140 }}>
					Buy Me Zobo lets your audience support you with a tap — card, transfer or USSD — and
					the money reaches your bank the same day. No dollars, no waiting, no cut you didn't agree to.
				</p>
				<div class="hero-cta" use:reveal={{ delay: 220 }}>
					<a href="/signup" class="btn btn-primary btn-lg">
						Start my page <ArrowRight size={18} strokeWidth={2} />
					</a>
					<a href="#how" class="btn btn-ghost btn-lg">See how it works</a>
				</div>

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

			<!-- Live support feed card -->
			<div class="hero-visual" use:reveal={{ delay: 180, y: 28 }}>
				<div class="feed-card">
					<div class="feed-head">
						<span class="feed-dot"></span>
						Live support
					</div>
					<div class="feed-list">
						{#each feed as f, i}
							<div class="feed-row" style="--i: {i}">
								<span class="feed-avatar">{f.name[0]}</span>
								<div class="feed-body">
									<p class="feed-line">
										<strong>{f.name}</strong> sent <strong class="feed-amount">{f.amount}</strong>
									</p>
									<p class="feed-note">{f.note}</p>
								</div>
							</div>
						{/each}
					</div>
					<div class="feed-foot">
						<span>buymezobo.com/amara</span>
						<span class="feed-total">₦21,000 today</span>
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

	<!-- ============ FEATURES ============ -->
	<section class="section features" id="features">
		<div class="section-inner">
			<div class="section-head" use:reveal>
				<span class="eyebrow">Why creators switch</span>
				<h2>Everything an overseas tip jar gets wrong about Nigeria.</h2>
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

	<!-- ============ HOW IT WORKS ============ -->
	<section class="section how" id="how">
		<div class="section-inner">
			<div class="section-head" use:reveal>
				<span class="eyebrow">Live in 60 seconds</span>
				<h2>Three steps between you and your first Zobo.</h2>
			</div>

			<div class="steps">
				{#each steps as step, i}
					<div class="step" use:reveal={{ delay: i * 120 }}>
						<span class="step-n">{step.n}</span>
						<h3>{step.title}</h3>
						<p>{step.body}</p>
					</div>
				{/each}
				<div class="steps-line" aria-hidden="true"></div>
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
						No monthly subscription and no charge to open your page. We take a flat 5% on each gift —
						that's it. Compare that to losing 10–15% to currency conversion and international fees on
						platforms built for somewhere else.
					</p>
					<a href="/signup" class="btn btn-primary btn-lg">
						Create your free page <ArrowRight size={18} strokeWidth={2} />
					</a>
				</div>
				<ul class="pricing-list">
					{#each ['₦0 to create your page', '₦0 monthly fee', '5% flat per gift, shown upfront', 'Same-day withdrawals to any Nigerian bank', 'Card, transfer & USSD included', 'Keep 100% of your supporter list'] as item}
						<li><Check size={16} strokeWidth={2.5} /> {item}</li>
					{/each}
				</ul>
			</div>
		</div>
	</section>

	<!-- ============ FINAL CTA ============ -->
	<section class="final">
		<div class="final-inner" use:reveal>
			<h2>Your next post could pay for itself.</h2>
			<p>Set up your page in under a minute and share it today.</p>
			<a href="/signup" class="btn btn-cream btn-lg">
				Start my page <ArrowUpRight size={18} strokeWidth={2} />
			</a>
		</div>
	</section>

	<!-- ============ FOOTER ============ -->
	<footer class="footer">
		<div class="footer-inner">
			<div class="footer-brand">
				<span class="brand-mark" aria-hidden="true"></span>
				<span class="brand-name">Buy Me Zobo</span>
				<p>Support for Nigerian creators, in Naira.</p>
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
					<a href="#">About</a>
					<a href="#">Contact</a>
				</div>
				<div class="footer-col">
					<h4>Legal</h4>
					<a href="#">Terms</a>
					<a href="#">Privacy</a>
				</div>
			</div>
		</div>
		<div class="footer-bar">
			<span>© {new Date().getFullYear()} Buy Me Zobo. Made in Lagos.</span>
			<div class="footer-social">
				<a href="#" aria-label="Instagram"><span class="social-chip">IG</span></a>
				<a href="#" aria-label="X"><span class="social-chip">X</span></a>
				<a href="#" aria-label="TikTok"><span class="social-chip">TT</span></a>
			</div>
		</div>
	</footer>
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
	:global(html) { scroll-behavior: smooth; }
	:global(body) { margin: 0; }

	.page {
		font-family: 'Geist Variable', ui-sans-serif, system-ui, 'Segoe UI', Roboto, sans-serif;
		background: var(--cream);
		color: var(--ink);
		overflow-x: hidden;
	}
	* { box-sizing: border-box; }
	h1, h2, h3, h4 { margin: 0; font-weight: 700; letter-spacing: -0.02em; line-height: 1.1; }
	a { text-decoration: none; color: inherit; }

	.section-inner {
		max-width: 1120px;
		margin: 0 auto;
		padding: 0 1.5rem;
	}
	.section { padding: clamp(4rem, 9vw, 7rem) 0; }

	.eyebrow {
		display: inline-block;
		font-size: 0.78rem;
		font-weight: 600;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--zobo-700);
		margin-bottom: 0.9rem;
	}
	.eyebrow.gold { color: var(--gold); }
	.section-head { max-width: 640px; margin: 0 auto clamp(2.5rem, 5vw, 3.5rem); text-align: center; }
	.section-head h2 { font-size: clamp(1.7rem, 3.6vw, 2.5rem); }

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
		transition: transform 0.15s ease, background 0.15s ease, box-shadow 0.15s ease;
		white-space: nowrap;
	}
	.btn:hover { transform: translateY(-1px); }
	.btn-primary {
		background: var(--zobo-800);
		color: var(--cream);
		box-shadow: 0 8px 20px -8px rgba(92, 16, 41, 0.6);
	}
	.btn-primary:hover { background: var(--zobo-700); }
	.btn-ghost { background: transparent; border-color: rgba(92, 16, 41, 0.28); color: var(--zobo-900); }
	.btn-ghost:hover { background: rgba(92, 16, 41, 0.05); }
	.btn-cream { background: var(--cream); color: var(--zobo-950); }
	.btn-cream:hover { background: #fff; }
	.btn-lg { padding: 0.9rem 1.7rem; font-size: 1rem; }
	.btn-full { width: 100%; }

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
		display: flex;
		align-items: center;
		gap: 2rem;
	}
	.brand { display: flex; align-items: center; gap: 0.6rem; margin-right: auto; }
	.brand-mark {
		width: 28px;
		height: 28px;
		border-radius: 50% 50% 50% 5px;
		background: linear-gradient(150deg, var(--zobo-600), var(--zobo-900));
		flex-shrink: 0;
	}
	.brand-name { font-weight: 700; font-size: 1.05rem; color: var(--zobo-950); letter-spacing: -0.01em; }
	.nav-links { display: flex; gap: 1.6rem; font-size: 0.92rem; font-weight: 500; color: var(--zobo-900); }
	.nav-links a { position: relative; padding: 0.2rem 0; }
	.nav-links a::after {
		content: '';
		position: absolute;
		left: 0; bottom: -2px;
		width: 0; height: 2px;
		background: var(--zobo-600);
		transition: width 0.2s ease;
	}
	.nav-links a:hover::after { width: 100%; }
	.nav-actions { display: flex; align-items: center; gap: 1rem; }
	.nav-login { font-size: 0.92rem; font-weight: 600; color: var(--zobo-900); }
	.nav-login:hover { color: var(--zobo-600); }
	.nav-toggle {
		display: none;
		background: none; border: none;
		color: var(--zobo-950); cursor: pointer; padding: 0.25rem;
	}

	/* Mobile menu */
	.mobile-menu { display: none; }

	/* ============ HERO ============ */
	.hero {
		position: relative;
		background:
			radial-gradient(70% 60% at 82% 0%, rgba(151, 27, 61, 0.12), transparent 70%),
			radial-gradient(50% 50% at 0% 100%, rgba(201, 143, 58, 0.10), transparent 70%),
			var(--cream);
	}
	.hero-inner {
		max-width: 1200px;
		margin: 0 auto;
		padding: clamp(3rem, 7vw, 5.5rem) 1.5rem clamp(3.5rem, 8vw, 6rem);
		display: grid;
		grid-template-columns: 1.05fr 0.95fr;
		gap: clamp(2rem, 5vw, 4rem);
		align-items: center;
	}
	.pill {
		display: inline-block;
		background: rgba(92, 16, 41, 0.08);
		color: var(--zobo-800);
		font-size: 0.82rem;
		font-weight: 600;
		padding: 0.4rem 0.9rem;
		border-radius: 999px;
		margin-bottom: 1.2rem;
	}
	.hero h1 { font-size: clamp(2.3rem, 5.2vw, 3.6rem); color: var(--zobo-950); }
	.hero-sub {
		font-size: clamp(1rem, 1.4vw, 1.12rem);
		line-height: 1.6;
		color: #5a4038;
		max-width: 520px;
		margin: 1.35rem 0 2rem;
	}
	.hero-cta { display: flex; gap: 0.9rem; flex-wrap: wrap; }
	.hero-stats {
		display: flex;
		gap: clamp(1.25rem, 4vw, 2.5rem);
		margin-top: 2.5rem;
		flex-wrap: wrap;
	}
	.stat { display: flex; flex-direction: column; }
	.stat-num { font-size: clamp(1.4rem, 2.6vw, 1.8rem); font-weight: 700; color: var(--zobo-800); letter-spacing: -0.02em; }
	.stat-label { font-size: 0.8rem; color: #8a6a60; margin-top: 0.15rem; }

	/* Live feed card */
	.hero-visual { display: flex; justify-content: center; }
	.feed-card {
		width: 100%;
		max-width: 380px;
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
		width: 8px; height: 8px; border-radius: 50%;
		background: #d64d6f;
		box-shadow: 0 0 0 0 rgba(214, 77, 111, 0.5);
		animation: pulse 2s infinite;
	}
	@keyframes pulse {
		0% { box-shadow: 0 0 0 0 rgba(214, 77, 111, 0.5); }
		70% { box-shadow: 0 0 0 8px rgba(214, 77, 111, 0); }
		100% { box-shadow: 0 0 0 0 rgba(214, 77, 111, 0); }
	}
	.feed-list { padding: 0.5rem; }
	.feed-row {
		display: flex;
		gap: 0.75rem;
		align-items: flex-start;
		padding: 0.7rem 0.75rem;
		border-radius: 12px;
		animation: feedIn 0.5s cubic-bezier(0.22, 1, 0.36, 1) backwards;
		animation-delay: calc(var(--i) * 0.12s + 0.3s);
	}
	.feed-row:hover { background: rgba(92, 16, 41, 0.04); }
	@keyframes feedIn {
		from { opacity: 0; transform: translateY(10px); }
		to { opacity: 1; transform: none; }
	}
	.feed-avatar {
		width: 34px; height: 34px; border-radius: 50%;
		background: linear-gradient(150deg, var(--zobo-600), var(--zobo-900));
		color: var(--cream);
		display: flex; align-items: center; justify-content: center;
		font-weight: 600; font-size: 0.9rem; flex-shrink: 0;
	}
	.feed-body { min-width: 0; }
	.feed-line { margin: 0; font-size: 0.88rem; color: var(--ink); }
	.feed-amount { color: var(--zobo-700); }
	.feed-note { margin: 0.15rem 0 0; font-size: 0.8rem; color: #9a7a6f; }
	.feed-foot {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.85rem 1.25rem;
		border-top: 1px solid rgba(92, 16, 41, 0.08);
		font-size: 0.78rem;
		color: #9a7a6f;
	}
	.feed-total { font-weight: 700; color: var(--zobo-800); }

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
	.strip-item { color: var(--cream); font-weight: 600; font-size: 0.95rem; opacity: 0.9; }
	.strip-sep { color: var(--gold-light); }
	@keyframes scrollX {
		from { transform: translateX(0); }
		to { transform: translateX(-50%); }
	}

	/* ============ FEATURES ============ */
	.features { background: var(--cream); }
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
		transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
	}
	.feature-card:hover {
		transform: translateY(-4px);
		box-shadow: 0 18px 36px -20px rgba(43, 6, 15, 0.28);
		border-color: rgba(92, 16, 41, 0.2);
	}
	.feature-icon {
		display: inline-flex;
		width: 44px; height: 44px;
		align-items: center; justify-content: center;
		border-radius: 12px;
		background: rgba(151, 27, 61, 0.1);
		color: var(--zobo-700);
		margin-bottom: 1.1rem;
	}
	.feature-card h3 { font-size: 1.12rem; margin-bottom: 0.5rem; color: var(--zobo-950); }
	.feature-card p { margin: 0; font-size: 0.92rem; line-height: 1.55; color: #6b5049; }

	/* ============ HOW IT WORKS ============ */
	.how { background: var(--cream-2); }
	.steps {
		position: relative;
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 1.5rem;
	}
	.steps-line {
		position: absolute;
		top: 26px;
		left: 16%;
		right: 16%;
		height: 2px;
		background: repeating-linear-gradient(90deg, rgba(92,16,41,0.25) 0 8px, transparent 8px 16px);
		z-index: 0;
	}
	.step { position: relative; z-index: 1; text-align: center; padding: 0 0.5rem; }
	.step-n {
		display: inline-flex;
		width: 52px; height: 52px;
		align-items: center; justify-content: center;
		border-radius: 50%;
		background: var(--zobo-800);
		color: var(--cream);
		font-weight: 700; font-size: 1.05rem;
		margin-bottom: 1.1rem;
		box-shadow: 0 8px 18px -8px rgba(92, 16, 41, 0.6);
	}
	.step h3 { font-size: 1.2rem; margin-bottom: 0.5rem; color: var(--zobo-950); }
	.step p { margin: 0 auto; max-width: 260px; font-size: 0.92rem; line-height: 1.55; color: #6b5049; }

	/* ============ STORIES ============ */
	.stories { background: var(--cream); }
	.story-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.25rem; }
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
	.story-card :global(.story-quote) { color: var(--gold); }
	.story-card blockquote {
		margin: 0;
		font-size: 1rem;
		line-height: 1.55;
		color: var(--zobo-950);
		flex: 1;
	}
	.story-card figcaption { display: flex; align-items: center; gap: 0.75rem; }
	.story-avatar {
		width: 40px; height: 40px; border-radius: 50%;
		color: var(--cream);
		display: flex; align-items: center; justify-content: center;
		font-weight: 700; font-size: 0.85rem; flex-shrink: 0;
	}
	.story-card figcaption strong { display: block; font-size: 0.9rem; color: var(--ink); }
	.story-card figcaption em { font-style: normal; font-size: 0.8rem; color: #9a7a6f; }

	/* ============ PRICING ============ */
	.pricing { background: var(--cream-2); }
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
	.pricing-left .eyebrow { margin-bottom: 0.75rem; }
	.pricing-left h2 { color: var(--cream); font-size: clamp(1.6rem, 3vw, 2.2rem); margin-bottom: 1rem; }
	.pricing-left p { color: rgba(251, 243, 231, 0.78); line-height: 1.6; margin: 0 0 1.75rem; font-size: 0.98rem; }
	.pricing-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 0.85rem; }
	.pricing-list li {
		display: flex;
		align-items: center;
		gap: 0.7rem;
		color: var(--cream);
		font-size: 0.95rem;
		font-weight: 500;
	}
	.pricing-list :global(svg) { color: var(--gold-light); flex-shrink: 0; }

	/* ============ FINAL CTA ============ */
	.final { background: var(--zobo-950); }
	.final-inner {
		max-width: 720px;
		margin: 0 auto;
		padding: clamp(4rem, 9vw, 6.5rem) 1.5rem;
		text-align: center;
	}
	.final h2 { color: var(--cream); font-size: clamp(1.9rem, 4vw, 2.8rem); margin-bottom: 0.75rem; }
	.final p { color: rgba(251, 243, 231, 0.72); font-size: 1.05rem; margin: 0 0 2rem; }

	/* ============ FOOTER ============ */
	.footer { background: var(--zobo-950); color: rgba(251, 243, 231, 0.7); border-top: 1px solid rgba(251, 243, 231, 0.1); }
	.footer-inner {
		max-width: 1120px;
		margin: 0 auto;
		padding: 3.5rem 1.5rem 2.5rem;
		display: grid;
		grid-template-columns: 1.3fr 2fr;
		gap: 2.5rem;
	}
	.footer-brand { display: flex; flex-direction: column; gap: 0.5rem; }
	.footer-brand .brand-name { color: var(--cream); font-size: 1.05rem; }
	.footer-brand p { margin: 0.25rem 0 0; font-size: 0.88rem; max-width: 240px; line-height: 1.5; }
	.footer-cols { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; }
	.footer-col { display: flex; flex-direction: column; gap: 0.7rem; }
	.footer-col h4 { color: var(--cream); font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.08em; font-weight: 600; margin-bottom: 0.2rem; }
	.footer-col a { font-size: 0.9rem; }
	.footer-col a:hover { color: var(--cream); }
	.footer-bar {
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
	.footer-social { display: flex; gap: 0.6rem; }
	.social-chip {
		display: inline-flex;
		width: 32px; height: 32px;
		align-items: center; justify-content: center;
		border-radius: 8px;
		background: rgba(251, 243, 231, 0.1);
		color: var(--cream);
		font-size: 0.72rem;
		font-weight: 600;
		transition: background 0.15s ease;
	}
	.social-chip:hover { background: rgba(251, 243, 231, 0.2); }

	/* ============ RESPONSIVE ============ */
	@media (max-width: 900px) {
		.nav-links, .nav-actions { display: none; }
		.nav-toggle { display: flex; }

		.mobile-menu {
			display: flex;
			flex-direction: column;
			position: fixed;
			inset: 0;
			z-index: 60;
			background: var(--cream);
			padding: 0.85rem 1.5rem 2rem;
		}
		.mobile-menu-top { display: flex; align-items: center; justify-content: space-between; padding: 0.15rem 0 1.5rem; }
		.mobile-links {
			display: flex;
			flex-direction: column;
			flex: 1;
			justify-content: center;
			gap: 0.5rem;
		}
		.mobile-links a { font-size: 1.6rem; font-weight: 700; color: var(--zobo-950); padding: 0.5rem 0; letter-spacing: -0.02em; }
		.mobile-actions { display: flex; flex-direction: column; gap: 0.75rem; }

		.hero-inner { grid-template-columns: 1fr; }
		.hero-visual { order: -1; }
		.feature-grid { grid-template-columns: 1fr; }
		.steps { grid-template-columns: 1fr; gap: 2.5rem; }
		.steps-line { display: none; }
		.story-grid { grid-template-columns: 1fr; }
		.pricing-box { grid-template-columns: 1fr; }
		.footer-inner { grid-template-columns: 1fr; gap: 2rem; }
	}

	@media (max-width: 520px) {
		.footer-cols { grid-template-columns: 1fr 1fr; }
		.hero-stats { gap: 1.25rem 2rem; }
		.footer-bar { justify-content: flex-start; }
	}

	@media (prefers-reduced-motion: reduce) {
		:global(html) { scroll-behavior: auto; }
		.strip-track, .feed-row, .feed-dot { animation: none; }
		.feed-row { opacity: 1; }
	}
</style>