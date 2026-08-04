import { useEffect, useState, useSyncExternalStore } from 'react';
import { Globe, Moon, Sun } from 'lucide-react';
import HeroCanvas from './HeroCanvas';
import Terminal from './Terminal';
import {
	AVATAR_URL,
	LABELS,
	FLATICON_AUTHOR_URL,
	FLATICON_URL,
	GITHUB_URL,
	LINKEDIN_URL,
	SHELL,
	WIP_STATUS,
	X_URL,
	type Fx,
	type Lang,
} from '@/lib/site-content';

const FX_ORDER: Fx[] = ['matrix', 'wall', 'dots', 'grid'];

/** The three macOS buttons: only here and in code block headers. */
const WINDOW_DOTS = ['#ff5f57', '#febc2e', '#28c840'];

/* The `dark` class on <html> is the single source of truth for the theme: the inline
   script in <head> sets it before first paint, so React has to read it rather than own
   it. Subscribing to the attribute keeps the toggle icon aligned with whoever wrote it. */
const subscribeTheme = (onChange: () => void) => {
	const observer = new MutationObserver(onChange);
	observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
	return () => observer.disconnect();
};
const getTheme = () => document.documentElement.classList.contains('dark');
// No DOM on the server; light is what the markup is rendered with.
const getServerTheme = () => false;

export default function HomePage() {
	const [lang, setLang] = useState<Lang>('fr');
	const dark = useSyncExternalStore(subscribeTheme, getTheme, getServerTheme);
	const [fx, setFx] = useState<Fx>('matrix');
	const t = LABELS[lang];

	useEffect(() => {
		document.documentElement.lang = lang;
	}, [lang]);

	const toggleTheme = () => {
		const next = !dark;
		// Writing the class is enough: the subscription above re-renders from it.
		document.documentElement.classList.toggle('dark', next);
		try {
			localStorage.setItem('theme', next ? 'dark' : 'light');
		} catch {
			// Storage unavailable (private browsing): the theme won't survive a reload.
		}
	};

	return (
		<div className="min-h-screen bg-background text-foreground">
			<header className="flex items-center justify-between border-b px-6 py-4 text-[13px] sm:px-10">
				<a href="/" className="flex items-center">
					<span className="text-primary">flrntvl</span>
					<span className="text-muted-foreground">@</span>
					<span>flrntvl.dev</span>
					<span className="text-muted-foreground">:</span>
					<span>~</span>
					<span className="text-muted-foreground">$</span>
				</a>
				<div className="flex items-center gap-3 sm:gap-[22px]">
					<button
						type="button"
						onClick={() => setLang(lang === 'fr' ? 'en' : 'fr')}
						title="Language"
						className="flex cursor-pointer items-center gap-[7px] rounded-[7px] border px-2.5 py-[5px] font-[inherit] text-foreground"
					>
						<Globe size={14} strokeWidth={1.6} aria-hidden="true" />
						<span>{lang === 'fr' ? 'EN' : 'FR'}</span>
					</button>
					<button
						type="button"
						onClick={toggleTheme}
						title="Theme"
						aria-pressed={dark}
						className="flex cursor-pointer items-center rounded-[7px] border px-2.5 py-[5px] font-[inherit] text-foreground"
					>
						{dark ? (
							<Moon size={14} strokeWidth={1.6} aria-hidden="true" />
						) : (
							<Sun size={14} strokeWidth={1.6} aria-hidden="true" />
						)}
					</button>
				</div>
			</header>

			<section className="relative flex flex-col items-center gap-10 overflow-hidden px-6 pt-16 pb-[76px] sm:px-10">
				<HeroCanvas fx={fx} dark={dark} />

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

			<footer className="border-t px-6 py-10 text-[12.5px] text-muted-foreground sm:px-10">
				<div className="mb-5 flex items-center gap-2.5 text-sm text-foreground">
					<span className="text-primary">~/</span>
					<span className="text-muted-foreground">$</span>
					<span>cat footer.md</span>
				</div>
				<div className="grid gap-10 md:grid-cols-[1fr_auto_auto] md:gap-14">
					<div className="flex flex-col gap-2.5">
						<span className="text-foreground">
							Made by{' '}
							<a href={GITHUB_URL} className="text-primary underline underline-offset-[3px]">
								flrntvl
							</a>{' '}
							with ❤️
						</span>
						<span>© 2026 Florent Val — {t.rights}</span>
						<span>{t.builtWith}</span>
						<span>
							{t.faviconCredit.by}{' '}
							<a href={FLATICON_AUTHOR_URL} className="underline underline-offset-[3px]">
								Tanah Basah
							</a>{' '}
							{t.faviconCredit.on}{' '}
							<a href={FLATICON_URL} className="underline underline-offset-[3px]">
								Flaticon
							</a>
						</span>
					</div>

					<div className="flex flex-col gap-[9px]">
						<span className="text-foreground">{t.social}/</span>
						<a href={GITHUB_URL} className="flex items-center gap-[9px]">
							<GitHubIcon />
							<span>github</span>
						</a>
						<a href={LINKEDIN_URL} className="flex items-center gap-[9px]">
							<LinkedInIcon />
							<span>linkedin</span>
						</a>
						<a href={X_URL} className="flex items-center gap-[9px]">
							<XIcon />
							<span>x</span>
						</a>
					</div>

					<div className="flex flex-col gap-2">
						<span className="text-foreground">{t.legalTitle}/</span>
						<a href="#">├─ {t.legal}</a>
						<a href="#">└─ {t.privacy}</a>
					</div>
				</div>
			</footer>
		</div>
	);
}

function GitHubIcon() {
	return (
		<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
			<path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.9 1.53 2.36 1.09 2.93.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02a9.5 9.5 0 0 1 5 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.69-4.57 4.94.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10 10 0 0 0 12 2Z" />
		</svg>
	);
}

function LinkedInIcon() {
	return (
		<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
			<path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9h4v12H3V9Zm7 0h3.8v1.65h.05A4.17 4.17 0 0 1 17.6 8.7c3.6 0 4.4 2.3 4.4 5.3V21h-4v-6c0-1.43-.03-3.28-2-3.28-2 0-2.3 1.56-2.3 3.17V21h-4V9Z" />
		</svg>
	);
}

function XIcon() {
	return (
		<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
			<path d="M17.53 3H20l-5.9 6.74L21 21h-5.44l-4.26-5.58L6.4 21H3.93l6.31-7.21L3 3h5.58l3.85 5.1L17.53 3Zm-.87 16.2h1.37L7.4 4.72H5.93l10.73 14.48Z" />
		</svg>
	);
}
