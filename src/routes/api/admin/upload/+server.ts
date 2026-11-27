import { json } from '@sveltejs/kit';
import { uploadMedia } from '$lib/server/media';
import type { RequestHandler } from './$types';

const IMAGE_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp']);
const IMAGE_LIMIT = 5 * 1024 * 1024;
const PDF_LIMIT = 20 * 1024 * 1024;

export const POST: RequestHandler = async ({ request, platform }) => {
	const bucket = platform?.env.MEDIA;
	if (!bucket) return json({ error: 'Media binding unavailable.' }, { status: 500 });

	const form = await request.formData();
	const file = form.get('file');
	if (!(file instanceof File)) {
		return json({ error: 'No file uploaded.' }, { status: 400 });
	}

	const contentType = String(form.get('contentType') ?? file.type);
	const filename = String(form.get('filename') ?? file.name);
	const isPdf = contentType === 'application/pdf';
	if (isPdf) {
		if (file.size > PDF_LIMIT)
			return json({ error: 'PDFs must be 20 MB or smaller.' }, { status: 400 });
	} else {
		if (!IMAGE_TYPES.has(contentType)) {
			return json({ error: 'Images must be PNG, JPEG, or WebP.' }, { status: 400 });
		}
		if (file.size > IMAGE_LIMIT) {
			return json({ error: 'Images must be 5 MB or smaller.' }, { status: 400 });
		}
	}

	const width = Number(form.get('width'));
	const height = Number(form.get('height'));

	try {
		const asset = await uploadMedia(
			bucket,
			await file.arrayBuffer(),
			contentType,
			filename,
			isPdf ? undefined : Number.isFinite(width) && width > 0 ? width : undefined,
			isPdf ? undefined : Number.isFinite(height) && height > 0 ? height : undefined
		);
		return json({ asset });
	} catch (error) {
		return json(
			{ error: error instanceof Error ? error.message : 'Upload failed.' },
			{ status: 400 }
		);
	}
};
