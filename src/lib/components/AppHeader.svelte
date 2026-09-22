<script lang="ts">
	import Icon from './Icon.svelte';
	let { tripCount, ontrips, onnew }: { tripCount: number; ontrips: () => void; onnew: () => void } = $props();
</script>

<header class="border-b border-line bg-canvas">
	<div class="mx-auto flex h-21 max-w-7xl items-center justify-between gap-4 px-5 sm:px-8 lg:px-12">
		<a href="#main" class="flex items-center gap-2.5 text-forest" aria-label="Roam, your travel checklist">
			<span class="grid size-9 place-items-center rounded-xl bg-forest text-lime"><Icon name="case" size={23} /></span>
			<span class="font-display text-[32px] font-semibold tracking-[-.8px]">roam<span class="text-terracotta">.</span></span>
		</a>
		<p class="ml-10 hidden text-[10px] font-semibold tracking-[.19em] text-muted lg:block">LESS TO REMEMBER. MORE TO EXPLORE.</p>
		<nav aria-label="Trips" class="flex items-center gap-2 sm:gap-3">
			<button class="button-quiet gap-2 text-xs sm:text-sm" onclick={ontrips}><Icon name="bag" size={17} /> My trips <span class="rounded-md bg-sand px-1.5 py-0.5 text-[10px]">{tripCount}</span></button>
			<button class="button-dark min-h-10 px-3 text-xs sm:px-4 sm:text-sm" onclick={onnew}><Icon name="plus" size={16} /><span class="hidden sm:inline">New trip</span><span class="sm:hidden">New</span></button>
		</nav>
	</div>
</header>
