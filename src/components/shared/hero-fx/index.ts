import type { Fx } from '@/lib/site-content';
import { buildDots } from './dots';
import { buildGrid } from './grid';
import { buildMatrix } from './matrix';
import type { Builder } from './shared';

/** One entry per `Fx`: adding an effect means adding a file and a line here. */
export const BUILDERS: Record<Fx, Builder> = {
	matrix: buildMatrix,
	dots: buildDots,
	grid: buildGrid,
};

/** Not part of the home chip picker (see DESIGN.md §5) — used standalone on the 404 page. */
export { buildStorm } from './storm';

export type { Builder, Mouse, SceneObj, ThreeNS } from './shared';
