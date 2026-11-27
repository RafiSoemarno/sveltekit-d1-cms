import { redirect } from '@sveltejs/kit';
import { PREVIEW_COOKIE } from '$lib/server/preview';
import type { RequestHandler } from './$types';

function safeRedirect(value: FormDataEntryValue | null): string {
	const target = String(value ?? '/');
	return target.startsWith('/') && !target.startsWith('//') ? target : '/';
}

export const POST: RequestHandler = async ({ request, cookies, url }) => {
	const form = await request.formData();
	cookies.delete(PREVIEW_COOKIE, { path: '/', secure: url.protocol === 'https:' });
	throw redirect(303, safeRedirect(form.get('redirectTo')));
};
