import type { Fx } from '@/lib/site-content';
import { buildDots } from './dots';
import { buildGrid } from './grid';
import { buildMatrix } from './matrix';
import type { Builder } from './shared';
import { buildWall } from './wall';

/** One entry per `Fx`: adding an effect means adding a file and a line here. */
export const BUILDERS: Record<Fx, Builder> = {
	matrix: buildMatrix,
	wall: buildWall,
	dots: buildDots,
	grid: buildGrid,
};

export type { Builder, Mouse, SceneObj, ThreeNS } from './shared';
