import { json } from '@sveltejs/kit';
import { PREVIEW_COOKIE, PREVIEW_TTL_SECONDS, createPreviewValue } from '$lib/server/preview';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, platform, cookies, url }) => {
	const isLocal = url.protocol === 'http:';
	const secret =
		platform?.env.PREVIEW_SECRET ??
		(isLocal && platform?.env.DEV_AUTH_EMAIL ? 'dev-preview-secret' : undefined);
	if (!secret) return json({ error: 'Preview is not configured.' }, { status: 500 });

	const form = await request.formData();
	const value = await createPreviewValue(secret);
	cookies.set(PREVIEW_COOKIE, value, {
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		secure: url.protocol === 'https:',
		maxAge: PREVIEW_TTL_SECONDS
	});

	return json({ ok: true, redirectTo: String(form.get('redirectTo') ?? '/') });
};
