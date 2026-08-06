import { useState } from 'react';
import { BUILDERS } from './hero-fx';
import HeroCanvas from './HeroCanvas';
import Terminal from './Terminal';
import SiteFooter from '@/components/layout/SiteFooter';
import SiteHeader from '@/components/layout/SiteHeader';
import { AVATAR_URL, GITHUB_URL, LABELS, SHELL, WINDOW_DOTS, WIP_STATUS, type Fx } from '@/lib/site-content';
import { useLang } from '@/lib/use-lang';
import { useTheme } from '@/lib/use-theme';

const FX_ORDER: Fx[] = ['matrix', 'dots', 'grid'];

export default function HomePage() {
	const [lang, setLang] = useLang();
	const [dark, toggleTheme] = useTheme();
	const [fx, setFx] = useState<Fx>('matrix');
	const t = LABELS[lang];

	return (
		<div className="min-h-screen bg-background text-foreground">
			<SiteHeader
				path="~"
				lang={lang}
				onToggleLang={() => setLang(lang === 'fr' ? 'en' : 'fr')}
				dark={dark}
				onToggleTheme={toggleTheme}
			/>

			<section className="relative flex flex-col items-center gap-10 overflow-hidden px-6 pt-16 pb-[76px] sm:px-10">
				<HeroCanvas builder={BUILDERS[fx]} dark={dark} />

				<div className="relative z-[1] flex flex-col items-center gap-4">
					<img
						src={AVATAR_URL}
						alt="Florent Val"
						width={104}
						height={104}
						className="block size-26 rounded-full border object-cover"
					/>
					<div className="flex flex-col items-center gap-2">
						<h1 className="text-[34px] font-medium tracking-[-0.03em]">Florent Val</h1>
						<span className="text-sm text-muted-foreground">{t.based}</span>
						<div className="mt-1 flex items-center gap-2 rounded-full border border-dashed bg-card px-[11px] py-[5px] text-center text-[11.5px] text-muted-foreground">
							<span className="block size-1.5 shrink-0 animate-dot rounded-full bg-primary" />
							<span>WIP</span>
							<span className="text-border">|</span>
							<span>{WIP_STATUS}</span>
						</div>
					</div>
				</div>

				<div className="relative z-[1] w-[860px] max-w-full overflow-hidden rounded-xl border bg-card shadow-[0_18px_50px_rgba(0,0,0,0.12)]">
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
					<Terminal key={lang} lines={SHELL[lang]} />

					<div className="flex items-center justify-between border-t bg-background px-4 py-[9px] text-[11.5px] text-muted-foreground">
						<div className="flex gap-4.5">
							<span>⎇ main*</span>
							<span>UTF-8</span>
						</div>
						<span>{t.scroll} ↓</span>
					</div>
				</div>

				<a
					href={GITHUB_URL}
					className="relative z-[1] rounded-lg bg-foreground px-[18px] py-[11px] text-[13px] text-background hover:text-background"
				>
					github.com/flrntvl ↗
				</a>

				<div className="relative z-[1] flex flex-wrap items-center justify-center gap-2.5 text-xs text-muted-foreground">
					<span>{t.background}</span>
					<div className="flex flex-wrap justify-center gap-1.5">
						{FX_ORDER.map((key) => (
							<button
								key={key}
								type="button"
								onClick={() => setFx(key)}
								aria-pressed={fx === key}
								className={`cursor-pointer rounded-full border px-3 py-1.5 font-[inherit] ${
									fx === key
										? 'border-foreground bg-foreground text-background'
										: 'bg-background text-foreground'
								}`}
							>
								{t.fx[key]}
							</button>
						))}
					</div>
				</div>
			</section>

			<SiteFooter lang={lang} />
		</div>
	);
}
