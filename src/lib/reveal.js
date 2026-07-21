// Subtle scroll-reveal action using IntersectionObserver.
// Usage: <div use:reveal>  or  <div use:reveal={{ delay: 120 }}>
// Respects prefers-reduced-motion by revealing immediately.

export function reveal(node, options = {}) {
	const { delay = 0, threshold = 0.15, once = true, y = 20 } = options;

	const reduce =
		typeof window !== 'undefined' &&
		window.matchMedia &&
		window.matchMedia('(prefers-reduced-motion: reduce)').matches;

	// Base (hidden) state
	node.style.willChange = 'opacity, transform';
	if (reduce) {
		node.style.opacity = '1';
		node.style.transform = 'none';
		return { destroy() {} };
	}

	node.style.opacity = '0';
	node.style.transform = `translateY(${y}px)`;
	node.style.transition = `opacity 0.6s cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms, transform 0.6s cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms`;

	let observer;

	function show() {
		node.style.opacity = '1';
		node.style.transform = 'none';
	}
	function hide() {
		node.style.opacity = '0';
		node.style.transform = `translateY(${y}px)`;
	}

	if (typeof IntersectionObserver === 'undefined') {
		show();
		return { destroy() {} };
	}

	observer = new IntersectionObserver(
		(entries) => {
			for (const entry of entries) {
				if (entry.isIntersecting) {
					show();
					if (once) observer.unobserve(node);
				} else if (!once) {
					hide();
				}
			}
		},
		{ threshold }
	);

	observer.observe(node);

	return {
		destroy() {
			if (observer) observer.disconnect();
		}
	};
}