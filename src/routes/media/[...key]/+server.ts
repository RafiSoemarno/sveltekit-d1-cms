import type { RequestHandler } from './$types';

export const prerender = false;

export const GET: RequestHandler = async ({ params, platform }) => {
	const media = platform?.env.MEDIA;

	if (!media) {
		return new Response('Media storage unavailable', { status: 500 });
	}

	const object = await media.get(params.key);

	if (!object) {
		return new Response('Not found', { status: 404 });
	}

	const headers = new Headers();

	if (object.httpMetadata?.contentType) {
		headers.set('content-type', object.httpMetadata.contentType);
	}

	headers.set('etag', object.httpEtag);
	headers.set('cache-control', 'public, max-age=31536000, immutable');

	return new Response(object.body as unknown as ReadableStream, { headers });
};
