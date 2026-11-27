import type { Localized } from '$lib/types';

// Single source of truth for the demo identity. Change these values, the logo,
// and the copy in `src/lib/i18n/ui.ts` to make the scaffold your own.
export const SITE = {
	name: 'Acme',
	shortName: 'Acme',
	description: {
		en: 'A demo content site built with SvelteKit, Cloudflare D1, and R2.',
		id: 'Situs konten demo yang dibangun dengan SvelteKit, Cloudflare D1, dan R2.'
	} satisfies Localized,
	themeColor: '#006599'
};
