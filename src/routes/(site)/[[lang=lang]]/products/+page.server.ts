import { error } from '@sveltejs/kit';
import { listProducts } from '$lib/server/content';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ platform, locals }) => {
	const db = platform?.env.DB;

	if (!db) {
		throw error(500, 'Database unavailable');
	}

	const products = await listProducts(db, locals.preview);

	return { products };
};
