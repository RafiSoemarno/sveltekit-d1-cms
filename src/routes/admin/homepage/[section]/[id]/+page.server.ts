import { error, fail, redirect } from '@sveltejs/kit';
import { COLLECTIONS, isHomepageSection } from '$lib/admin/collections';
import {
	AdminError,
	deleteItem,
	editorPath,
	getAdminItem,
	getRevisions,
	publishItem,
	restoreRevision,
	saveDraft,
	unpublishItem
} from '$lib/server/admin-content';
import { listMedia } from '$lib/server/media';
import type { Actions, PageServerLoad } from './$types';

function parseData(form: FormData): Record<string, unknown> {
	const raw = form.get('data');
	if (typeof raw !== 'string' || !raw) throw new AdminError('Form payload is missing.');
	try {
		return JSON.parse(raw) as Record<string, unknown>;
	} catch {
		throw new AdminError('Form payload is invalid.');
	}
}

function noteOf(form: FormData): string {
	return String(form.get('note') ?? '');
}

export const load: PageServerLoad = async ({ params, platform }) => {
	const db = platform?.env.DB;
	const bucket = platform?.env.MEDIA;
	if (!db || !bucket) throw error(500, 'CMS bindings unavailable');
	if (!isHomepageSection(params.section)) throw error(404, 'Unknown section');

	const item = await getAdminItem(db, params.section, params.id);
	if (!item) throw error(404, 'Item not found');

	const [revisions, media] = await Promise.all([
		getRevisions(db, params.section, params.id),
		listMedia(bucket)
	]);

	return {
		section: params.section,
		config: COLLECTIONS[params.section],
		item,
		revisions,
		media
	};
};

export const actions: Actions = {
	save: async ({ request, params, platform }) => {
		const db = platform?.env.DB;
		if (!db) return fail(500, { errors: ['Database unavailable'] });
		if (!isHomepageSection(params.section)) return fail(404, { errors: ['Unknown section'] });
		const form = await request.formData();
		try {
			await saveDraft(db, {
				collection: params.section,
				id: params.id,
				data: parseData(form),
				note: noteOf(form)
			});
			return { success: true, savedAt: new Date().toISOString() };
		} catch (saveError) {
			return fail(400, {
				errors: [saveError instanceof Error ? saveError.message : 'Could not save the draft.']
			});
		}
	},
	publish: async ({ request, params, platform }) => {
		const db = platform?.env.DB;
		if (!db) return fail(500, { errors: ['Database unavailable'] });
		if (!isHomepageSection(params.section)) return fail(404, { errors: ['Unknown section'] });
		const form = await request.formData();
		try {
			await saveDraft(db, {
				collection: params.section,
				id: params.id,
				data: parseData(form),
				note: noteOf(form)
			});
			const result = await publishItem(db, params.section, params.id, noteOf(form));
			if (!result.ok) return fail(400, { errors: result.errors });
			throw redirect(303, editorPath(params.section, params.id));
		} catch (publishError) {
			if (publishError instanceof AdminError) {
				return fail(400, { errors: [publishError.message] });
			}
			throw publishError;
		}
	},
	unpublish: async ({ params, platform, request }) => {
		const db = platform?.env.DB;
		if (!db) return fail(500, { errors: ['Database unavailable'] });
		if (!isHomepageSection(params.section)) return fail(404, { errors: ['Unknown section'] });
		const form = await request.formData();
		const result = await unpublishItem(db, params.section, params.id, noteOf(form));
		if (!result.ok) return fail(400, { errors: result.errors });
		throw redirect(303, editorPath(params.section, params.id));
	},
	delete: async ({ params, platform, request }) => {
		const db = platform?.env.DB;
		if (!db) return fail(500, { errors: ['Database unavailable'] });
		if (!isHomepageSection(params.section)) return fail(404, { errors: ['Unknown section'] });
		const form = await request.formData();
		const result = await deleteItem(db, params.section, params.id, noteOf(form));
		if (!result.ok) return fail(400, { errors: result.errors });
		throw redirect(303, COLLECTIONS[params.section].path);
	},
	restore: async ({ params, platform, request }) => {
		const db = platform?.env.DB;
		if (!db) return fail(500, { errors: ['Database unavailable'] });
		if (!isHomepageSection(params.section)) return fail(404, { errors: ['Unknown section'] });
		const form = await request.formData();
		const revisionId = String(form.get('revisionId') ?? '');
		const result = await restoreRevision(
			db,
			params.section,
			params.id,
			revisionId,
			'Restored from history'
		);
		if (!result.ok) return fail(400, { errors: result.errors });
		throw redirect(303, editorPath(params.section, params.id));
	}
};
