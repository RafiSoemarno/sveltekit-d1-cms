import { error } from '@sveltejs/kit';
import { getAvailability, getSiteSettings } from '$lib/server/content';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ platform, locals, params, setHeaders }) => {
	const db = platform?.env.DB;
	if (!db) throw error(500, 'Database unavailable');

	const locale: 'en' | 'id' = params.lang === 'id' ? 'id' : 'en';
	const [settings, availability] = await Promise.all([
		getSiteSettings(db),
		getAvailability(db, locals.preview)
	]);

	if (locals.preview) {
		setHeaders({
			'cache-control': 'private, no-store',
			'x-robots-tag': 'noindex'
		});
	} else {
		setHeaders({
			'cache-control': 'public, max-age=0, s-maxage=60, stale-while-revalidate=300'
		});
	}

	return { locale, settings, availability, preview: locals.preview };
};
