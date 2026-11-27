import { error } from '@sveltejs/kit';
import { PRODUCT_NOT_FOUND } from '$lib/constants';
import { getProduct } from '$lib/server/content';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, platform, locals }) => {
	const db = platform?.env.DB;

	if (!db) {
		throw error(500, 'Database unavailable');
	}

	const product = await getProduct(db, params.slug, locals.preview);

	if (!product) {
		throw error(404, PRODUCT_NOT_FOUND);
	}

	return { product, slug: params.slug };
};
