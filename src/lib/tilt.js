// Subtle 3D tilt that follows the cursor across a card — desktop pointer
// only, and skipped under prefers-reduced-motion.
export function tilt(node, options = {}) {
	const { max = 6, scale = 1.015 } = options;

	const enabled =
		typeof window !== 'undefined' &&
		window.matchMedia &&
		window.matchMedia('(pointer: fine)').matches &&
		!window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	if (!enabled) return { destroy() {} };

	function onMove(e) {
		const rect = node.getBoundingClientRect();
		const px = (e.clientX - rect.left) / rect.width;
		const py = (e.clientY - rect.top) / rect.height;
		const rx = (0.5 - py) * 2 * max;
		const ry = (px - 0.5) * 2 * max;
		node.style.transition = 'transform 0.1s ease-out';
		node.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) scale(${scale})`;
	}
	function onLeave() {
		node.style.transition = 'transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)';
		node.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) scale(1)';
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
