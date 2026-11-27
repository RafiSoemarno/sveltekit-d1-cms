import { error } from '@sveltejs/kit';
import { getCounts, listDrafts } from '$lib/server/admin-content';
import { listMedia } from '$lib/server/media';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ platform }) => {
	const db = platform?.env.DB;
	const bucket = platform?.env.MEDIA;
	if (!db || !bucket) throw error(500, 'CMS bindings unavailable');

	const [counts, drafts, media] = await Promise.all([
		getCounts(db),
		listDrafts(db),
		listMedia(bucket)
	]);

	const settings = await db
		.prepare(`SELECT updated_at FROM site_settings WHERE id = 'site' LIMIT 1`)
		.first<{ updated_at: string }>();

	return {
		counts,
		drafts,
		mediaCount: media.length,
		settingsUpdatedAt: settings?.updated_at ?? null
	};
};
