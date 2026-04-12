interface ElectronAppApi {
	platform: NodeJS.Platform;
	versions: {
		chrome: string;
		electron: string;
		node: string;
	};
}

// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	interface Window {
		electronApp?: ElectronAppApi;
	}

	namespace App {
		// interface Error {}
		// interface Locals {}
		interface PageData {
			server?: {
				node: string;
				pid: number;
				platform: NodeJS.Platform;
			};
		}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
