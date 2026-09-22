<script lang="ts">
	import Icon from './Icon.svelte';
	import { formatDeparture } from '$lib/checklist';
	import type { Trip } from '$lib/types';
	let { trip, mode, onedit }: { trip: Trip; mode: 'builder' | 'packing'; onedit: () => void } = $props();
</script>

<section class="relative rounded-2xl border border-line bg-paper px-5 py-5 sm:px-6" aria-label="Trip details">
	<div class="flex items-center justify-between gap-3">
		<div class="flex items-center gap-2 text-[10px] font-semibold tracking-[.15em] text-muted"><span class="size-1.5 rounded-full bg-terracotta"></span> YOUR NEXT ADVENTURE</div>
		<button class="button-quiet -mr-2 -mt-2 min-h-9 gap-1.5 px-2 text-[11px]" onclick={onedit}><Icon name="edit" size={13} /><span>Edit trip</span></button>
	</div>
	<div class="mt-2 flex flex-wrap items-center justify-between gap-4">
		<div class="min-w-0">
			<h2 class="break-words font-display text-[28px] leading-tight sm:text-[32px]">{trip.name}</h2>
			<div class="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] text-muted">
				<span class="flex items-center gap-1.5"><Icon name="pin" size={14} />{trip.destination || 'Somewhere wonderful'}</span>
				<span class="flex items-center gap-1.5"><Icon name="calendar" size={14} />{trip.departure ? formatDeparture(trip.departure) : `${trip.days} days of adventure`}</span>
				{#if trip.departure}<span>{trip.days} {trip.days === 1 ? 'day' : 'days'}</span>{/if}
			</div>
		</div>
		<span class="inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-[10px] font-medium {mode === 'builder' ? 'border-[#e7dfc7] bg-[#f8f2df] text-[#80713d]' : 'border-[#d5dfc8] bg-[#ecf1e5] text-forest'}"><span class="size-1.5 rounded-full {mode === 'builder' ? 'bg-[#b3a061]' : 'bg-forest'}"></span>{mode === 'builder' ? 'Making plans' : 'Packing time'}</span>
	</div>
</section>
