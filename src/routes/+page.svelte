<script>
	import { goto } from '$app/navigation';
	import {
		ArrowUpRight,
		ArrowRight,
		Menu,
		X,
		Heart,
		Check,
		ShieldCheck,
		Link2,
		Banknote,
		Sparkles
	} from '@lucide/svelte';
	import Brand from '$lib/components/Brand.svelte';
	import ZoboCup from '$lib/components/ZoboCup.svelte';
	import ActionButton from '$lib/components/ActionButton.svelte';
	import { naira, validateUsername, notify } from '$lib/ui.js';
	let menuOpen = $state(false);
	let handle = $state('');
	let claiming = $state(false);
	let amount = $state(1000);
	let demoSent = $state(false);
	const steps = [
		{
			title: 'Make it yours.',
			text: 'Choose your name, tell your story, and give your audience a place to support you.'
		},
		{
			title: 'Put it out there.',
			text: 'One link for your bio, your latest video, your group chat. Wherever your people are.'
		},
		{
			title: 'Feel the love.',
			text: 'A little zobo. A lovely message. More reasons to keep making the things you love.'
		}
	];
	async function claim(e) {
		e.preventDefault();
		claiming = true;
		try {
			const username = handle.trim() ? validateUsername(handle) : '';
			await goto(username ? `/signup?u=${encodeURIComponent(username)}` : '/signup');
		} catch (error) {
			notify(error.message || 'Could not open signup. Please try again.', 'error');
		} finally {
			claiming = false;
		}
	}
</script>

<svelte:head>
	<title>Buy Me Zobo — A little love for what you make.</title>
	<meta
		name="description"
		content="A home for your supporters. Create a page, share your work, and let your audience send a little zobo. Made for Nigerian creators."
	/>
	<meta property="og:title" content="Buy Me Zobo — A little love for what you make." />
	<meta
		property="og:description"
		content="Your creativity deserves a little zobo. Meet a warmer way to support Nigerian creators."
	/>
</svelte:head>
<svelte:window
	onkeydown={(e) => {
		if (e.key === 'Escape') menuOpen = false;
	}}
