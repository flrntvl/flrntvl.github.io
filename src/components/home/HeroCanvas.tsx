import { useEffect, useRef } from 'react';
import type * as THREE from 'three';
import type { Builder, Mouse, ThreeNS } from '@/components/home/hero-fx';

/**
 * Decorative hero background. Three rules: low opacity, no legible text competing
 * with the terminal, and a silent fallback when WebGL is missing.
 */
export default function HeroCanvas({ builder, dark }: { builder: Builder; dark: boolean }) {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const apiRef = useRef<{ rebuild: (builder: Builder) => void; setTheme: (dark: boolean) => void } | null>(
		null,
	);
	// Props mirror kept current after every render: `import('three')` resolves after
	// the theme has been applied, so the scene must be built from the value at that
	// moment rather than the one captured on mount. Written from an effect because a
	// ref must not be touched during render; the initial value covers the first pass.
	const latest = useRef({ builder, dark });
	useEffect(() => {
		latest.current = { builder, dark };
	});

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		let disposed = false;
		let raf = 0;
		let cleanup = () => {};

		void (async () => {
			let THREE: ThreeNS;
			try {
				THREE = await import('three');
			} catch {
				return; // three missing or WebGL unavailable: the background stays empty.
			}
			if (disposed) return;

			let renderer: THREE.WebGLRenderer;
			try {
				renderer = new THREE.WebGLRenderer({
					canvas,
					antialias: true,
					alpha: true,
					powerPreference: 'low-power',
				});
			} catch {
				return;
			}
			renderer.setPixelRatio(1);

			const scene = new THREE.Scene();
			const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 200);
			camera.position.z = 12;

			const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
			const host = canvas.parentElement;
			const onPointer = (e: PointerEvent) => {
				const r = canvas.getBoundingClientRect();
				mouse.tx = ((e.clientX - r.left) / r.width) * 2 - 1;
				mouse.ty = -(((e.clientY - r.top) / r.height) * 2 - 1);
			};
			host?.addEventListener('pointermove', onPointer);

			let obj = latest.current.builder(THREE, scene, camera, latest.current.dark);

			const resize = () => {
				const r = canvas.getBoundingClientRect();
				if (!r.width) return;
				renderer.setSize(r.width, r.height, false);
				camera.aspect = r.width / r.height;
				camera.updateProjectionMatrix();
				obj.resize?.(r.width, r.height);
			};
			resize();
			const ro = new ResizeObserver(resize);
			ro.observe(canvas);

			const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
			const draw = (t: number, m: Mouse) => {
				obj.update(t, m);
				renderer.render(scene, camera);
			};

			apiRef.current = {
				rebuild: (next) => {
					scene.clear();
					camera.fov = 55;
					camera.position.set(0, 0, 12);
					camera.rotation.set(0, 0, 0);
					camera.updateProjectionMatrix();
					obj = next(THREE, scene, camera, latest.current.dark);
					resize();
					if (reduced) draw(0, { x: 0, y: 0 });
				},
				setTheme: (d) => {
					obj.setTheme(d);
					if (reduced) draw(0, { x: 0, y: 0 });
				},
			};

			if (reduced) {
				// Background effects frozen: a single frame, no loop.
				draw(0, { x: 0, y: 0 });
			} else {
				let prev = 0;
				const tick = (now: number) => {
					raf = requestAnimationFrame(tick);
					if (now - prev < 33) return; // ~30 fps is plenty for a background.
					prev = now;
					const r = canvas.getBoundingClientRect();
					if (!r.width || r.bottom < -300 || r.top > window.innerHeight + 300) return;
					mouse.x += (mouse.tx - mouse.x) * 0.12;
					mouse.y += (mouse.ty - mouse.y) * 0.12;
					draw(now / 1000, mouse);
				};
				raf = requestAnimationFrame(tick);
			}

			cleanup = () => {
				host?.removeEventListener('pointermove', onPointer);
				ro.disconnect();
				renderer.dispose();
				renderer.forceContextLoss();
				apiRef.current = null;
			};
		})();

		return () => {
			disposed = true;
			cancelAnimationFrame(raf);
			cleanup();
		};
	}, []);

	useEffect(() => {
		apiRef.current?.rebuild(builder);
	}, [builder]);

	useEffect(() => {
		apiRef.current?.setTheme(dark);
	}, [dark]);

	return <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 block h-full w-full" />;
}
