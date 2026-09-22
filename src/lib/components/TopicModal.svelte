<script lang="ts">
	import Modal from './Modal.svelte';
	import Icon from './Icon.svelte';
	import { catalog, topics } from '$lib/checklist';
	let { open, selected, ontoggle, onclose }: { open: boolean; selected: string[]; ontoggle: (id: string) => void; onclose: () => void } = $props();
	let search = $state('');
	const groups = [...new Set(topics.map((topic) => topic.group))];
	let filtered = $derived(topics.filter((topic) => {
		const query = search.toLocaleLowerCase().trim();
		return `${topic.name} ${topic.description}`.toLocaleLowerCase().includes(query) || catalog.some((item) => topic.itemIds.includes(item.id) && item.name.toLocaleLowerCase().includes(query));
	}));
	$effect(() => { if (open) search = ''; });
</script>

<Modal {open} title="What kind of adventure?" description="Mix a few packs to make a list that feels like you. Overlapping items are automatically combined." wide {onclose}>
	<label class="search-field mb-5"><Icon name="search" size={17} /><input bind:value={search} placeholder="Search beach, skiing, laptop…" aria-label="Search topic packs" /></label>
	<div class="space-y-6">
		{#each groups as group}
			{@const groupTopics = filtered.filter((topic) => topic.group === group)}
			{#if groupTopics.length}
				<section><h3 class="eyebrow mb-3">{group}</h3><div class="grid gap-2 sm:grid-cols-2">
					{#each groupTopics as topic}
						{@const active = selected.includes(topic.id)}
						<button class="topic-option flex items-start gap-3 rounded-xl border p-4 text-left transition-colors {active ? 'border-[#bdcba7] bg-[#f0f3e6]' : 'border-line hover:bg-canvas'}" aria-pressed={active} onclick={() => ontoggle(topic.id)}>
							<span class="tint-{topic.color} grid size-9 shrink-0 place-items-center rounded-lg"><Icon name={topic.icon} size={18} /></span>
							<span class="min-w-0 flex-1"><span class="block text-xs font-semibold">{topic.name}</span><span class="mt-1 block text-[10px] leading-relaxed text-muted">{topic.description}</span><span class="mt-2 block text-[10px] font-medium text-forest">{topic.itemIds.length} suggestions</span></span>
							<span class="topic-choice mt-1 grid size-5 shrink-0 place-items-center rounded-full {active ? 'bg-forest text-white' : 'border border-line text-muted'}"><Icon name={active ? 'check' : 'plus'} size={12} /></span>
						</button>
					{/each}
				</div></section>
			{/if}
		{/each}
	</div>
	{#if !filtered.length}<p class="py-10 text-center text-sm text-muted">No packs found. Try a different activity or item.</p>{/if}
	<div class="sticky -bottom-6 -mx-5 mt-5 flex items-center justify-between gap-3 border-t border-line bg-paper px-5 py-4 sm:-mx-7 sm:px-7"><span class="text-[11px] text-muted">{selected.length} packs selected</span><button class="button-dark" onclick={onclose}>All set <Icon name="check" size={15} /></button></div>
	<p class="mt-2 text-[10px] leading-relaxed text-muted">Removing a pack keeps items shared with another selected pack, plus anything you added manually.</p>
</Modal>
