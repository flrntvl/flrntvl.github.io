import {
	FLATICON_AUTHOR_URL,
	FLATICON_URL,
	GITHUB_URL,
	LABELS,
	LINKEDIN_URL,
	X_URL,
	type Lang,
} from '@/lib/site-content';

export default function Footer({ lang }: { lang: Lang }) {
	const t = LABELS[lang];

	return (
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
