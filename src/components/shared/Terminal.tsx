import { useEffect, useRef, useState } from 'react';
import type { ShellLine } from '@/lib/site-content';

type Rendered = { cmd: string; out: string | null };

/** ~68–120 ms per character, +45 ms on spaces. The irregular rhythm is what
 *  makes the typing feel human — do not linearize it. */
const charDelay = (ch: string) => 68 + Math.random() * 52 + (ch === ' ' ? 45 : 0);
const OUT_DELAY = 340;
const NEXT_LINE_DELAY = 620;
const RESTART_DELAY = 4200;
const START_DELAY = 500;

const full = (lines: ShellLine[]): Rendered[] => lines.map((l) => ({ cmd: l.cmd, out: l.out }));

export default function Terminal({ lines }: { lines: ShellLine[] }) {
	const rootRef = useRef<HTMLDivElement>(null);
	// Server-rendered with the full lines, so the page stays readable without JS;
	// the effect clears them and replays the typing on hydration.
	const [shown, setShown] = useState<Rendered[]>(() => full(lines));
	const [idle, setIdle] = useState(true);

	useEffect(() => {
		// Reduced motion: keep the initial state, which already holds every line.
		// The caller remounts on a language change, so it is never stale.
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

		let cancelled = false;
		let timer: ReturnType<typeof setTimeout>;
		const wait = (fn: () => void, ms: number) => {
			timer = setTimeout(fn, ms);
		};

		// Don't play the terminal into the void while it is off screen.
		const onScreen = () => {
			const r = rootRef.current?.getBoundingClientRect();
			return !r || (r.bottom > -500 && r.top < window.innerHeight + 500);
		};

		const runLine = (i: number) => {
			if (cancelled) return;
			if (i >= lines.length) {
				setIdle(true);
				wait(run, RESTART_DELAY);
				return;
			}

			const { cmd, out } = lines[i];
			let c = 0;
			const step = () => {
				if (cancelled) return;
				if (!onScreen()) {
					wait(step, 500);
					return;
				}
				if (c < cmd.length) {
					c += 1;
					setShown((s) => [...s.slice(0, i), { cmd: cmd.slice(0, c), out: null }]);
					wait(step, charDelay(cmd[c - 1]));
				} else {
					wait(() => {
						setShown((s) => [...s.slice(0, i), { cmd, out }]);
						wait(() => runLine(i + 1), NEXT_LINE_DELAY);
					}, OUT_DELAY);
				}
			};
			step();
		};

		const run = () => {
			if (cancelled) return;
			setIdle(false);
			setShown([]);
			runLine(0);
		};

		wait(run, START_DELAY);
		return () => {
			cancelled = true;
			clearTimeout(timer);
		};
	}, [lines]);

	return (
		<div
			ref={rootRef}
			className="flex min-h-[290px] flex-col gap-3.5 px-5 pt-6 pb-5 text-[14.5px] leading-[1.6] sm:px-[26px]"
		>
			<div className="flex flex-col gap-3.5">
				{shown.map((line, i) => (
					<div key={i} className="flex flex-col gap-1.5">
						<div className="flex gap-2.5">
							<span className="text-primary">~/</span>
							<span className="text-muted-foreground">$</span>
							<span className="break-all">{line.cmd}</span>
						</div>
						{line.out !== null && (
							<div className="max-w-[560px] animate-out-in text-pretty text-muted-foreground">{line.out}</div>
						)}
					</div>
				))}
			</div>
			{idle && (
				<div className="flex gap-2.5">
					<span className="text-primary">~/</span>
					<span className="text-muted-foreground">$</span>
					<span className="animate-caret">▌</span>
				</div>
			)}
		</div>
	);
}
