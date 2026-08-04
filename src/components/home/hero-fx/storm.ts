import type { Builder } from './shared';

/* Bolts fade toward the page background rather than using true alpha: a `LineSegments`
   mesh has no per-vertex opacity without a custom shader, so intensity is baked as a
   colour lerp between the two tokens instead. Same two shades as everywhere else. */
const BG_LIGHT = 0xfbfbfa;
const BG_DARK = 0x0e0e0f;
const FG_LIGHT = 0x151514;
const FG_DARK = 0xf2f1ed;

/** Half-extent of the sky the bolts fall through, in world units. */
const FIELD = { x: 19, y: 10.5 };

/** Buffer budget per bolt. A trunk plus its forks never exceeds this. */
const MAX_SEGMENTS = 30;
const TRUNK_STEPS = 15;
const MAX_BOLTS = 5;

/** How far the trunk wanders sideways as it descends. */
const TRUNK_JITTER = 2.2;

const FORKS = { min: 1, max: 3, steps: 4, jitter: 0.9, reach: 0.3 };

/** Peak lerp toward `--fg`. Bolts are brief, so a punchier peak still reads as decorative. */
const GLOW = { trunk: 0.78, fork: 0.46 };

/** Seconds between strikes, and how long one lasts. Both randomised per strike.
 *  The gap is shorter than the lifetime, so bolts routinely overlap. */
const GAP = { min: 0.25, max: 1.1 };
const LIFETIME = { min: 0.7, max: 1.4 };

/** The pointer steers where the next bolt lands, in world units. */
const POINTER_REACH = 15;
const POINTER_YAW = 0.05;
const POINTER_PITCH = 0.04;

/**
 * Real lightning flashes, dims, then re-strikes down the same channel a few times.
 * A plain decay reads as a fade-out; the two spikes are what make it a storm.
 */
const envelope = (u: number) => {
	if (u < 0 || u > 1) return 0;
	const decay = Math.exp(-2.1 * u) * 0.72;
	const restrike = Math.exp(-18 * Math.abs(u - 0.22)) * 0.8 + Math.exp(-22 * Math.abs(u - 0.5)) * 0.6;
	return Math.min(1, decay + restrike) * (1 - u * 0.15);
};

type Pt = { x: number; y: number };
type Seg = { a: Pt; b: Pt; glow: number };

/** A jagged path from `root` to `target`: straight-line interpolation nudged sideways,
 *  tapering to zero at both ends so forks meet the trunk cleanly. */
const jaggedPath = (root: Pt, target: Pt, steps: number, jitter: number): Pt[] => {
	const dx = target.x - root.x;
	const dy = target.y - root.y;
	const len = Math.hypot(dx, dy) || 1;
	const nx = -dy / len;
	const ny = dx / len;
	const pts: Pt[] = [root];
	for (let i = 1; i < steps; i++) {
		const t = i / steps;
		const taper = Math.sin(Math.PI * t);
		const off = (Math.random() - 0.5) * jitter * taper;
		pts.push({ x: root.x + dx * t + nx * off, y: root.y + dy * t + ny * off });
	}
	pts.push(target);
	return pts;
};

/** One strike: a trunk from the top of the sky down to `landing`, plus a few forks. */
const buildBolt = (landing: number): Seg[] => {
	const segs: Seg[] = [];
	const start = { x: landing + (Math.random() - 0.5) * FIELD.x * 0.5, y: FIELD.y * 1.05 };
	const trunk = jaggedPath(start, { x: landing, y: -FIELD.y }, TRUNK_STEPS, TRUNK_JITTER);
	for (let i = 0; i < trunk.length - 1; i++) segs.push({ a: trunk[i], b: trunk[i + 1], glow: GLOW.trunk });

	const forks = FORKS.min + Math.floor(Math.random() * (FORKS.max - FORKS.min + 1));
	for (let f = 0; f < forks; f++) {
		const origin = trunk[2 + Math.floor(Math.random() * (trunk.length - 4))];
		const side = Math.random() < 0.5 ? -1 : 1;
		const target = {
			x: origin.x + side * FIELD.x * FORKS.reach * (0.4 + Math.random() * 0.6),
			y: origin.y - FIELD.y * FORKS.reach * (0.4 + Math.random() * 0.6),
		};
		const path = jaggedPath(origin, target, FORKS.steps, FORKS.jitter);
		for (let i = 0; i < path.length - 1; i++) segs.push({ a: path[i], b: path[i + 1], glow: GLOW.fork });
	}
	return segs.slice(0, MAX_SEGMENTS);
};

