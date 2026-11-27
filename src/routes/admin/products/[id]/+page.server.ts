import { error, fail, redirect } from '@sveltejs/kit';
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

function normalize(data: Record<string, unknown>): Record<string, unknown> {
	const result = structuredClone(data);
	result.gallery = Array.isArray(result.gallery) ? result.gallery : [];
	result.features = Array.isArray(result.features) ? result.features : [];
	result.brochures = Array.isArray(result.brochures) ? result.brochures : [];
	const seo =
		result.seo && typeof result.seo === 'object'
			? (result.seo as Record<string, unknown>)
			: { title: { en: '', id: '' }, description: { en: '', id: '' } };
	seo.title = seo.title && typeof seo.title === 'object' ? seo.title : { en: '', id: '' };
	seo.description =
		seo.description && typeof seo.description === 'object' ? seo.description : { en: '', id: '' };
	result.seo = seo;
	return result;
}

export const load: PageServerLoad = async ({ params, platform }) => {
	const db = platform?.env.DB;
	const bucket = platform?.env.MEDIA;
	if (!db || !bucket) throw error(500, 'CMS bindings unavailable');

	const item = await getAdminItem(db, 'products', params.id);
	if (!item) throw error(404, 'Product not found');

	const [revisions, media] = await Promise.all([
		getRevisions(db, 'products', params.id),
		listMedia(bucket)
	]);

	const data = normalize(item.data);
	data.slug = item.id;

	return {
		item: { ...item, data },
		revisions,
		media
	};
};

function nextSlug(paramsId: string, data: Record<string, unknown>): string {
	return typeof data.slug === 'string' && data.slug.trim() ? data.slug.trim() : paramsId;
}

export const actions: Actions = {
	save: async ({ request, params, platform }) => {
		const db = platform?.env.DB;
		if (!db) return fail(500, { errors: ['Database unavailable'] });
		const form = await request.formData();
		try {
			const data = parseData(form);
			const saved = await saveDraft(db, {
				collection: 'products',
				id: nextSlug(params.id, data),
				previousId: params.id,
				data,
				note: noteOf(form)
			});
			if (saved.id !== params.id) throw redirect(303, editorPath('products', saved.id));
			return { success: true, savedAt: new Date().toISOString() };
		} catch (saveError) {
			if (saveError instanceof AdminError) {
				return fail(400, { errors: [saveError.message] });
			}
			throw saveError;
		}
	},
	publish: async ({ request, params, platform }) => {
		const db = platform?.env.DB;
		if (!db) return fail(500, { errors: ['Database unavailable'] });
		const form = await request.formData();
		try {
			const data = parseData(form);
			const saved = await saveDraft(db, {
				collection: 'products',
				id: nextSlug(params.id, data),
				previousId: params.id,
				data,
				note: noteOf(form)
			});
			const result = await publishItem(db, 'products', saved.id, noteOf(form));
			if (!result.ok) return fail(400, { errors: result.errors });
			throw redirect(303, editorPath('products', saved.id));
		} catch (publishError) {
			if (publishError instanceof AdminError) {
				return fail(400, { errors: [publishError.message] });
			}
			throw publishError;
		}
	},
	unpublish: async ({ request, params, platform }) => {
		const db = platform?.env.DB;
		if (!db) return fail(500, { errors: ['Database unavailable'] });
		const form = await request.formData();
		const result = await unpublishItem(db, 'products', params.id, noteOf(form));
		if (!result.ok) return fail(400, { errors: result.errors });
		throw redirect(303, editorPath('products', params.id));
	},
	delete: async ({ request, params, platform }) => {
		const db = platform?.env.DB;
		if (!db) return fail(500, { errors: ['Database unavailable'] });
		const form = await request.formData();
		const result = await deleteItem(db, 'products', params.id, noteOf(form));
		if (!result.ok) return fail(400, { errors: result.errors });
		throw redirect(303, '/admin/products');
	},
	restore: async ({ request, params, platform }) => {
		const db = platform?.env.DB;
		if (!db) return fail(500, { errors: ['Database unavailable'] });
		const form = await request.formData();
		const revisionId = String(form.get('revisionId') ?? '');
		const result = await restoreRevision(
			db,
			'products',
			params.id,
			revisionId,
			'Restored from history'
		);
		if (!result.ok) return fail(400, { errors: result.errors });
		throw redirect(303, editorPath('products', params.id));
	}
};
