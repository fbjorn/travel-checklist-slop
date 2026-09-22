<script lang="ts">
	import Modal from './Modal.svelte';
	import Icon from './Icon.svelte';
	import { formatDeparture, progress } from '$lib/checklist';
	import type { Trip } from '$lib/types';
	let { open, trips, draft, activeId, onopen, ondraft, ondelete, onnew, onclose }: {
		open: boolean; trips: Trip[]; draft: Trip | null; activeId: string | null;
		onopen: (trip: Trip) => void; ondraft: () => void; ondelete: (id: string) => void;
		onnew: () => void; onclose: () => void;
	} = $props();
</script>

<Modal {open} title="Places to go. Lists to make." description="Your trips live right here, on this browser and device." {onclose}>
	{#if draft}
		<button class="mb-4 flex w-full items-center gap-3 rounded-xl border border-dashed border-[#babf9e] bg-[#f3f3e7] p-4 text-left" onclick={ondraft}><span class="grid size-10 shrink-0 place-items-center rounded-xl bg-[#e8eaca] text-forest"><Icon name="edit" size={19} /></span><span class="min-w-0 flex-1"><span class="eyebrow text-[9px]">CONTINUE BUILDING</span><span class="mt-1 block truncate text-sm font-semibold">{draft.name}</span></span><Icon name="arrow" size={17} /></button>
	{/if}
	<div class="space-y-3">
		{#each trips as trip (trip.id)}
			{@const summary = progress(trip.items)}
			<div class="overflow-hidden rounded-xl border border-line">
				<button class="w-full p-4 text-left transition-colors hover:bg-canvas" onclick={() => onopen(trip)}>
					<div class="flex items-center justify-between gap-3"><h3 class="min-w-0 truncate text-sm font-semibold">{trip.name}</h3>{#if trip.id === activeId}<span class="rounded-full bg-[#edf2df] px-2 py-1 text-[9px] text-forest">OPEN</span>{:else}<Icon name="chevron" size={16} />{/if}</div>
					<p class="mt-1.5 text-[11px] text-muted">{trip.destination || 'An adventure awaits'} · {trip.days} {trip.days === 1 ? 'day' : 'days'}</p>
					<div class="mt-4 flex items-center gap-3"><div class="h-1.5 flex-1 overflow-hidden rounded-full bg-canvas"><div class="h-full rounded-full bg-forest" style:width={`${summary.percent}%`}></div></div><span class="text-[10px] text-muted">{summary.packed}/{summary.total} packed</span></div>
				</button>
				<div class="flex items-center justify-between border-t border-line px-4 py-1"><span class="text-[10px] text-muted">{formatDeparture(trip.departure)}</span><button class="icon-button text-muted hover:text-terracotta" aria-label={`Delete ${trip.name}`} onclick={() => ondelete(trip.id)}><Icon name="trash" size={14} /></button></div>
			</div>
		{:else}
			<div class="py-7 text-center"><span class="mx-auto grid size-14 place-items-center rounded-2xl bg-sand text-forest"><Icon name="case" size={28} /></span><h3 class="mt-4 font-display text-2xl">Adventures go here.</h3><p class="mx-auto mt-2 max-w-65 text-xs leading-relaxed text-muted">Save your first checklist and it will be waiting here whenever you’re ready to pack.</p></div>
		{/each}
	</div>
	<button class="button-dark mt-5 w-full" onclick={onnew}><Icon name="plus" size={16} /> Plan another trip</button>
</Modal>