export const buildStorm: Builder = (THREE, scene, _camera, dark) => {
	const vertexCount = MAX_BOLTS * MAX_SEGMENTS * 2;
	const positions = new Float32Array(vertexCount * 3);
	const colors = new Float32Array(vertexCount * 3);
	/** Per-vertex peak glow; zero for the slots a bolt is not currently using. */
	const glow = new Float32Array(vertexCount);

	const geometry = new THREE.BufferGeometry();
	geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
	geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

	const material = new THREE.LineBasicMaterial({ vertexColors: true });
	const lines = new THREE.LineSegments(geometry, material);
	scene.add(lines);

	const bg = new THREE.Color();
	const fg = new THREE.Color();
	const mix = new THREE.Color();
	const setPalette = (next: boolean) => {
		bg.set(next ? BG_DARK : BG_LIGHT);
		fg.set(next ? FG_DARK : FG_LIGHT);
	};
	setPalette(dark);

	/** Each bolt owns a fixed slice of the buffer, so a strike only rewrites its own. */
	const bolts = Array.from({ length: MAX_BOLTS }, () => ({ born: -Infinity, life: 1 }));

	const strike = (slot: number, now: number, landing: number) => {
		const segs = buildBolt(landing);
		const base = slot * MAX_SEGMENTS;
		for (let i = 0; i < MAX_SEGMENTS; i++) {
			const v = (base + i) * 2;
			const seg = segs[i];
			if (seg) {
				positions[v * 3] = seg.a.x;
				positions[v * 3 + 1] = seg.a.y;
				positions[v * 3 + 2] = 0;
				positions[(v + 1) * 3] = seg.b.x;
				positions[(v + 1) * 3 + 1] = seg.b.y;
				positions[(v + 1) * 3 + 2] = 0;
				glow[v] = seg.glow;
				glow[v + 1] = seg.glow;
			} else {
				// Unused slot: collapsed to a point and left unlit, so it draws nothing.
				glow[v] = 0;
				glow[v + 1] = 0;
			}
		}
		bolts[slot] = { born: now, life: LIFETIME.min + Math.random() * (LIFETIME.max - LIFETIME.min) };
		geometry.attributes.position.needsUpdate = true;
	};

	/** `time` is a page-lifetime clock, so everything is measured from the first frame. */
	let origin: number | null = null;
	let nextStrike = 0;
	let slot = 0;

	return {
		update: (time, mouse) => {
			origin ??= time;
			const now = time - origin;
			const landing = mouse.x * POINTER_REACH;

			if (now >= nextStrike) {
				strike(slot, now, landing + (Math.random() - 0.5) * FIELD.x * 0.6);
				slot = (slot + 1) % MAX_BOLTS;
				nextStrike = now + GAP.min + Math.random() * (GAP.max - GAP.min);
			}

			const live = geometry.attributes.color.array as Float32Array;
			for (let b = 0; b < MAX_BOLTS; b++) {
				const intensity = envelope((now - bolts[b].born) / bolts[b].life);
				const from = b * MAX_SEGMENTS * 2;
				for (let v = from; v < from + MAX_SEGMENTS * 2; v++) {
					mix.copy(bg).lerp(fg, glow[v] * intensity);
					live[v * 3] = mix.r;
					live[v * 3 + 1] = mix.g;
					live[v * 3 + 2] = mix.b;
				}
			}
			geometry.attributes.color.needsUpdate = true;

			lines.rotation.y = mouse.x * POINTER_YAW;
			lines.rotation.x = -mouse.y * POINTER_PITCH;
		},
		setTheme: setPalette,
	};
};
