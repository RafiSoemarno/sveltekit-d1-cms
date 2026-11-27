import { json, redirect } from '@sveltejs/kit';
import { publishItem } from '$lib/server/admin-content';
import type { RequestHandler } from './$types';

function safeRedirect(value: FormDataEntryValue | null): string {
	const target = String(value ?? '/');
	return target.startsWith('/') && !target.startsWith('//') ? target : '/';
}

export const POST: RequestHandler = async ({ request, platform }) => {
	const db = platform?.env.DB;
	if (!db) return json({ error: 'Database unavailable.' }, { status: 500 });

	const form = await request.formData();
	const id = String(form.get('id') ?? '');
	if (!id) return json({ error: 'Product id is required.' }, { status: 400 });

	const result = await publishItem(db, 'products', id, 'Published from preview');
	if (!result.ok) return json({ error: result.errors.join(' ') }, { status: 400 });

	throw redirect(303, safeRedirect(form.get('redirectTo')));
};
