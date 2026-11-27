import { error, fail, redirect } from '@sveltejs/kit';
import { COLLECTIONS, defaultData, isHomepageSection, itemLabel } from '$lib/admin/collections';
import { generateId, saveDraft } from '$lib/server/admin-content';
import { listMedia } from '$lib/server/media';
import type { Actions, PageServerLoad } from './$types';

function parseData(form: FormData): Record<string, unknown> {
	const raw = form.get('data');
	if (typeof raw !== 'string' || !raw) throw new Error('Form payload is missing.');
	return JSON.parse(raw) as Record<string, unknown>;
}

export const load: PageServerLoad = async ({ params, platform }) => {
	if (!isHomepageSection(params.section)) throw error(404, 'Unknown section');
	const bucket = platform?.env.MEDIA;
	if (!bucket) throw error(500, 'Media binding unavailable');
	const media = await listMedia(bucket);

	return {
		section: params.section,
		config: COLLECTIONS[params.section],
		data: defaultData(params.section),
		media
	};
};

export const actions: Actions = {
	save: async ({ request, params, platform }) => {
		const db = platform?.env.DB;
		if (!db) return fail(500, { errors: ['Database unavailable'] });
		if (!isHomepageSection(params.section)) return fail(404, { errors: ['Unknown section'] });
		const form = await request.formData();
		let id: string;
		try {
			const data = parseData(form);
			id = await generateId(db, params.section, itemLabel(params.section, data));
			const note = String(form.get('note') ?? '');
			await saveDraft(db, { collection: params.section, id, data, note });
		} catch (saveError) {
			return fail(400, {
				errors: [saveError instanceof Error ? saveError.message : 'Could not save the draft.']
			});
		}
		throw redirect(303, `${COLLECTIONS[params.section].path}/${encodeURIComponent(id)}`);
	}
};
