import { error } from '@sveltejs/kit';
import { listPublishedMany } from '$lib/server/content';
import type { PageServerLoad } from './$types';

const HOME_COLLECTIONS = [
	'slides',
	'solutions',
	'services',
	'stats',
	'testimonies',
	'partners'
] as const;

export const load: PageServerLoad = async ({ platform, locals }) => {
	const db = platform?.env.DB;

	if (!db) {
		throw error(500, 'Database unavailable');
	}

	const content = await listPublishedMany(db, HOME_COLLECTIONS, locals.preview);

	return {
		slides: content.slides,
		solutions: content.solutions,
		services: content.services,
		stats: content.stats,
		testimonies: content.testimonies,
		partners: content.partners
	};
};
