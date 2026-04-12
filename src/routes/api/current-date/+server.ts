import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET = (() => {
	const now = new Date();

	return json({
		currentDate: now.toISOString()
	});
}) satisfies RequestHandler;
