import { type Builder, fg } from './shared';

/** Points per axis. The lattice stays flat; only its z is animated. */
const COLS = 74;
const ROWS = 40;

/** Full extent of the lattice in world units. */
const PLANE = { width: 40, height: 22 };

const POINT_SIZE = 0.06;

/** Where the pointer lands on the plane at full deflection, in world units. */
const POINTER_REACH = { x: 18, y: 10 };

/**
 * The ripple spreading from the pointer: radians per world unit, radians per second,
 * and its peak height. It decays with distance, so only the neighbourhood of the
 * pointer lifts off the plane.
 */
const RIPPLE_FREQUENCY = 0.35;
const RIPPLE_SPEED = 1.6;
const RIPPLE_HEIGHT = 1.5;
const RIPPLE_FALLOFF = 0.09;

/** How far the pointer tilts the whole lattice, in radians. */
const POINTER_YAW = 0.08;
const POINTER_PITCH = 0.06;

const opacityFor = (dark: boolean) => (dark ? 0.5 : 0.4);

export const buildGrid: Builder = (THREE, scene, _camera, dark) => {
	const positions = new Float32Array(COLS * ROWS * 3);
	let cursor = 0;
	for (let col = 0; col < COLS; col++) {
		for (let row = 0; row < ROWS; row++) {
			positions[cursor++] = (col / (COLS - 1) - 0.5) * PLANE.width;
			positions[cursor++] = (row / (ROWS - 1) - 0.5) * PLANE.height;
			positions[cursor++] = 0;
		}
	}

	const geometry = new THREE.BufferGeometry();
	geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

	const material = new THREE.PointsMaterial({
		size: POINT_SIZE,
		transparent: true,
		opacity: opacityFor(dark),
		color: fg(dark),
	});

	const points = new THREE.Points(geometry, material);
	scene.add(points);

	/** The flat lattice, so every frame displaces from rest rather than from itself. */
	const rest = positions.slice();

	return {
		update: (time, mouse) => {
			const live = geometry.attributes.position.array as Float32Array;
			for (let i = 0; i < live.length; i += 3) {
				const x = rest[i] - mouse.x * POINTER_REACH.x;
				const y = rest[i + 1] - mouse.y * POINTER_REACH.y;
				const distance = Math.hypot(x, y);
				live[i + 2] =
					Math.sin(distance * RIPPLE_FREQUENCY - time * RIPPLE_SPEED) *
					RIPPLE_HEIGHT *
					Math.exp(-distance * RIPPLE_FALLOFF);
			}
			geometry.attributes.position.needsUpdate = true;
			points.rotation.y = mouse.x * POINTER_YAW;
			points.rotation.x = -mouse.y * POINTER_PITCH;
		},
		setTheme: (nextDark) => {
			material.color.set(fg(nextDark));
			material.opacity = opacityFor(nextDark);
		},
	};
};
