import { useSyncExternalStore } from 'react';

/* The `dark` class on <html> is the single source of truth for the theme: the inline
   script in <head> sets it before first paint, so React has to read it rather than own
   it. Subscribing to the attribute keeps every consumer aligned with whoever wrote it. */
const subscribe = (onChange: () => void) => {
	const observer = new MutationObserver(onChange);
	observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
	return () => observer.disconnect();
};
const getSnapshot = () => document.documentElement.classList.contains('dark');
// No DOM on the server; light is what the markup is rendered with.
const getServerSnapshot = () => false;

export function useTheme() {
	const dark = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

	const toggle = () => {
		const next = !dark;
		// Writing the class is enough: the subscription above re-renders from it.
		document.documentElement.classList.toggle('dark', next);
		try {
			localStorage.setItem('theme', next ? 'dark' : 'light');
		} catch {
			// Storage unavailable (private browsing): the theme won't survive a reload.
		}
	};

	return [dark, toggle] as const;
}
