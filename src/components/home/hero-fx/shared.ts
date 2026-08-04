import type * as THREE from 'three';

export type ThreeNS = typeof import('three');
export type Mouse = { x: number; y: number };

export type SceneObj = {
	update: (t: number, m: Mouse) => void;
	setTheme: (dark: boolean) => void;
	resize?: (w: number, h: number) => void;
};

/**
 * An effect never imports `three` itself: the namespace is injected so the library
 * stays in the single dynamic chunk loaded by `HeroCanvas`.
 */
export type Builder = (
	THREE: ThreeNS,
	scene: THREE.Scene,
	camera: THREE.PerspectiveCamera,
	dark: boolean,
) => SceneObj;

/** The only two background tints: the light `--fg` and the dark one. */
const FG_LIGHT = 0x151514;
const FG_DARK = 0xf2f1ed;

/** For three.js materials. */
export const fg = (dark: boolean) => (dark ? FG_DARK : FG_LIGHT);

/** Same two tints, for the 2D canvas contexts. */
export const fgCss = (dark: boolean) => (dark ? '#f2f1ed' : '#151514');

export const MONO = "'JetBrains Mono Variable', ui-monospace, SFMono-Regular, Menlo, monospace";
