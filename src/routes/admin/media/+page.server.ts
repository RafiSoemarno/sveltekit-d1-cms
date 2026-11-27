import { error, fail, redirect } from '@sveltejs/kit';
import { canDeleteMedia, deleteMedia, listMedia, mediaUsage, usageFor } from '$lib/server/media';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url, platform }) => {
	const db = platform?.env.DB;
	const bucket = platform?.env.MEDIA;
	if (!db || !bucket) throw error(500, 'Media bindings unavailable');

	const requestedType = url.searchParams.get('type');
	const type = requestedType === 'image' || requestedType === 'pdf' ? requestedType : 'all';
	const q = (url.searchParams.get('q') ?? '').trim().toLowerCase();
	const selectedKey = url.searchParams.get('asset');

	const [media, usage] = await Promise.all([listMedia(bucket), mediaUsage(db)]);
	const filtered = media.filter((asset) => {
		if (type === 'image' && !asset.contentType.startsWith('image/')) return false;
		if (
			type === 'pdf' &&
			asset.contentType !== 'application/pdf' &&
			!/\.pdf$/i.test(asset.filename)
		)
			return false;
		if (q && !asset.filename.toLowerCase().includes(q)) return false;
		return true;
	});

	const selected = selectedKey ? media.find((asset) => asset.key === selectedKey) : undefined;

	return {
		assets: filtered.map((asset) => ({
			...asset,
			usage: usageFor(usage, asset.key)
		})),
		total: media.length,
		type,
		q,
		selected: selected
			? {
					...selected,
					usage: usageFor(usage, selected.key),
					canDelete: canDeleteMedia(usageFor(usage, selected.key))
				}
			: null
	};
};

export const actions: Actions = {
	delete: async ({ request, platform }) => {
		const db = platform?.env.DB;
		const bucket = platform?.env.MEDIA;
		if (!db || !bucket) return fail(500, { errors: ['Media bindings unavailable'] });

		const form = await request.formData();
		const key = String(form.get('key') ?? '');
		const confirmed = form.get('confirm') === '1';
		if (!key) return fail(400, { errors: ['Asset key is missing.'] });

		const usage = usageFor(await mediaUsage(db), key);
		if (!canDeleteMedia(usage)) {
			return fail(400, {
				errors: [
					'This asset is still used by live content, a draft, or the site settings. Remove those references first.'
				],
				references: usage.references.filter((reference) => reference.kind !== 'revision')
			});
		}
		if (usage.revisions > 0 && !confirmed) {
			return fail(400, {
				errors: [
					`This asset is referenced by ${usage.revisions} revision${usage.revisions === 1 ? '' : 's'}. Deleting it will break those history snapshots.`
				],
				needsConfirmation: true,
				references: usage.references.filter((reference) => reference.kind === 'revision')
			});
		}

		await deleteMedia(bucket, key);
		throw redirect(303, '/admin/media');
	}
};
