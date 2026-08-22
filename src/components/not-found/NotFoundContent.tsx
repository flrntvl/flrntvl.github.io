import { getRelativeLocaleUrl } from 'astro:i18n';
import { useEffect, useState } from 'react';
import HeroCanvas from '@/components/shared/HeroCanvas';
import { buildStorm } from '@/components/shared/hero-fx';
import Terminal from '@/components/shared/Terminal';
import { NOT_FOUND, WINDOW_DOTS, type Lang } from '@/lib/site-content';
import { useTheme } from '@/lib/use-theme';

// GitHub Pages serves a single 404.html for every URL, so language and requested
// path can only be resolved on the client. The French defaults exist so the page
// can be prerendered without an empty flash; the effect swaps them right after
// hydration.
export default function NotFoundContent() {
	const [{ lang, path }, setRequested] = useState<{ lang: Lang; path: string }>({
		lang: 'fr',
		path: '~',
	});

	useEffect(() => {
		const requested = window.location.pathname.replace(/^\//, '') || '.';
		// The requested path only exists on the client, so resolving it after mount
		// IS the feature — the cascading render the rule warns about is intended.
		// eslint-disable-next-line react-hooks/set-state-in-effect
		setRequested({ lang: requested.startsWith('en/') ? 'en' : 'fr', path: requested });
		document.documentElement.lang = requested.startsWith('en/') ? 'en' : 'fr';
	}, []);

	const [dark] = useTheme();
	const nf = NOT_FOUND[lang];

	return (
		<div className="bg-background text-foreground">
			<section className="relative flex flex-col items-center gap-8 overflow-hidden px-6 pt-20 pb-24 sm:px-10">
				<HeroCanvas builder={buildStorm} dark={dark} />

				<div className="relative z-[1] flex flex-col items-center gap-2">
					<h1 className="text-[34px] font-medium tracking-[-0.03em]">404</h1>
					<p className="text-sm text-muted-foreground">{nf.message}</p>
				</div>

				<div className="relative z-[1] w-[640px] max-w-full overflow-hidden rounded-xl border bg-card shadow-[0_18px_50px_rgba(0,0,0,0.12)]">
					<div className="flex items-center gap-3.5 border-b bg-background px-4 py-[11px]">
						<div className="flex gap-2">
							{WINDOW_DOTS.map((c) => (
								<span key={c} className="block size-3 rounded-full" style={{ background: c }} />
							))}
						</div>
						<span className="flex-1 text-center text-xs text-muted-foreground">florent@dev — zsh</span>
						<span className="w-10" />
					</div>

					<Terminal lines={nf.lines(path)} />
				</div>

				<a
					href={getRelativeLocaleUrl(lang)}
					className="relative z-[1] rounded-lg bg-foreground px-[18px] py-[11px] text-[13px] text-background hover:text-background"
				>
					{nf.cta}
				</a>
			</section>
		</div>
	);
}
