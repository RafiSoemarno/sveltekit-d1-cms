import { error, fail, redirect } from '@sveltejs/kit';
import { COLLECTIONS, isHomepageSection } from '$lib/admin/collections';
import { editorPath, listAdminItems, listDeleted, restoreDeleted } from '$lib/server/admin-content';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, url, platform }) => {
	const db = platform?.env.DB;
	if (!db) throw error(500, 'Database unavailable');

	const section = params.section;
	if (!isHomepageSection(section)) throw error(404, 'Unknown section');

	const requested = url.searchParams.get('filter');
	const filter = requested === 'drafts' || requested === 'deleted' ? requested : 'all';
	const config = COLLECTIONS[section];
	const [items, deleted] = await Promise.all([
		listAdminItems(db, section),
		filter === 'deleted' ? listDeleted(db, section) : Promise.resolve([])
	]);

	return {
		section,
		config,
		items,
		deleted,
		filter,
		capReached: config.cap ? items.length >= config.cap : false
	};
};

export const actions = {
	restore: async ({ request, params, platform }) => {
		const db = platform?.env.DB;
		if (!db) return fail(500, { errors: ['Database unavailable'] });
		if (!isHomepageSection(params.section)) return fail(404, { errors: ['Unknown section'] });

		const form = await request.formData();
		const id = String(form.get('id') ?? '');
		const result = await restoreDeleted(db, params.section, id, 'Restored from deleted');
		if (!result.ok) return fail(400, { errors: result.errors });
		throw redirect(303, editorPath(params.section, id));
	}
};
