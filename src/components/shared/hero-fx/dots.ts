import { type Builder, fg } from './shared';

/** Points in the cloud: enough to read as a field, few enough to stay one buffer upload. */
const COUNT = 2600;

/** Full extent of the box the points fill, in world units: wide, half as tall, shallower still. */
const FIELD = { width: 34, height: 20, depth: 18 };

const POINT_SIZE = 0.055;

/** Constant yaw in radians per second, plus what the pointer adds at full deflection. */
const DRIFT_SPEED = 0.045;
const POINTER_YAW = 0.32;

/** The pitch sways on its own; the pointer tilts on top of that. */
const SWAY_SPEED = 0.14;
const SWAY_AMPLITUDE = 0.06;
const POINTER_PITCH = 0.18;

const opacityFor = (dark: boolean) => (dark ? 0.75 : 0.55);

/** A uniform coordinate centred on the origin, spanning `extent` units. */
const randomCoord = (extent: number) => (Math.random() - 0.5) * extent;

export const buildDots: Builder = (THREE, scene, _camera, dark) => {
	const positions = new Float32Array(COUNT * 3);
	for (let i = 0; i < COUNT; i++) {
		positions[i * 3] = randomCoord(FIELD.width);
		positions[i * 3 + 1] = randomCoord(FIELD.height);
		positions[i * 3 + 2] = randomCoord(FIELD.depth);
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

	return {
		update: (time, mouse) => {
			points.rotation.y = time * DRIFT_SPEED + mouse.x * POINTER_YAW;
			points.rotation.x = Math.sin(time * SWAY_SPEED) * SWAY_AMPLITUDE + mouse.y * POINTER_PITCH;
		},
		setTheme: (nextDark) => {
			material.color.set(fg(nextDark));
			material.opacity = opacityFor(nextDark);
		},
	};
};
