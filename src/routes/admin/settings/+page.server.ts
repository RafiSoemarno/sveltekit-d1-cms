import { error, fail } from '@sveltejs/kit';
import { getSiteSettings } from '$lib/server/content';
import { saveSettings } from '$lib/server/admin-content';
import { listMedia } from '$lib/server/media';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ platform }) => {
	const db = platform?.env.DB;
	const bucket = platform?.env.MEDIA;
	if (!db || !bucket) throw error(500, 'CMS bindings unavailable');
	const [settings, media] = await Promise.all([getSiteSettings(db), listMedia(bucket)]);
	return { settings, media };
};

export const actions: Actions = {
	save: async ({ request, platform }) => {
		const db = platform?.env.DB;
		if (!db) return fail(500, { errors: ['Database unavailable'] });
		const form = await request.formData();
		const raw = form.get('data');
		if (typeof raw !== 'string' || !raw)
			return fail(400, { errors: ['Settings payload is missing.'] });
		try {
			const parsed = JSON.parse(raw);
			const result = await saveSettings(db, parsed);
			if (!result.ok) return fail(400, { errors: result.errors });
			return { success: true };
		} catch {
			return fail(400, { errors: ['Settings payload is invalid.'] });
		}
	}
};
