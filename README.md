# SvelteKit + Electron

This project follows the approach [described by Rich Harris](https://www.reddit.com/r/sveltejs/comments/1kt7jfe/comment/mtuia6m): keep the
"server-side" logic inside SvelteKit and let Electron display it over HTTP instead of flattening the
app into static files.

## Architecture

- `npm run dev` starts Vite from inside Electron and opens the local dev URL in a `BrowserWindow`.
- `npm run start` builds the app with `@sveltejs/adapter-node`, imports the generated
  `build/handler.js` file inside Electron, and serves it with `http.createServer(...)`.
- `src/routes/+page.server.ts` demonstrates that server-only logic is running inside SvelteKit.
- Electron APIs are exposed directly to SvelteKit server files through
  `globalThis.__electronServer`, which matches the workaround Rich mentioned.

## Scripts

```sh
npm run dev
npm run check
npm run build
npm run package:mac
npm run package:win
npm run start
```

## Packaging for macOS

Run the packaging build with:

```sh
npm run package:mac
```

This writes an unsigned `.app` bundle to `dist/mac*/Svelte Electron.app`, ready to copy to another
Mac.

Because the bundle is unsigned, macOS Gatekeeper may still warn when it is opened on another Mac.
For a frictionless double-click install, you would need to add Apple code signing and notarization.

## Packaging for Windows

Run the packaging build with:

```sh
npm run package:win
```

This writes an unsigned unpacked Windows app to `dist/win-*-unpacked/`, ready to copy to a Windows
machine. On Apple silicon Macs, the default output is `dist/win-arm64-unpacked/`.

Because the build is unsigned, Windows SmartScreen may still warn when it is launched. For a
frictionless install, you would need to add Windows code signing. The Windows build also disables
`rcedit` metadata/signing edits so it can be cross-built from macOS without requiring a local Wine
setup.

## Files to know

- `electron/main.js` boots Electron and hosts either the Vite dev server or the built SvelteKit
  handler in-process.
- `electron/preload.js` exposes a tiny, safe bridge with Electron version info.
- `src/routes/+page.server.ts` returns Node process details from the SvelteKit server runtime.
- `src/lib/server/electron.ts` provides typed access to the Electron APIs exposed on `globalThis`.
- `src/lib/power-monitor.remote.ts` shows a SvelteKit remote function that reads Electron
  `powerMonitor` state directly from the raw in-process Electron API.
