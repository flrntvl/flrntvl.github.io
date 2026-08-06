import { getRelativeLocaleUrl } from 'astro:i18n';
import { useEffect } from 'react';
import HeroCanvas from '@/components/shared/HeroCanvas';
import { buildStorm } from '@/components/shared/hero-fx';
import Terminal from '@/components/shared/Terminal';
import { NOT_FOUND, WINDOW_DOTS, type Lang } from '@/lib/site-content';
import { useTheme } from '@/lib/use-theme';

const requestedPath = () => window.location.pathname.replace(/^\//, '') || '.';

const currentLang = (): Lang => (window.location.pathname.replace(/^\//, '').startsWith('en/') ? 'en' : 'fr');

export default function NotFoundContent() {
	const lang = currentLang();
	const [dark] = useTheme();
	const nf = NOT_FOUND[lang];
	const path = requestedPath();

	useEffect(() => {
		document.documentElement.lang = lang;
	}, [lang]);

	return (
		<div className="min-h-screen bg-background text-foreground">
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
