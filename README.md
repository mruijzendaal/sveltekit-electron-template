# SvelteKit + Electron

This project follows the approach Rich Harris described in the linked Reddit thread: keep the
"server-side" logic inside SvelteKit and let Electron display it over HTTP instead of flattening the
app into static files.

## Architecture

- `npm run dev` starts the normal SvelteKit/Vite dev server and opens it in Electron.
- `npm run start` builds the app with `@sveltejs/adapter-node`, starts the generated Node server
  inside Electron, and opens that local URL in a `BrowserWindow`.
- `src/routes/+page.server.ts` demonstrates that server-only logic is running inside SvelteKit.

## Scripts

```sh
npm run dev
npm run check
npm run build
npm run start
```

## Files to know

- `electron/main.js` boots Electron and launches the bundled adapter-node server for production.
- `electron/preload.js` exposes a tiny, safe bridge with Electron version info.
- `src/routes/+page.server.ts` returns Node process details from the SvelteKit server runtime.
