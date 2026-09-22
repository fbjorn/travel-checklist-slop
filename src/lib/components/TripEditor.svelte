<script lang="ts">
	import Modal from './Modal.svelte';
	import Icon from './Icon.svelte';
	import defaults from '$lib/data/defaults.json';
	import type { Trip, TripDetails } from '$lib/types';
	let { open, trip, creating = false, hasDraft = false, onsave, onclose }: {
		open: boolean; trip: Trip; creating?: boolean; hasDraft?: boolean;
		onsave: (details: TripDetails, starter: boolean) => void; onclose: () => void;
	} = $props();
	let name = $state('');
	let destination = $state('');
	let departure = $state('');
	let days = $state<number | undefined>(7);
	let starter = $state(true);
	$effect(() => {
		if (open) {
			name = creating ? '' : trip.name;
			destination = creating ? '' : trip.destination;
			departure = creating ? '' : trip.departure;
			days = creating ? defaults.days : trip.days;
			starter = true;
		}
	});
	function submit(event: SubmitEvent) {
		event.preventDefault();
		if (!name.trim() || !days || !Number.isInteger(days) || days < 1 || days > 365) return;
		onsave({ name: name.trim(), destination: destination.trim(), departure, days }, starter);
	}
</script>

<Modal {open} title={creating ? 'Where to next?' : 'A trip to look forward to.'} description={creating ? 'Give your next adventure a name. The rest starts with a good list.' : 'Just a few details to make this list your own.'} {onclose}>
	<form onsubmit={submit} class="space-y-5">
		<label class="form-label">Trip name<input class="field mt-2" bind:value={name} placeholder="A week by the sea" required maxlength="80" /></label>
		<label class="form-label">Destination <span class="font-normal text-muted">· optional</span><input class="field mt-2" bind:value={destination} placeholder="Somewhere wonderful" maxlength="100" /></label>
		<div class="grid grid-cols-[1fr_110px] gap-3">
			<label class="form-label">Departure <span class="font-normal text-muted">· optional</span><input type="date" class="field mt-2 min-w-0" bind:value={departure} max="9999-12-31" /></label>
			<label class="form-label">Days away<input type="number" class="field mt-2" bind:value={days} min="1" max="365" step="1" required /></label>
		</div>
		{#if creating}
			<fieldset><legend class="form-label mb-2">Start with</legend><div class="grid grid-cols-2 gap-2">
				<button type="button" class="rounded-xl border p-4 text-left {starter ? 'border-[#bacba4] bg-[#f0f3e7]' : 'border-line'}" aria-pressed={starter} onclick={() => starter = true}><Icon name="sun" class="mb-2 text-terracotta" /><span class="block text-xs font-semibold">A sunny-day starter</span><span class="mt-1 block text-[10px] text-muted">Essentials, beach & warm weather</span></button>
				<button type="button" class="rounded-xl border p-4 text-left {!starter ? 'border-[#bacba4] bg-[#f0f3e7]' : 'border-line'}" aria-pressed={!starter} onclick={() => starter = false}><Icon name="list" class="mb-2 text-forest" /><span class="block text-xs font-semibold">A blank canvas</span><span class="mt-1 block text-[10px] text-muted">Build your own from the ground up</span></button>
			</div></fieldset>
			{#if hasDraft}<p class="rounded-lg bg-sand p-3 text-[11px] leading-relaxed text-muted">This replaces your current draft. Your saved trips will stay in My trips.</p>{/if}
		{/if}
		<button class="button-dark w-full" type="submit" disabled={!name.trim() || !days}>{creating ? 'Let’s make a list' : 'Save trip details'}<Icon name="arrow" size={16} /></button>
	</form>
</Modal>
