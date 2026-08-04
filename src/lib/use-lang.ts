import { useEffect, useState } from 'react';
import type { Lang } from '@/lib/site-content';

export function useLang(initial: Lang = 'fr') {
	const [lang, setLang] = useState<Lang>(initial);

	useEffect(() => {
		document.documentElement.lang = lang;
	}, [lang]);

	return [lang, setLang] as const;
}
