import type { PageServerLoad } from './$types';

export const load = (() => {
	return {
		server: {
			node: process.version,
			pid: process.pid,
			platform: process.platform
		}
	};
}) satisfies PageServerLoad;
