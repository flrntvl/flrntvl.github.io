import { SITE_DESCRIPTION, SITE_TITLE } from '@/consts';

export type Lang = 'fr' | 'en';

export type ShellLine = { cmd: string; out: string };

export type Fx = 'matrix' | 'dots' | 'grid';

type Labels = {
	based: string;
	scroll: string;
	background: string;
	fx: Record<Fx, string>;
	rights: string;
	builtWith: string;
	social: string;
	legalTitle: string;
	legal: string;
	privacy: string;
	faviconCredit: { by: string; on: string };
	latestArticles: string;
	tableOfContents: string;
	articlesCount: (n: number) => string;
	readingTime: (minutes: number) => string;
	readingTimeLabel: (time: string) => string;
	publishedLabel: (date: string) => string;
	modifiedLabel: (date: string) => string;
	columns: { type: string; date: string; duration: string; title: string; tags: string };
	pagination: { prev: string; next: string };
	meta: { title: string; description: string };
};

export const LABELS: Record<Lang, Labels> = {
	fr: {
		based: 'Ingénieur développeur web — France',
		scroll: 'Défiler',
		background: 'fond :',
		fx: {
			matrix: 'matrix',
			dots: 'particules',
			grid: 'grille de points',
		},
		rights: 'Tous droits réservés',
		builtWith: 'Construit avec Astro, Tailwind — hébergé sur GitHub Pages',
		social: 'Réseaux',
		legalTitle: 'Informations',
		legal: 'Mentions légales',
		privacy: 'Confidentialité',
		faviconCredit: { by: 'Favicon créé par', on: 'sur' },
		latestArticles: 'Derniers articles',
		tableOfContents: 'Sommaire',
		articlesCount: (n) => `${n} fichier${n > 1 ? 's' : ''}`,
		readingTime: (n) => `${n} min`,
		readingTimeLabel: (time) => `Temps de lecture : ${time}`,
		publishedLabel: (date) => `Publié le : ${date}`,
		modifiedLabel: (date) => `Modifié le : ${date}`,
		columns: { type: 'type', date: 'date', duration: 'durée', title: 'titre', tags: 'tags' },
		pagination: { prev: '← précédent', next: 'suivant →' },
		meta: { title: SITE_TITLE, description: SITE_DESCRIPTION },
	},
	en: {
		based: 'Web engineer — based in France',
		scroll: 'Scroll',
		background: 'background:',
		fx: {
			matrix: 'matrix',
			dots: 'particles',
			grid: 'dot grid',
		},
		rights: 'All rights reserved',
		builtWith: 'Built with Astro, Tailwind — hosted on GitHub Pages',
		social: 'Social',
		legalTitle: 'Information',
		legal: 'Legal notice',
		privacy: 'Privacy',
		faviconCredit: { by: 'Favicon created by', on: 'on' },
		latestArticles: 'Latest posts',
		tableOfContents: 'Contents',
		articlesCount: (n) => `${n} file${n > 1 ? 's' : ''}`,
		readingTime: (n) => `${n} min`,
		readingTimeLabel: (time) => `Reading time: ${time}`,
		publishedLabel: (date) => `Published: ${date}`,
		modifiedLabel: (date) => `Updated: ${date}`,
		columns: { type: 'type', date: 'date', duration: 'duration', title: 'title', tags: 'tags' },
		pagination: { prev: '← previous', next: 'next →' },
		meta: {
			title: 'Florent Val — flrntvl.dev',
			description: 'Web engineer — based in France. TypeScript, Astro, React, PHP.',
		},
	},
};

export const SHELL: Record<Lang, ShellLine[]> = {
	fr: [
		{ cmd: 'whoami', out: 'Florent Val — ingénieur développeur web, 29 ans, France.' },
		{
			cmd: 'cat about.txt',
			out: 'Ingénieur développeur web depuis dix ans : je conçois et construis des applications rapides, accessibles et durables — du backend PHP au front TypeScript.',
		},
		{
			cmd: 'cat now.md',
			out: "En ce moment : j'apprends Ruby, et je creuse l'agentic coding — agents, outillage, revue assistée.",
		},
		{ cmd: 'ls ~/stack', out: 'php 8.5  symfony  laravel  typescript  astro  react  ruby  docker' },
		{ cmd: 'cat todo.md', out: "Le blog arrive : articles, projets et stack en cours d'écriture." },
	],
	en: [
		{ cmd: 'whoami', out: 'Florent Val — web engineer, 29, based in France.' },
		{
			cmd: 'cat about.txt',
			out: 'Web engineer for ten years: I design and build fast, accessible, long-lasting applications — from the PHP backend to the TypeScript front end.',
		},
		{
			cmd: 'cat now.md',
			out: 'Right now: learning Ruby, and digging into agentic coding — agents, tooling, assisted review.',
		},
		{ cmd: 'ls ~/stack', out: 'php 8.5  symfony  laravel  typescript  astro  react  ruby  docker' },
		{ cmd: 'cat todo.md', out: 'Blog coming soon: posts, projects and stack in the works.' },
	],
};

type NotFoundLabels = {
	message: string;
	cta: string;
	/** The exchange played in the terminal: the failed `cat`, then its exit code — see DESIGN.md §7. */
	lines: (path: string) => ShellLine[];
};

export const NOT_FOUND: Record<Lang, NotFoundLabels> = {
	fr: {
		message: "Cette page n'existe pas — ou plus.",
		cta: 'cd ~ — retour à l’accueil',
		lines: (path) => [
			{ cmd: `cat ${path}`, out: `cat: ${path}: Aucun fichier ou dossier de ce type` },
			{ cmd: 'echo $?', out: '404' },
		],
	},
	en: {
		message: "This page doesn't exist — or not anymore.",
		cta: 'cd ~ — back home',
		lines: (path) => [
			{ cmd: `cat ${path}`, out: `cat: ${path}: No such file or directory` },
			{ cmd: 'echo $?', out: '404' },
		],
	},
};

export const WINDOW_DOTS = ['#ff5f57', '#febc2e', '#28c840'];

export const WIP_STATUS = 'HTTP 206 — Partial Content';

export const GITHUB_URL = 'https://github.com/flrntvl';

export const LINKEDIN_URL = 'https://www.linkedin.com/in/florent-val/';

export const X_URL = 'https://x.com/flrntvl';

export const FLATICON_URL = 'https://www.flaticon.com/free-icons/api';

export const FLATICON_AUTHOR_URL = 'https://www.flaticon.com/authors/tanah-basah';

export const AVATAR_URL = 'https://avatars.githubusercontent.com/u/309853004?v=4';
