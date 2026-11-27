import { error, fail, redirect } from '@sveltejs/kit';
import { editorPath, listAdminItems, listDeleted, restoreDeleted } from '$lib/server/admin-content';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url, platform }) => {
	const db = platform?.env.DB;
	if (!db) throw error(500, 'Database unavailable');

	const requested = url.searchParams.get('filter');
	const filter = requested === 'drafts' || requested === 'deleted' ? requested : 'all';
	const q = (url.searchParams.get('q') ?? '').trim().toLowerCase();

	const [items, deleted] = await Promise.all([
		listAdminItems(db, 'products'),
		filter === 'deleted' ? listDeleted(db, 'products') : Promise.resolve([])
	]);

	const filtered = items.filter((item) => {
		if (filter === 'drafts' && item.status === 'published') return false;
		if (!q) return true;
		const haystack = [item.data.name, item.data.brand, item.data.category, item.id]
			.map((value) => String(value ?? ''))
			.join(' ')
			.toLowerCase();
		return haystack.includes(q);
	});

	return { items: filtered, deleted, filter, q };
};

export const actions = {
	restore: async ({ request, platform }) => {
		const db = platform?.env.DB;
		if (!db) return fail(500, { errors: ['Database unavailable'] });
		const form = await request.formData();
		const id = String(form.get('id') ?? '');
		const result = await restoreDeleted(db, 'products', id, 'Restored from deleted');
		if (!result.ok) return fail(400, { errors: result.errors });
		throw redirect(303, editorPath('products', id));
	}
};
