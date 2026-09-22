<script lang="ts">
	let { name, size = 20, class: className = '', strokeWidth = 1.7 }: {
		name: string; size?: number; class?: string; strokeWidth?: number;
	} = $props();

	const paths: Record<string, string[]> = {
		check: ['m5 12 4 4L19 6'], plus: ['M12 5v14M5 12h14'], x: ['m6 6 12 12M6 18 18 6'],
		arrow: ['M4 12h16m-6-6 6 6-6 6'], back: ['M20 12H4m6-6-6 6 6 6'],
		chevron: ['m9 5 7 7-7 7'], down: ['m6 9 6 6 6-6'],
		search: ['M21 21l-5-5', 'M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0'],
		bag: ['M5 7h14l2 14H3L5 7Z', 'M8 8V5a4 4 0 0 1 8 0v3'],
		case: ['M8 5V3h8v2M6 5h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2ZM8 9v8M16 9v8M8 21v1M16 21v1'],
		passport: ['M5 3h13a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H5V3Z', 'M15.5 10a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0M8.5 10h7M12 6.5c-2 2-2 5 0 7 2-2 2-5 0-7M9 17h6'],
		shirt: ['m8 3-6 4 3 5 3-2v11h8V10l3 2 3-5-6-4c0 4-8 4-8 0Z'],
		shoe: ['M4 4h4v6l5 4 7 2a2 2 0 0 1 1 2v3H3V7l1-3ZM3 17h9m0-5-2 3m5-1-2 3'],
		bottle: ['M9 2h6v4H9zM8 6h8l2 4v11H6V10l2-4ZM6 12h12M10 16h4'],
		medical: ['M9 7V3h6v4M4 7h16v14H4zM12 11v6m-3-3h6'],
		laptop: ['M4 3h16v13H4zM2 20l2-4h16l2 4H2Zm7 0h6'],
		sun: ['M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M19 5l-1.5 1.5m-11 11L5 19'],
		plane: ['m22 2-7 20-4-9-9-4L22 2Zm0 0L11 13M2 22l4-4'],
		mountain: ['m2 20 7-14 4 8 3-5 6 11H2Zm4-8 3 2 2-4'],
		snow: ['M12 2v20M3.3 7l17.4 10M3.3 17 20.7 7M9 3l3 3 3-3M9 21l3-3 3 3M3 10l4-1-1-4m12 14-1-4 4-1M3 14l4 1-1 4M18 5l-1 4 4 1'],
		activity: ['M2 12h5l3-8 4 16 3-8h5'],
		coffee: ['M4 8h13v8a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V8Zm13 1h2a3 3 0 0 1 0 6h-2M7 2v3m4-3v3m4-3v3'],
		heart: ['M20.8 4.6a5.5 5.5 0 0 0-7.8 0l-1 1-1-1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z'],
		paw: ['M8 13c-1 2-5 5-2 7 2 2 4-1 6-1s4 3 6 1c3-2-1-5-2-7s-6-2-8 0ZM8 6a2 3 0 1 1-4 0 2 3 0 0 1 4 0Zm6-2a2 3 0 1 1-4 0 2 3 0 0 1 4 0Zm6 2a2 3 0 1 1-4 0 2 3 0 0 1 4 0ZM4 12a1.5 2 0 1 1-3 0 1.5 2 0 0 1 3 0m19 0a1.5 2 0 1 1-3 0 1.5 2 0 0 1 3 0'],
		car: ['m5 4-3 9v7h3v-3h14v3h3v-7l-3-9H5Zm-3 9h20M6 13l1-6h10l1 6M6 15h1m10 0h1'],
		sparkles: ['m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3ZM20 2v4m-2-2h4'],
		rain: ['M6 13a4 4 0 1 1 0-8 6 6 0 0 1 11-1 4.5 4.5 0 0 1 1 9M7 16l-1 3m6-3-1 5m6-5-1 3'],
		plug: ['M8 2v5m8-5v5M6 7h12v4a6 6 0 0 1-12 0V7Zm6 10v5'],
		tent: ['m12 3 10 18H2L12 3Zm0 8-5 10h10l-5-10Zm0-8 2-2m-2 2-2-2'],
		building: ['M3 21V8h8v13M11 21V3h10v18M1 21h22M6 11h2m-2 4h2M14 7h4m-4 4h4m-4 4h4m-4 4h4'],
		briefcase: ['M8 6V3h8v3M3 6h18v15H3V6Zm0 6c6 3 12 3 18 0M10 13h4v3h-4z'],
		camera: ['m8 5 2-3h4l2 3h5v16H3V5h5Zm8 8a4 4 0 1 1-8 0 4 4 0 0 1 8 0'],
		waves: ['M2 6q3-4 6 0t6 0 6 0M2 12q3-4 6 0t6 0 6 0M2 18q3-4 6 0t6 0 6 0'],
		bike: ['M9 16a4 4 0 1 1-8 0 4 4 0 0 1 8 0Zm14 0a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM5 16l5-9 5 9H5Zm5-9h7l2 9M8 4h4m5 3-1-4h3'],
		globe: ['M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0ZM2 12h20M12 2c-6 5-6 15 0 20 6-5 6-15 0-20Z'],
		pin: ['M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Zm-5 0a3 3 0 1 1-6 0 3 3 0 0 1 6 0'],
		calendar: ['M5 4h14a2 2 0 0 1 2 2v15H3V6a2 2 0 0 1 2-2ZM7 2v4m10-4v4M3 10h18M7 14h2m4 0h2m-8 4h2'],
		lock: ['M6 10h12v12H6V10Zm2 0V6a4 4 0 0 1 8 0v4m-4 5v3'],
		edit: ['m16 3 5 5-12 12-6 1 1-6L16 3Zm-2 2 5 5'],
		trash: ['M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7m4-7v7'],
		minus: ['M5 12h14'],
		list: ['M9 5h12M9 12h12M9 19h12M3 5h1m-1 7h1m-1 7h1'],
		grid: ['M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z'],
		reset: ['M3 10a9 9 0 1 1 1 8M3 3v7h7'],
		alert: ['m12 3 10 18H2L12 3Zm0 6v5m0 3v1'],
		download: ['M12 3v12m-5-5 5 5 5-5M3 16v5h18v-5'],
		clock: ['M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0ZM12 6v6l4 2']
	};
</script>

<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width={strokeWidth} stroke-linecap="round" stroke-linejoin="round" class={className} aria-hidden="true">
	{#each paths[name] ?? paths.bag as path}
		<path d={path} />
	{/each}
</svg>
