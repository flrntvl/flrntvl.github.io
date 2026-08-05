import { type Builder, MONO } from './shared';

/** The storm only mixes the two canonical background and foreground tokens. */
const BG_LIGHT = 0xfbfbfa;
const BG_DARK = 0x0e0e0f;
const FG_LIGHT = 0x151514;
const FG_DARK = 0xf2f1ed;

/** CSS-pixel pitch of the ASCII rain. Mobile glyphs stay dense without becoming illegible. */
const CELL = { desktop: { width: 13, height: 20 }, mobile: { width: 10, height: 16 } };
const MOBILE_BREAKPOINT = 640;
const MIN_GRID = { columns: 24, rows: 18 };

const RAIN = { speed: 1, wind: 0.35, density: 0.78 };
const POINTER_WIND = 0.18;

/** One generated channel roughly every 1.09 seconds gives 55 lightning bolts per minute. */
const STRIKES_PER_MINUTE = 55;
const STRIKE_PERIOD = 60 / STRIKES_PER_MINUTE;

/** Consecutive strikes visit all five bands in a shuffled order before repeating. */
const BOLT_BANDS = 5;

const ATLAS_SIZE = 64;
const ATLAS_SIDE = 8;
const BASE_GLYPHS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ@#$%&*+=-_<>[]{}()~^?!:;.,';
const GLYPHS = `${BASE_GLYPHS.slice(0, 61)}|/\\`;

