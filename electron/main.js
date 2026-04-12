import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { createServer } from 'node:net';
import { join } from 'node:path';

import { app, BrowserWindow } from 'electron';

const DEV_SERVER_URL = process.env.ELECTRON_RENDERER_URL;
const HOST = '127.0.0.1';
const SERVER_START_TIMEOUT_MS = 15_000;

let serverProcess;
let serverUrlPromise;
let isQuitting = false;

function getBuildEntry() {
	return join(app.getAppPath(), 'build', 'index.js');
}

function getPreloadPath() {
	return join(app.getAppPath(), 'electron', 'preload.js');
}

function getAvailablePort() {
	return new Promise((resolve, reject) => {
		const server = createServer();

		server.unref();
		server.on('error', reject);
		server.listen(0, HOST, () => {
			const address = server.address();

			if (!address || typeof address === 'string') {
				reject(new Error('Could not determine an open port for the SvelteKit server.'));
				return;
			}

			server.close(() => resolve(address.port));
		});
	});
}

function sleep(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForServer(url) {
	const deadline = Date.now() + SERVER_START_TIMEOUT_MS;

	while (Date.now() < deadline) {
		try {
			const response = await fetch(url);

			if (response.ok || response.status < 500) {
				return;
			}
		} catch {
			// Keep polling until the server is reachable or we time out.
		}

		await sleep(250);
	}

	throw new Error(`Timed out waiting for the SvelteKit server at ${url}.`);
}

function stopSvelteKitServer() {
	if (serverProcess && !serverProcess.killed) {
		serverProcess.kill();
	}

	serverProcess = undefined;
	serverUrlPromise = undefined;
}

async function startSvelteKitServer() {
	const buildEntry = getBuildEntry();

	if (!existsSync(buildEntry)) {
		throw new Error('SvelteKit build output was not found. Run "npm run build" before "npm run start".');
	}

	const port = await getAvailablePort();
	const origin = `http://${HOST}:${port}`;

	serverProcess = spawn(process.execPath, [buildEntry], {
		env: {
			...process.env,
			ELECTRON_RUN_AS_NODE: '1',
			HOST,
			ORIGIN: origin,
			PORT: String(port)
		},
		stdio: 'inherit'
	});

	serverProcess.once('exit', (code, signal) => {
		serverProcess = undefined;
		serverUrlPromise = undefined;

		if (!isQuitting) {
			console.error(
				`The bundled SvelteKit server exited unexpectedly (code: ${code ?? 'null'}, signal: ${signal ?? 'null'}).`
			);
			app.quit();
		}
	});

	await waitForServer(origin);

	return origin;
}

function getAppUrl() {
	if (DEV_SERVER_URL) {
		return Promise.resolve(DEV_SERVER_URL);
	}

	serverUrlPromise ??= startSvelteKitServer();
	return serverUrlPromise;
}

async function createMainWindow() {
	const window = new BrowserWindow({
		width: 1200,
		height: 820,
		minWidth: 960,
		minHeight: 640,
		title: 'SvelteKit + Electron',
		webPreferences: {
			contextIsolation: true,
			nodeIntegration: false,
			preload: getPreloadPath()
		}
	});

	const appUrl = await getAppUrl();
	await window.loadURL(appUrl);

	if (DEV_SERVER_URL) {
		window.webContents.openDevTools({ mode: 'detach' });
	}
}

async function boot() {
	try {
		await createMainWindow();
	} catch (error) {
		console.error(error);
		app.quit();
	}
}

app.on('before-quit', () => {
	isQuitting = true;
	stopSvelteKitServer();
});

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

app.whenReady().then(async () => {
	await boot();

	app.on('activate', async () => {
		if (BrowserWindow.getAllWindows().length === 0) {
			await boot();
		}
	});
});
