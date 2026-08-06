import { Globe, Moon, Sun } from 'lucide-react';
import { getRelativeLocaleUrl } from 'astro:i18n';
import type { Lang } from '@/lib/site-content';
import { useTheme } from '@/lib/use-theme';

export default function Header({ path, lang, langHref }: { path: string; lang: Lang; langHref: string }) {
	const [dark, toggleTheme] = useTheme();

	return (
		<header className="flex items-center justify-between gap-3 border-b px-6 py-4 text-[13px] sm:px-10">
			<a href="/" className="min-w-0 truncate">
				<span className="text-primary">flrntvl</span>
				<span className="text-muted-foreground">@</span>
				<span>flrntvl.dev</span>
				<span className="text-muted-foreground">:</span>
				<span>{path}</span>
				<span className="text-muted-foreground">$</span>
			</a>
			<div className="flex shrink-0 items-center gap-3 sm:gap-[22px]">
				<a href={getRelativeLocaleUrl(lang, 'blog')} className="text-muted-foreground">
					blog/
				</a>
				<a
					href={langHref}
					title="Language"
					className="flex items-center gap-[7px] rounded-[7px] border px-2.5 py-[5px] font-[inherit] text-foreground"
				>
					<Globe size={14} strokeWidth={1.6} aria-hidden="true" />
					<span>{lang === 'fr' ? 'EN' : 'FR'}</span>
				</a>
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
	);
}
