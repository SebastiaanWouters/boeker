import { json } from '@sveltejs/kit';
import { download } from '@sebas/open-book-api';
import { env } from '$env/dynamic/private';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	const { id, type } = await request.json();
	const res = await download(id, type, env.API_KEY);
	return json(res);
};
