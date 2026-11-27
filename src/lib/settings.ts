import type { SiteSettings } from '$lib/types';
import { SITE } from '$lib/brand';

// Content-free fallback. Production settings come from the D1 `site_settings`
// row; using empty values here means a missing or unreadable row renders no
// contact details instead of stale ones.
export const DEFAULT_SETTINGS: SiteSettings = {
	contact: {
		phone: '',
		whatsapp: '',
		email: '',
		address: ''
	},
	seo: {
		title: {
			en: SITE.name,
			id: SITE.name
		},
		description: {
			en: '',
			id: ''
		},
		image: ''
	}
};
