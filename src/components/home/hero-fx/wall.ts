import { type Builder, MONO, fgCss } from './shared';

/** The offscreen canvas the texture is sampled from, in pixels. */
const TEXTURE = { width: 512, height: 512 };

/** Glyph cells filling that canvas. */
const COLS = 42;
const ROWS = 34;
const CELL = { width: TEXTURE.width / COLS, height: TEXTURE.height / ROWS };

const FONT_SIZE = 13;
/** Baseline offset from the top of a cell, so glyphs sit inside it rather than astride. */
const TEXT_BASELINE = 12;

const GLYPHS = '01{}();<>=$#/*_ëfnif php fn use new return await async const'.split('');
const randomGlyph = () => GLYPHS[(Math.random() * GLYPHS.length) | 0];

/**
 * A per-cell opacity derived from the index alone, so a redraw never makes the wall
 * flicker. The stride and divisor carry no meaning beyond scattering the values.
 */
const ALPHA_MIN = 0.25;
const alphaFor = (index: number) => ALPHA_MIN + ((index * 37) % 100) / 220;

/** How many times the texture tiles across the plane. */
const TEXTURE_REPEAT = { x: 7, y: 4.4 };

/** The plane the texture is mapped onto, and how far back the camera sits, in world units. */
const PLANE = { width: 48, height: 30 };
const CAMERA_Z = 14;

/** Texture rows per second of the downward scroll. */
const SCROLL_SPEED = 0.025;
/** Pointer parallax: the texture slides, the plane itself lifts. */
const POINTER_DRIFT = 0.02;
const POINTER_LIFT = 0.4;

/** Seconds between redraws, and how many cells swap glyph on each one. */
const REDRAW_INTERVAL = 0.16;
const GLYPHS_PER_REDRAW = 14;

const opacityFor = (dark: boolean) => (dark ? 0.13 : 0.1);

export const buildWall: Builder = (THREE, scene, camera, dark) => {
	const canvas = document.createElement('canvas');
	canvas.width = TEXTURE.width;
	canvas.height = TEXTURE.height;
	const ctx = canvas.getContext('2d')!;

	const cells: string[] = [];
	for (let i = 0; i < COLS * ROWS; i++) cells.push(randomGlyph());

	let isDark = dark;
	const draw = () => {
		ctx.clearRect(0, 0, TEXTURE.width, TEXTURE.height);
		ctx.fillStyle = fgCss(isDark);
		ctx.font = `${FONT_SIZE}px ${MONO}`;
		for (let col = 0; col < COLS; col++) {
			for (let row = 0; row < ROWS; row++) {
				const index = col * ROWS + row;
				ctx.globalAlpha = alphaFor(index);
				ctx.fillText(cells[index], col * CELL.width, row * CELL.height + TEXT_BASELINE);
			}
		}
		ctx.globalAlpha = 1;
	};
	draw();

	const texture = new THREE.CanvasTexture(canvas);
	texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
	texture.repeat.set(TEXTURE_REPEAT.x, TEXTURE_REPEAT.y);

	const material = new THREE.MeshBasicMaterial({
		map: texture,
		transparent: true,
		opacity: opacityFor(dark),
	});
	const mesh = new THREE.Mesh(new THREE.PlaneGeometry(PLANE.width, PLANE.height), material);
	scene.add(mesh);
	camera.position.z = CAMERA_Z;

	let lastRedraw = 0;
	return {
		update: (time, mouse) => {
			texture.offset.y = (time * SCROLL_SPEED) % 1;
			texture.offset.x = mouse.x * POINTER_DRIFT;
			mesh.position.y = mouse.y * POINTER_LIFT;
			if (time - lastRedraw > REDRAW_INTERVAL) {
				lastRedraw = time;
				for (let i = 0; i < GLYPHS_PER_REDRAW; i++) {
					cells[(Math.random() * cells.length) | 0] = randomGlyph();
				}
				draw();
				texture.needsUpdate = true;
			}
		},
		setTheme: (nextDark) => {
			isDark = nextDark;
			material.opacity = opacityFor(nextDark);
			draw();
			texture.needsUpdate = true;
		},
	};
};
