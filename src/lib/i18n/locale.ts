export type Locale = 'en' | 'id';

export function localeFromPath(pathname: string): Locale {
	return pathname === '/id' || pathname.startsWith('/id/') ? 'id' : 'en';
}

export function stripLocale(pathname: string): string {
	if (pathname === '/id') return '/';
	if (pathname.startsWith('/id/')) return pathname.slice(3) || '/';
	return pathname;
}

export function localePath(path: string, locale: Locale): string {
	const clean = path.startsWith('/') ? path : `/${path}`;
	const bare = stripLocale(clean);
	if (locale === 'en') return bare || '/';
	if (bare === '/') return '/id';
	return `/id${bare}`;
}

export function localeAlternates(pathname: string): { en: string; id: string; xDefault: string } {
	const bare = stripLocale(pathname);
	return {
		en: localePath(bare, 'en'),
		id: localePath(bare, 'id'),
		xDefault: localePath(bare, 'en')
	};
}
