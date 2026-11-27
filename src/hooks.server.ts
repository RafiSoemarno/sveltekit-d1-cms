import type { Handle } from '@sveltejs/kit';
import { localeFromPath } from '$lib/i18n/locale';
import { PREVIEW_COOKIE, verifyPreviewValue } from '$lib/server/preview';

const ADMIN_PREFIXES = ['/admin', '/api/admin'];

function isAdminPath(pathname: string): boolean {
	return ADMIN_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export const handle: Handle = async ({ event, resolve }) => {
	const env = event.platform?.env;
	const adminPath = isAdminPath(event.url.pathname);
	// `wrangler dev` rewrites the URL to the configured custom domain, so use the
	// protocol rather than the hostname to distinguish local HTTP from production HTTPS.
	const isLocal = event.url.protocol === 'http:';

	if (adminPath) {
		const headerEmail = event.request.headers.get('cf-access-authenticated-user-email');
		const email = headerEmail ?? (isLocal ? env?.DEV_AUTH_EMAIL : undefined);
		if (!email) {
			return new Response('Forbidden', {
				status: 403,
				headers: {
					'content-type': 'text/plain; charset=utf-8',
					'cache-control': 'private, no-store',
					'x-robots-tag': 'noindex'
				}
			});
		}
		event.locals.adminEmail = email;
	}

	const secret =
		env?.PREVIEW_SECRET ?? (isLocal && env?.DEV_AUTH_EMAIL ? 'dev-preview-secret' : undefined);
	event.locals.preview = await verifyPreviewValue(event.cookies.get(PREVIEW_COOKIE), secret);
	event.locals.locale = localeFromPath(event.url.pathname);

	const response = await resolve(event, {
		transformPageChunk: ({ html }) =>
			html.replace('<html lang="en">', `<html lang="${event.locals.locale}">`)
	});

	if (adminPath) {
		response.headers.set('cache-control', 'private, no-store');
		response.headers.set('x-robots-tag', 'noindex');
	} else if (event.locals.preview) {
		response.headers.set('cache-control', 'private, no-store');
		response.headers.set('x-robots-tag', 'noindex');
	}

	return response;
};
