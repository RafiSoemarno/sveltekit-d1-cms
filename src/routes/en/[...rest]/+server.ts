import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = ({ params, url }) => {
	const rest = params.rest ?? '';
	throw redirect(308, `/${rest}${url.search}`);
};
