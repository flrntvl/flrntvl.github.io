import HeroCanvas from '@/components/home/HeroCanvas';
import { buildStorm } from '@/components/home/hero-fx';
import Terminal from '@/components/home/Terminal';
import SiteFooter from '@/components/layout/SiteFooter';
import SiteHeader from '@/components/layout/SiteHeader';
import { NOT_FOUND, WINDOW_DOTS } from '@/lib/site-content';
import { useLang } from '@/lib/use-lang';
import { useTheme } from '@/lib/use-theme';

/** GitHub Pages serves this file for any unmatched path, so `window.location`
 *  still holds the URL the visitor actually tried — unlike whatever Astro assigns
 *  this page at build time. Rendered client:only, so `window` is always there. */
const requestedPath = () => window.location.pathname.replace(/^\//, '') || '.';

export default function NotFoundPage() {
	const [lang, setLang] = useLang();
	const [dark, toggleTheme] = useTheme();
	const nf = NOT_FOUND[lang];
	const path = requestedPath();

	return (
		<div className="min-h-screen bg-background text-foreground">
			<SiteHeader
				path="~"
				lang={lang}
				onToggleLang={() => setLang(lang === 'fr' ? 'en' : 'fr')}
				dark={dark}
				onToggleTheme={toggleTheme}
			/>

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

					{/* Keyed on the language: a switch remounts the terminal, which restarts
					    the typing from the new lines instead of resetting state mid-run. */}
					<Terminal key={lang} lines={nf.lines(path)} />
				</div>

				<a
					href="/"
					className="relative z-[1] rounded-lg bg-foreground px-[18px] py-[11px] text-[13px] text-background hover:text-background"
				>
					{nf.cta}
				</a>
			</section>

			<SiteFooter lang={lang} />
		</div>
	);
}
