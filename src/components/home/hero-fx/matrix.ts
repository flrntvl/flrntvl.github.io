import { type Builder, MONO, fgCss } from './shared';

/** Font size in pixels, and the pitch of the square lattice glyphs sit on. */
const CELL = 15;
const COLS = 120;
const ROWS = 72;
const TEXTURE = { width: COLS * CELL, height: ROWS * CELL };

const CHARS = '01<>{}[]();=$#/*+-_&|abcdefnpsuvxzABCDEFHKNPRSUVXZ'.split('');
const randomGlyph = () => CHARS[(Math.random() * CHARS.length) | 0];

/**
 * The static field behind the rain. Its opacity is derived from the cell coordinates
 * alone, so it stays put across redraws; the strides carry no meaning beyond
 * scattering the values.
 */
const BACKDROP_ALPHA_MIN = 0.1;
const backdropAlphaFor = (col: number, row: number) => BACKDROP_ALPHA_MIN + ((col * 7 + row * 13) % 9) / 150;

/** Rows per frame a column falls at, drawn once per column and again on respawn. */
const SPEED_MIN = 0.22;
const SPEED_RANGE = 0.5;
const randomSpeed = () => SPEED_MIN + Math.random() * SPEED_RANGE;

/** Columns start staggered above the top, up to this many screen heights up. */
const START_STAGGER = 1.6;
/** A column respawns once it has cleared the bottom by this margin, plus a jitter. */
const RESPAWN_MARGIN = 14;
const RESPAWN_JITTER = 40;
/** How far above the top it reappears. */
const RESPAWN_HEIGHT = 20;

/** Glyphs lit behind the leading one, and their opacities. */
const TRAIL = 12;
const HEAD_ALPHA = 0.95;
const TRAIL_ALPHA = 0.55;
/** The head swaps glyph on roughly a third of the frames it is drawn. */
const HEAD_CHURN = 0.7;

/** The leading glyph is the one accent in the effect; the trail uses `--fg`. */
const HEAD_COLOR = { dark: '#dce8ff', light: '#1b3f8f' };

/** The pointer speeds the rain up. `boost` eases towards it rather than snapping. */
const BOOST_SMOOTHING = 0.06;
const BOOST_STRENGTH = 2;

/** Seconds between redraws of the rain. */
const FRAME_INTERVAL = 0.07;

/** Pointer parallax on the plane, in world units, and how far back the camera sits. */
const POINTER_DRIFT = { x: 0.18, y: 0.14 };
const CAMERA_Z = 12;

const opacityFor = (dark: boolean) => (dark ? 0.42 : 0.34);

export const buildMatrix: Builder = (THREE, scene, camera, dark) => {
	const cells = new Array(COLS * ROWS).fill(0).map(randomGlyph);

	/** Two canvases: the backdrop is drawn once per theme, the rain composites over it. */
	const backdrop = document.createElement('canvas');
	backdrop.width = TEXTURE.width;
	backdrop.height = TEXTURE.height;
	const backdropCtx = backdrop.getContext('2d')!;

	const canvas = document.createElement('canvas');
	canvas.width = TEXTURE.width;
	canvas.height = TEXTURE.height;
	const ctx = canvas.getContext('2d')!;

	for (const c of [backdropCtx, ctx]) {
		c.font = `${CELL}px ${MONO}`;
		c.textBaseline = 'top';
	}

	let isDark = dark;
	const drawBackdrop = () => {
		backdropCtx.clearRect(0, 0, TEXTURE.width, TEXTURE.height);
		backdropCtx.fillStyle = fgCss(isDark);
		for (let col = 0; col < COLS; col++) {
			for (let row = 0; row < ROWS; row++) {
				backdropCtx.globalAlpha = backdropAlphaFor(col, row);
				backdropCtx.fillText(cells[col * ROWS + row], col * CELL, row * CELL);
			}
		}
		backdropCtx.globalAlpha = 1;
	};
	drawBackdrop();

	const texture = new THREE.CanvasTexture(canvas);
	texture.minFilter = THREE.LinearFilter;
	const material = new THREE.MeshBasicMaterial({
		map: texture,
		transparent: true,
		opacity: opacityFor(dark),
	});
	const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), material);
	scene.add(mesh);
	camera.position.z = CAMERA_Z;

	/** Row of the leading glyph per column, and how fast each one falls. */
	const heads = new Array(COLS).fill(0).map(() => -Math.random() * ROWS * START_STAGGER);
	const speeds = new Array(COLS).fill(0).map(randomSpeed);
	let boost = 0;
	let lastFrame = 0;

	const drawRain = () => {
		ctx.clearRect(0, 0, TEXTURE.width, TEXTURE.height);
		ctx.drawImage(backdrop, 0, 0);
		const headColor = isDark ? HEAD_COLOR.dark : HEAD_COLOR.light;
		const trailColor = fgCss(isDark);
		for (let col = 0; col < COLS; col++) {
			heads[col] += speeds[col] * (1 + boost * BOOST_STRENGTH);
			const headRow = Math.floor(heads[col]);
			for (let behind = 0; behind < TRAIL; behind++) {
				const row = headRow - behind;
				if (row < 0 || row >= ROWS) continue;
				const index = col * ROWS + row;
				const isHead = behind === 0;
				if (isHead && Math.random() > HEAD_CHURN) cells[index] = randomGlyph();
				ctx.globalAlpha = isHead ? HEAD_ALPHA : TRAIL_ALPHA * (1 - behind / TRAIL);
				ctx.fillStyle = isHead ? headColor : trailColor;
				ctx.fillText(cells[index], col * CELL, row * CELL);
			}
			if (headRow > ROWS + RESPAWN_MARGIN + Math.random() * RESPAWN_JITTER) {
				heads[col] = -Math.random() * RESPAWN_HEIGHT;
				speeds[col] = randomSpeed();
			}
		}
		ctx.globalAlpha = 1;
		texture.needsUpdate = true;
	};

	return {
		resize: (w, h) => {
			// Scale the plane to exactly fill the frustum at the camera's distance.
			const visibleHeight = 2 * Math.tan((camera.fov * Math.PI) / 360) * camera.position.z;
			mesh.scale.set(visibleHeight * (w / h), visibleHeight, 1);
		},
		update: (time, mouse) => {
			boost += (Math.hypot(mouse.x, mouse.y) - boost) * BOOST_SMOOTHING;
			if (time - lastFrame > FRAME_INTERVAL) {
				lastFrame = time;
				drawRain();
			}
			mesh.position.x = mouse.x * POINTER_DRIFT.x;
			mesh.position.y = mouse.y * POINTER_DRIFT.y;
		},
		setTheme: (nextDark) => {
			isDark = nextDark;
			material.opacity = opacityFor(nextDark);
			drawBackdrop();
			drawRain();
		},
	};
};