const VERTEX_SHADER = /* glsl */ `
varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform vec2 uResolution;
uniform vec2 uGrid;
uniform float uTime;
uniform float uSpeed;
uniform float uWind;
uniform float uDensity;
uniform float uStrikePeriod;
uniform vec3 uBackground;
uniform vec3 uForeground;
uniform sampler2D uAtlas;

float hash11(float p) {
	p = fract(p * 0.1031);
	p *= p + 33.33;
	p *= p + p;
	return fract(p);
}

float hash21(vec2 p) {
	vec3 p3 = fract(vec3(p.xyx) * 0.1031);
	p3 += dot(p3, p3.yzx + 33.33);
	return fract((p3.x + p3.y) * p3.z);
}

/* A dry flash followed by the two short re-strikes of the reference storm. */
float strikeEnvelope(float elapsed) {
	if (elapsed < 0.0) return 0.0;
	float first = exp(-elapsed * 13.0);
	float second = 0.70 * exp(-max(elapsed - 0.09, 0.0) * 9.0) * step(0.09, elapsed);
	float third = 0.40 * exp(-max(elapsed - 0.28, 0.0) * 5.0) * step(0.28, elapsed);
	return min(1.5, first + second + third);
}

/*
 * Strike ids are spread across five horizontal bands. Multiplying by three changes
 * the visit order to 0, 3, 1, 4, 2, avoiding a visible left-to-right sweep while
 * guaranteeing that the whole width receives lightning every five strikes.
 */
float boltX(float down, float seed, float strikeId) {
	float band = mod(strikeId * 3.0, ${BOLT_BANDS.toFixed(1)});
	float anchor = (band + 0.16 + 0.68 * hash11(seed * 7.7 + 1.3)) / ${BOLT_BANDS.toFixed(1)};
	float jagged = 0.040 * sin(down * 8.0 + seed * 41.0)
		+ 0.020 * sin(down * 19.0 + seed * 13.0)
		+ 0.009 * sin(down * 43.0 + seed * 77.0);
	float drift = 0.10 * (hash11(seed * 3.1) - 0.5) * down;
	return clamp(anchor + jagged + drift, 0.015, 0.985);
}

float glyphAt(float index, vec2 cellUv) {
	vec2 atlasCell = vec2(mod(index, 8.0), floor(index / 8.0));
	return texture2D(uAtlas, (atlasCell + clamp(cellUv, 0.03, 0.97)) / 8.0).r;
}

void main() {
	/* A flat screen-space grid keeps every glyph on the same visual plane. */
	vec2 uv = vUv;

	/* Keep the strongest channel from the current and previous scheduling windows. */
	float flash = 0.0;
	float boltElapsed = 999.0;
	float boltSeed = 0.0;
	float boltId = 0.0;
	for (int i = 0; i < 2; i++) {
		float strikeId = floor(uTime / uStrikePeriod) - float(i);
		float randomOffset = hash11(strikeId * 1.731 + 3.11);
		float elapsed = uTime - (strikeId * uStrikePeriod + randomOffset * uStrikePeriod * 0.75);
		float strength = strikeEnvelope(elapsed);
		if (strength > flash) {
			flash = strength;
			boltElapsed = elapsed;
			boltSeed = randomOffset;
			boltId = strikeId;
		}
	}

	/* A tiny horizontal tear makes the flash feel electrical without moving content. */
	uv.x += flash * 0.0035
		* (hash21(vec2(floor(uv.y * 90.0), floor(uTime * 30.0))) - 0.5);

	/* ASCII rain grid, with y measured downwards. */
	vec2 gridPosition = vec2(uv.x, 1.0 - uv.y) * uGrid;
	vec2 cell = floor(gridPosition);
	vec2 cellUv = fract(gridPosition);

	float wind = uWind
		* (0.55 + 0.45 * sin(uTime * 0.21) + 0.25 * sin(uTime * 0.67 + 1.3));
	float streamId = cell.x + floor(wind * cell.y);

	float brightness = 0.0;
	float head = 0.0;
	for (int i = 0; i < 3; i++) {
		float stream = float(i);
		if (hash21(vec2(streamId * 0.71 + stream * 5.3, stream * 3.1)) > uDensity) continue;
		float seed = hash21(vec2(streamId * 0.137 + stream * 13.7, stream * 7.3 + 1.7));
		float speed = mix(5.0, 20.0, hash11(seed * 11.7 + 0.3)) * uSpeed;
		float length = mix(5.0, 24.0, hash11(seed * 23.1 + 0.7));
		float span = uGrid.y + length + 40.0 * hash11(seed * 3.7 + 0.1);
		float distance = mod(uTime * speed + seed * span * 3.0, span) - cell.y;
		if (distance < 0.0 || distance > length) continue;
		brightness = max(brightness, pow(1.0 - distance / length, 1.7));
		head = max(head, 1.0 - smoothstep(0.0, 1.5, distance));
	}

	/* Low, deterministic background noise and a one-row ASCII puddle. */
	brightness = max(brightness, 0.035 * hash21(cell + floor(uTime * 4.0)));
	float ground = step(uGrid.y - 1.5, cell.y);
	brightness = max(
		brightness,
		ground * (0.10 + 0.30 * hash21(vec2(cell.x, floor(uTime * 6.0))))
	);

	float rate = 6.0 + 14.0 * hash11(streamId * 1.13);
	float glyphFrame = floor(uTime * rate + hash11(streamId) * 10.0);
	float glyphIndex = floor(
		hash21(vec2(streamId * 1.31 + glyphFrame, cell.y * 2.17 + 0.5)) * 61.0
	);
	if (ground > 0.5) glyphIndex = 54.0;

	/* Continuous bolt plus ASCII | / \\ glyphs in every cell crossed by its channel. */
	float aspect = uResolution.x / max(uResolution.y, 1.0);
	float boltEnd = 0.55 + 0.40 * hash11(boltSeed * 5.5 + 2.2);
	float down = 1.0 - uv.y;
	float beforeEnd = 1.0 - smoothstep(boltEnd - 0.08, boltEnd, down);
	float boltLife = exp(-max(boltElapsed, 0.0) * 16.0) * step(0.0, boltElapsed);
	float boltDistance = abs(uv.x - boltX(down, boltSeed, boltId)) * aspect;
	float bolt = (exp(-boltDistance * 120.0) + 0.30 * exp(-boltDistance * 14.0))
		* beforeEnd * boltLife;

	float cellDown = (cell.y + 0.5) / uGrid.y;
	float cellX = (cell.x + 0.5) / uGrid.x;
	float onBolt = step(
		abs(cellX - boltX(cellDown, boltSeed, boltId)) * aspect,
		0.013
	) * step(cellDown, boltEnd) * step(0.0, boltElapsed) * step(boltElapsed, 0.22);
	if (onBolt > 0.5) {
		float slope = boltX(cellDown + 0.02, boltSeed, boltId)
			- boltX(cellDown - 0.02, boltSeed, boltId);
		glyphIndex = 61.0;
		if (slope > 0.004) glyphIndex = 63.0;
		if (slope < -0.004) glyphIndex = 62.0;
		brightness = 1.0;
		head = max(head, 0.85);
	}

	float glyph = glyphAt(glyphIndex, cellUv);
	float rainInk = glyph * (brightness * 0.15 + head * 0.16);
	float flashInk = flash * 0.10 * glyph * max(brightness, 0.25);
	float boltInk = bolt * 0.72;
	float ink = rainInk + flashInk + boltInk;

	/* The glow belongs to the bolt only; blank cells remain exactly the background token. */
	vec3 colour = mix(uBackground, uForeground, clamp(ink, 0.0, 0.88));
	gl_FragColor = vec4(colour, 1.0);
}
`;

