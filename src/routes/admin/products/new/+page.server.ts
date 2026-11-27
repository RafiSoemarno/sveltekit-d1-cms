import { error, fail, redirect } from '@sveltejs/kit';
import { defaultData } from '$lib/admin/collections';
import { generateId, saveDraft } from '$lib/server/admin-content';
import { listMedia } from '$lib/server/media';
import type { Actions, PageServerLoad } from './$types';

function parseData(form: FormData): Record<string, unknown> {
	const raw = form.get('data');
	if (typeof raw !== 'string' || !raw) throw new Error('Form payload is missing.');
	return JSON.parse(raw) as Record<string, unknown>;
}

export const load: PageServerLoad = async ({ platform }) => {
	const bucket = platform?.env.MEDIA;
	if (!bucket) throw error(500, 'Media binding unavailable');
	return { data: defaultData('products'), media: await listMedia(bucket) };
};

export const actions: Actions = {
	save: async ({ request, platform }) => {
		const db = platform?.env.DB;
		if (!db) return fail(500, { errors: ['Database unavailable'] });
		const form = await request.formData();
		let id: string;
		try {
			const data = parseData(form);
			const slug = typeof data.slug === 'string' ? data.slug.trim() : '';
			const name = typeof data.name === 'string' ? data.name : '';
			id = slug || (await generateId(db, 'products', name || 'product'));
			const note = String(form.get('note') ?? '');
			await saveDraft(db, { collection: 'products', id, data, note });
		} catch (saveError) {
			return fail(400, {
				errors: [saveError instanceof Error ? saveError.message : 'Could not save the draft.']
			});
		}
		throw redirect(303, `/admin/products/${encodeURIComponent(id)}`);
	}
};
