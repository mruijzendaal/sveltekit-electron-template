<script lang="ts">
	import { onMount } from 'svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const electronApp = typeof window === 'undefined' ? undefined : window.electronApp;
	let currentDate = $state<string | null>(null);
	let dateError = $state<string | null>(null);
	let isLoadingDate = $state(false);

	function formatCurrentDate(value: string) {
		return new Intl.DateTimeFormat(undefined, {
			dateStyle: 'full',
			timeStyle: 'long'
		}).format(new Date(value));
	}

	async function fetchCurrentDate() {
		isLoadingDate = true;
		dateError = null;

		try {
			const response = await fetch('/api/current-date');

			if (!response.ok) {
				throw new Error(`Date request failed with status ${response.status}.`);
			}

			const payload = (await response.json()) as { currentDate: string };
			currentDate = payload.currentDate;
		} catch (error) {
			dateError = error instanceof Error ? error.message : 'Date request failed.';
		} finally {
			isLoadingDate = false;
		}
	}

	async function refreshCurrentDate() {
		await fetchCurrentDate();
	}

	onMount(() => {
		void fetchCurrentDate();
	});
</script>

<svelte:head>
	<title>SvelteKit + Electron</title>
</svelte:head>

<div class="shell">
	<div class="hero">
		<p class="eyebrow">Electron + SvelteKit</p>
		<h1>Adapter-node inside Electron</h1>
		<p class="lede">
			This starter keeps server-side logic in SvelteKit and lets Electron load it over
			localhost, which matches the approach Rich Harris described in the Reddit thread.
		</p>
	</div>

	<div class="grid">
		<section class="card">
			<h2>Electron process</h2>
			<dl>
				<dt>Platform</dt>
				<dd>{electronApp?.platform ?? 'unavailable'}</dd>
				<dt>Electron</dt>
				<dd>{electronApp?.versions.electron ?? 'unavailable'}</dd>
				<dt>Chrome</dt>
				<dd>{electronApp?.versions.chrome ?? 'unavailable'}</dd>
			</dl>
		</section>

		<section class="card">
			<h2>SvelteKit server</h2>
			<dl>
				<dt>Node</dt>
				<dd>{data.server?.node ?? 'unavailable'}</dd>
				<dt>Platform</dt>
				<dd>{data.server?.platform ?? 'unavailable'}</dd>
				<dt>PID</dt>
				<dd>{data.server?.pid ?? 'unavailable'}</dd>
			</dl>
		</section>
	</div>

	<section class="card date-card">
		<div class="date-card__header">
			<div>
				<h2>Server function</h2>
				<p class="muted">Fetched from <code>/api/current-date</code> inside SvelteKit.</p>
			</div>
			<button type="button" onclick={refreshCurrentDate} disabled={isLoadingDate}>
				{isLoadingDate ? 'Loading...' : 'Refresh date'}
			</button>
		</div>

		{#if dateError}
			<p class="error">{dateError}</p>
		{:else if currentDate}
			<dl>
				<dt>Formatted</dt>
				<dd>{formatCurrentDate(currentDate)}</dd>
				<dt>ISO</dt>
				<dd>{currentDate}</dd>
			</dl>
		{:else}
			<p class="muted">Waiting for the SvelteKit server to reply...</p>
		{/if}
	</section>

	<section class="card steps">
		<h2>Run it</h2>
		<ol>
			<li><code>npm run dev</code> starts Vite and opens Electron.</li>
			<li><code>npm run start</code> builds SvelteKit with <code>@sveltejs/adapter-node</code> and opens the bundled server in Electron.</li>
		</ol>
	</section>
</div>

<style>
	:global(body) {
		margin: 0;
		font-family:
			Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
		background:
			radial-gradient(circle at top, rgb(29 78 216 / 0.35), transparent 36%),
			linear-gradient(180deg, #0f172a 0%, #020617 100%);
		color: #e2e8f0;
		min-height: 100vh;
	}

	.shell {
		max-width: 960px;
		margin: 0 auto;
		padding: 4rem 1.5rem;
	}

	.hero {
		margin-bottom: 2rem;
	}

	.eyebrow {
		text-transform: uppercase;
		letter-spacing: 0.16em;
		font-size: 0.75rem;
		color: #93c5fd;
		margin: 0 0 0.75rem;
	}

	h1,
	h2,
	p {
		margin: 0;
	}

	h1 {
		font-size: clamp(2.25rem, 5vw, 4rem);
		line-height: 1;
		margin-bottom: 1rem;
	}

	.lede {
		max-width: 42rem;
		font-size: 1.05rem;
		line-height: 1.6;
		color: #cbd5e1;
	}

	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
		gap: 1rem;
		margin-bottom: 1rem;
	}

	.card {
		background: rgb(15 23 42 / 0.72);
		border: 1px solid rgb(148 163 184 / 0.18);
		border-radius: 1rem;
		padding: 1.25rem;
		box-shadow: 0 20px 45px rgb(2 6 23 / 0.28);
		backdrop-filter: blur(16px);
	}

	.date-card {
		margin-bottom: 1rem;
	}

	.date-card__header {
		display: flex;
		gap: 1rem;
		align-items: flex-start;
		justify-content: space-between;
		margin-bottom: 1rem;
	}

	h2 {
		font-size: 1.1rem;
		margin-bottom: 1rem;
	}

	dl {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: 0.75rem 1rem;
		margin: 0;
	}

	dt {
		color: #94a3b8;
	}

	dd {
		margin: 0;
		font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
	}

	button {
		border: 0;
		border-radius: 999px;
		padding: 0.7rem 1rem;
		background: linear-gradient(135deg, #60a5fa, #2563eb);
		color: white;
		font: inherit;
		font-weight: 600;
		cursor: pointer;
		transition:
			transform 120ms ease,
			opacity 120ms ease;
	}

	button:hover:enabled {
		transform: translateY(-1px);
	}

	button:disabled {
		cursor: progress;
		opacity: 0.75;
	}

	.muted {
		color: #94a3b8;
	}

	.error {
		color: #fca5a5;
	}

	.steps ol {
		margin: 0;
		padding-left: 1.25rem;
		color: #cbd5e1;
	}

	.steps code {
		font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
	}

	@media (max-width: 640px) {
		.date-card__header {
			flex-direction: column;
		}
	}
</style>