export const buildStorm: Builder = (THREE, scene, _camera, dark) => {
	const atlasCanvas = document.createElement('canvas');
	atlasCanvas.width = atlasCanvas.height = ATLAS_SIZE * ATLAS_SIDE;
	const atlasContext = atlasCanvas.getContext('2d')!;
	atlasContext.fillStyle = '#000';
	atlasContext.fillRect(0, 0, atlasCanvas.width, atlasCanvas.height);
	atlasContext.fillStyle = '#fff';
	atlasContext.textAlign = 'center';
	atlasContext.textBaseline = 'middle';
	atlasContext.font = `400 40px ${MONO}`;
	for (let i = 0; i < ATLAS_SIDE * ATLAS_SIDE; i++) {
		const x = (i % ATLAS_SIDE) * ATLAS_SIZE + ATLAS_SIZE / 2;
		const y = Math.floor(i / ATLAS_SIDE) * ATLAS_SIZE + ATLAS_SIZE / 2;
		atlasContext.fillText(GLYPHS[i], x, y);
	}

	const atlas = new THREE.CanvasTexture(atlasCanvas);
	atlas.flipY = false;
	atlas.minFilter = atlas.magFilter = THREE.NearestFilter;
	atlas.wrapS = atlas.wrapT = THREE.ClampToEdgeWrapping;
	atlas.generateMipmaps = false;

	const uniforms = {
		uResolution: { value: new THREE.Vector2(1, 1) },
		uGrid: { value: new THREE.Vector2(80, 45) },
		uTime: { value: 0 },
		uSpeed: { value: RAIN.speed },
		uWind: { value: RAIN.wind },
		uDensity: { value: RAIN.density },
		uStrikePeriod: { value: STRIKE_PERIOD },
		uBackground: { value: new THREE.Color(dark ? BG_DARK : BG_LIGHT) },
		uForeground: { value: new THREE.Color(dark ? FG_DARK : FG_LIGHT) },
		uAtlas: { value: atlas },
	};

	const material = new THREE.ShaderMaterial({
		vertexShader: VERTEX_SHADER,
		fragmentShader: FRAGMENT_SHADER,
		uniforms,
		depthTest: false,
		depthWrite: false,
	});
	const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
	mesh.frustumCulled = false;
	scene.add(mesh);

	let origin: number | null = null;
	return {
		resize: (width, height) => {
			uniforms.uResolution.value.set(width, height);
			const cell = width < MOBILE_BREAKPOINT ? CELL.mobile : CELL.desktop;
			uniforms.uGrid.value.set(
				Math.max(MIN_GRID.columns, Math.round(width / cell.width)),
				Math.max(MIN_GRID.rows, Math.round(height / cell.height)),
			);
		},
		update: (time, mouse) => {
			origin ??= time;
			uniforms.uTime.value = time - origin;
			uniforms.uWind.value = RAIN.wind + mouse.x * POINTER_WIND;
		},
		setTheme: (nextDark) => {
			uniforms.uBackground.value.set(nextDark ? BG_DARK : BG_LIGHT);
			uniforms.uForeground.value.set(nextDark ? FG_DARK : FG_LIGHT);
		},
	};
};
