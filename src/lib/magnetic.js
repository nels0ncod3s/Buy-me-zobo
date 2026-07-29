// Nudges an element toward the cursor on hover, with a springy release on
// exit — a subtle "magnetic button" touch. Disabled for touch input and
// when the user prefers reduced motion.
export function magnetic(node, options = {}) {
	const { strength = 0.35, max = 14 } = options;

	const enabled =
		typeof window !== 'undefined' &&
		window.matchMedia &&
		window.matchMedia('(pointer: fine)').matches &&
		!window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	if (!enabled) return { destroy() {} };

	function clamp(v) {
		return Math.max(-max, Math.min(max, v));
	}
	function onMove(e) {
		const rect = node.getBoundingClientRect();
		const dx = clamp((e.clientX - (rect.left + rect.width / 2)) * strength);
		const dy = clamp((e.clientY - (rect.top + rect.height / 2)) * strength);
		node.style.transition = 'transform 0.15s ease-out';
		node.style.transform = `translate(${dx}px, ${dy}px)`;
	}
	function onLeave() {
		node.style.transition = 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
		node.style.transform = 'translate(0, 0)';
	}

	node.addEventListener('mousemove', onMove);
	node.addEventListener('mouseleave', onLeave);

	return {
		destroy() {
			node.removeEventListener('mousemove', onMove);
			node.removeEventListener('mouseleave', onLeave);
		}
	};
}