/>
<div class="landing">
	<header class="site-header wrap">
		<Brand />
		<nav aria-label="Main navigation" class:open={menuOpen}>
			<a href="#why" onclick={() => (menuOpen = false)}>Why Zobo</a><a
				href="#how"
				onclick={() => (menuOpen = false)}>How it works</a
			><a href="#pricing" onclick={() => (menuOpen = false)}>Pricing</a>
			<a href="/login" class="mobile-login">Log in</a>
		</nav>
		<div class="header-actions">
			<a href="/login" class="login-link">Log in</a><a class="button small" href="/signup"
				>Start your page <ArrowUpRight size={16} /></a
			><button
				class="menu-toggle"
				aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}
				aria-expanded={menuOpen}
				onclick={() => (menuOpen = !menuOpen)}
				>{#if menuOpen}<X />{:else}<Menu />{/if}</button
			>
		</div>
	</header>
	<main>
		<section class="hero wrap">
			<div class="hero-copy">
				<span class="eyebrow"
					><span class="tiny-flower">✳</span> FOR THE THINGS YOU LOVE MAKING</span
				>
				<h1>
					Your creativity.<br />Their kindness.<br /><span class="serif italic">A little zobo.</span
					>
				</h1>
				<p>
					For the late-night edits. The stories worth telling. The work you put your heart into.
					Give your people a simple way to say <em>“keep going.”</em>
				</p>
				<form class="claim-form" onsubmit={claim}>
					<label class="claim-field"
						><span>your page /</span><input
							aria-label="Your creator username"
							placeholder="yourname"
							bind:value={handle}
							maxlength="24"
							autocapitalize="none"
							spellcheck="false"
						/></label
					><button class="button" disabled={claiming} aria-busy={claiming}
						>{#if claiming}<span class="spinner"></span>Opening…{:else}Start your page <ArrowUpRight
								size={18}
							/>{/if}</button
					>
				</form>
				<a href="/example" class="example-link"
					>View an example creator page <ArrowRight size={17} /></a
				>
				<div class="hero-footnote">
					<Check size={15} /> Free to create <span>·</span> No account needed to support
				</div>
			</div>
			<div class="hero-art">
				<div class="art-orbit orbit-one"></div>
				<div class="art-orbit orbit-two"></div>
				<span class="art-note serif italic">a little goes a long way</span>
				<span class="art-star star-one">✳</span><span class="art-star star-two">✦</span>
				<ZoboCup class="hero-cup" decorative={false} />
				<span class="cup-caption">BREWED WITH KINDNESS. SHARED WITH LOVE.</span>
				<div class="gift-note">
					<span class="avatar peach">T</span>
					<div>
						<strong>Tomi sent 3 zobos <Heart size={12} /></strong><span
							>“Your videos make my Sundays.”</span
						>
					</div>
					<span class="note-check"><Check size={15} /></span>
				</div>
				<div class="creator-note">
					<span class="creator-mini-art">a.</span>
					<div><span>A HOME FOR YOUR PEOPLE</span><strong>Amara's creative corner</strong></div>
					<ArrowUpRight size={20} />
				</div>
				<span class="art-demo-label">A LITTLE PREVIEW OF THE LOVE</span>
			</div>
		</section>
		<div class="creator-strip">
			<div class="wrap">
				<span>MADE FOR PEOPLE WHO MAKE</span><strong>Stories</strong><span class="strip-flower"
					>✳</span
				><strong>Music</strong><span class="strip-flower">✳</span><strong>Art</strong><span
					class="strip-flower">✳</span
				><strong>Good things.</strong>
			</div>
		</div>
		<section id="why" class="section wrap why-section">
			<div class="section-intro">
				<span class="eyebrow">A DIFFERENT KIND OF SUPPORT</span>
				<h2>Big dreams.<br /><span class="serif italic">Small acts of love.</span></h2>
				<p>
					You don't need a million followers to make something that matters. Just a few people who
					want to see you keep going.
				</p>
			</div>
			<div class="benefits">
				<article>
					<span class="benefit-number">01</span>
					<div>
						<h3>Your people. Your page.</h3>
						<p>A personal home for your work, your story, and the people cheering you on.</p>
					</div>
					<Link2 size={25} />
				</article>
				<article>
					<span class="benefit-number">02</span>
					<div>
						<h3>Support that speaks your language.</h3>
						<p>
							Naira amounts and familiar payment methods are the plan. Try the support experience in
							our demo.
						</p>
					</div>
					<Banknote size={25} />
				</article>
				<article>
					<span class="benefit-number">03</span>
					<div>
						<h3>A message with every little gift.</h3>
						<p>
							Because “this helped me” can mean just as much as the money. Keep the kind words
							close.
						</p>
					</div>
					<Heart size={25} />
				</article>
			</div>
		</section>
		<section class="try-section wrap">
			<div class="try-copy">
				<span class="eyebrow">TRY A LITTLE KINDNESS</span>
				<h2>This is what<br /><span class="serif italic">“keep going”</span><br />looks like.</h2>
				<p>Pick a zobo and see how a little support feels. This preview never charges you.</p>
				<a href="/example" class="text-link">Meet an example creator <ArrowUpRight size={18} /></a>
			</div>
			<div class="mini-support panel">
				<div class="mini-profile">
					<span class="amara-avatar">a.</span>
					<div>
						<span class="eyebrow">WRITER & EVERYDAY STORYTELLER</span>
						<h3>Buy Amara a zobo</h3>
						<p>A little fuel for the next good story.</p>
					</div>
					<ZoboCup class="mini-cup" />
				</div>
				<div class="amount-options">
					{#each [500, 1000, 2000, 5000] as value}<button
							class:chosen={amount === value}
							aria-pressed={amount === value}
							onclick={() => {
								amount = value;
								demoSent = false;
							}}>{naira(value)}</button
						>{/each}
				</div>
				<ActionButton
					class="button full"
					busyLabel="Sending your kindness…"
					action={async () => {
						await new Promise((resolve) => setTimeout(resolve, 350));
						demoSent = true;
					}}
					success="Test zobo sent. No payment was taken."
					>{#if demoSent}<Check size={18} /> Kindness delivered{:else}Send a test zobo <Heart
							size={17}
						/>{/if}</ActionButton
				><span class="microcopy"
					><ShieldCheck size={13} /> Just a preview. No money changes hands.</span
				>
			</div>
		</section>
		<section id="how" class="section how-section">
			<div class="wrap">
				<div class="how-heading">
					<span class="eyebrow">FROM YOUR WORK TO THEIR HEART</span>
					<h2>Make. Share.<span class="serif italic"> Sip.</span></h2>
					<p>Three simple steps. No complicated setup.</p>
				</div>
				<div class="steps">
					{#each steps as step, i}<article>
							<span class="step-number">0{i + 1}<span>✳</span></span>
							<h3>{step.title}</h3>
							<p>{step.text}</p>
						</article>{/each}
				</div>
			</div>
		</section>
		<section id="pricing" class="section wrap">
			<div class="pricing-card">
				<div>
					<span class="eyebrow">A SMALL CUT. NO BIG SURPRISES.</span>
					<h2>Free to start.<br /><span class="serif italic">Room to grow.</span></h2>
					<p>
						Create your corner of the internet for free. Our proposed service fee is shown
						separately, so supporters know exactly what they're sending.
					</p>
					<a href="/signup" class="button cream">Start your page <ArrowUpRight size={18} /></a>
				</div>
				<div class="price-detail">
					<span class="price-number">5<span>%</span></span><span class="price-label"
						>PLATFORM FEE</span
					>
					<div class="price-example">
						<div><span>A little support</span><strong>₦1,000</strong></div>
						<div><span>Service fee</span><strong>₦50</strong></div>
						<div class="price-total"><span>Supporter total</span><strong>₦1,000</strong></div>
					</div>
					<small
						>5% is deducted from support, plus payment processing fees. No monthly subscription.</small
					>
				</div>
			</div>
		</section>
		<section id="faq" class="section wrap faq-section">
			<div>
				<span class="eyebrow">GOOD QUESTIONS</span>
				<h2>A few things<br /><span class="serif italic">before you sip.</span></h2>
				<ZoboCup class="faq-cup" />
			</div>
			<div class="faq-list">
				{#each [{ q: 'Who is Buy Me Zobo for?', a: 'Anyone making something people value: writers, musicians, developers, teachers, artists, and creators of all kinds. Your page gives your audience a place to show support.' }, { q: 'Do supporters need an account?', a: 'No. Supporters can pay through secure Paystack checkout without creating an account.' }, { q: 'What does it cost?', a: 'Creating a page is free. A 5% platform fee plus payment processing fees is deducted from each gift. There is no monthly subscription.' }, { q: 'How do I receive my money?', a: 'Connect your Nigerian bank account in Payouts, then request a payout from your available balance. You can track its status in your dashboard.' }, { q: 'Can I support someone anonymously?', a: 'Yes. You can hide your name from the public page and choose to keep your message private. Payment details are never shown publicly.' }, { q: 'Is zobo a physical drink?', a: 'Here, a zobo is a way to say thank you with a monetary gift. No drink is shipped or delivered.' }, { q: 'Where can I share my page?', a: 'Add your personal link to your social bio, videos, newsletter, or website. Anyone with your link can visit your page.' }, { q: 'Can I pause my page?', a: 'Yes. Pause support in Settings whenever you need a break. Your profile and gift history stay saved.' }, { q: 'Can I customise my page?', a: 'Yes. Update your name, photo, cover, bio, links, and zobo price in Settings. Your profile is saved to your account.' }] as faq}<details
					>
						<summary>{faq.q}<span>+</span></summary>
						<p>{faq.a}</p>
					</details>{/each}
			</div>
		</section>
		<section class="final-cta">
			<div class="wrap">
				<span class="eyebrow">KEEP MAKING YOUR THING</span>
				<h2>Someone out there<br /><span class="serif italic">is rooting for you.</span></h2>
				<div class="cta-pair">
					<a href="/signup" class="button">Make a home for them <ArrowUpRight size={18} /></a><a
						href="/example"
						class="example-link">View an example creator page <ArrowRight size={17} /></a
					>
				</div>
				<span class="final-flower">✳</span>
			</div>
		</section>
	</main>
	<footer class="site-footer wrap">
		<Brand />
		<p>A little love for what you make.<br />Made with heart, in Nigeria.</p>
		<div>
			<a href="#why">Why Zobo</a><a href="#faq">Questions</a><a href="/example">Try the demo</a>
		</div>
		<span>© {new Date().getFullYear()} Buy Me Zobo</span>
	</footer>
</div>
