<script lang="ts">
	import Icon from './Icon.svelte';
	import { topics } from '$lib/checklist';
	let { selected, ontoggle, onbrowse }: { selected: string[]; ontoggle: (id: string) => void; onbrowse: () => void } = $props();
	const featured = ['essentials', 'beach', 'summer', 'remote-work', 'winter', 'skiing'];
	let visibleTopics = $derived(featured.map((id) => topics.find((topic) => topic.id === id)!));
</script>

<section class="rounded-2xl border border-line bg-paper p-5 sm:p-6" aria-labelledby="topic-title">
	<div class="mb-1 flex items-center justify-between"><h2 id="topic-title" class="text-[15px] font-semibold tracking-tight">A little help packing</h2><Icon name="sparkles" size={19} class="text-terracotta" /></div>
	<p class="mb-5 text-xs leading-relaxed text-muted">Pick your plans. We’ll bring the ideas.</p>
	<div class="grid grid-cols-2 gap-2 lg:grid-cols-1">
		{#each visibleTopics as topic}
			{@const active = selected.includes(topic.id)}
			<button aria-pressed={active} class="group flex min-h-17 items-center gap-3 rounded-xl border p-3 text-left transition-all {active ? 'border-[#c7d0b1] bg-[#f1f3e8]' : 'border-line hover:border-[#c7d0b1] hover:bg-canvas'}" onclick={() => ontoggle(topic.id)}>
				<span class="tint-{topic.color} grid size-9 shrink-0 place-items-center rounded-lg"><Icon name={topic.icon} size={19} /></span>
				<span class="min-w-0 flex-1"><span class="block text-[11px] font-semibold sm:text-xs">{topic.name}</span><span class="mt-1 hidden text-[10px] text-muted sm:block">{topic.itemIds.length} suggestions</span></span>
				<span class="grid size-5 shrink-0 place-items-center rounded-full {active ? 'bg-forest text-white' : 'border border-line text-muted'}"><Icon name={active ? 'check' : 'plus'} size={12} /></span>
			</button>
		{/each}
	</div>
	<button class="mt-4 flex min-h-10 w-full items-center justify-between gap-2 rounded-lg px-1 text-xs font-semibold text-forest hover:text-terracotta" onclick={onbrowse}><span>Explore all {topics.length} packs</span><Icon name="arrow" size={17} /></button>
	<div class="mt-3 flex items-start gap-2 border-t border-line pt-4 text-[10px] leading-relaxed text-muted"><Icon name="check" size={13} class="mt-0.5 shrink-0 text-forest" /><span>Mix and match. Shared items appear only once.</span></div>
</section>
