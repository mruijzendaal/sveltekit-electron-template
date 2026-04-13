import { getElectronPowerMonitor } from '$lib/power-monitor.remote';

import type { PageLoad } from './$types';

export const load = (async ({ data }) => {
	try {
		return {
			...data,
			powerMonitor: await getElectronPowerMonitor().run(),
			powerMonitorError: null
		};
	} catch (error) {
		return {
			...data,
			powerMonitor: null,
			powerMonitorError:
				error instanceof Error
					? error.message
					: 'Failed to load powerMonitor state.'
		};
	}
}) satisfies PageLoad;
