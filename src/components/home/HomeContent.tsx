import { getRelativeLocaleUrl } from 'astro:i18n';
import { useState } from 'react';
import HeroCanvas from '@/components/shared/HeroCanvas';
import { BUILDERS } from '@/components/shared/hero-fx';
import Terminal from '@/components/shared/Terminal';
import type { PostSummary } from '@/lib/articles';
import { AVATAR_URL, GITHUB_URL, LABELS, SHELL, WINDOW_DOTS, type Fx, type Lang } from '@/lib/site-content';
import { useTheme } from '@/lib/use-theme';

const FX_ORDER: Fx[] = ['matrix', 'dots', 'grid'];

export default function HomeContent({ lang, posts }: { lang: Lang; posts: PostSummary[] }) {
	const [dark] = useTheme();
	const [fx, setFx] = useState<Fx>('matrix');
	const t = LABELS[lang];

	return (
		<div className="bg-background text-foreground">
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

					<Terminal lines={SHELL[lang]} />

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

			<section className="flex flex-col items-center gap-6 border-t px-6 pt-16 pb-24 sm:px-10">
				<div className="w-full max-w-[860px]">
					<p className="text-[15px]">
						<span className="text-primary">~/</span> <span className="text-muted-foreground">$</span>{' '}
						<span className="text-foreground">ls -t blog/ | head -5</span>
					</p>
					<p className="mt-1.5 text-[12.5px] text-muted-foreground">
						{t.latestArticles} — {t.articlesCount(posts.length)}
					</p>

					<div className="mt-6">
						{posts.map((post) => (
							<a
								key={post.slug}
								href={post.href}
								className="grid grid-cols-[1fr_auto] items-baseline gap-3 border-t px-2.5 py-4 text-[13px] text-muted-foreground hover:bg-card hover:text-foreground sm:grid-cols-[96px_84px_70px_1fr_120px] sm:gap-5"
							>
								<span className="hidden sm:block">-rw-r--r--</span>
								<span className="hidden sm:block">
									{post.date}
									{post.modifiedTooltip && (
										<span className="text-primary" title={post.modifiedTooltip}>
											*
										</span>
									)}
								</span>
								<span className="hidden sm:block">{post.readingTime}</span>
								<span className="text-[15px] text-foreground">{post.slug}.md</span>
								<span className="text-right text-primary">#{post.tag}</span>
							</a>
						))}
					</div>

					<p className="mt-7 text-[15px]">
						<span className="text-primary">~/</span> <span className="text-muted-foreground">$</span>{' '}
						<a href={getRelativeLocaleUrl(lang, 'blog')} className="border-b border-border pb-0.5">
							open blog --all
						</a>
					</p>
				</div>
			</section>
		</div>
	);
}
