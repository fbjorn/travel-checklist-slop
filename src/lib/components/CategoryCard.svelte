<script lang="ts">
	import Icon from './Icon.svelte';
	import type { Category, ChecklistItem } from '$lib/types';
	let { category, items, visibleItems, mode, initialOpen = false, expandedOverride = null, searching = false, ontoggle, onremove, onquantity, onadd, onpackall, ondelete }: {
		category: Category; items: ChecklistItem[]; visibleItems: ChecklistItem[]; mode: 'builder' | 'packing';
		initialOpen?: boolean; expandedOverride?: boolean | null; searching?: boolean;
		ontoggle: (id: string) => void; onremove: (id: string) => void;
		onquantity: (id: string, amount: number) => void; onadd: (categoryId: string) => void;
		onpackall: (categoryId: string, packed: boolean) => void; ondelete: (categoryId: string) => void;
	} = $props();
	let expanded = $state(initialOpen);
	const contentId = $props.id();
	let packed = $derived(items.filter((item) => item.packed).length);
	let percent = $derived(items.length ? Math.round(packed / items.length * 100) : 0);
	let isOpen = $derived(searching || expanded);
	$effect(() => { if (expandedOverride !== null) expanded = expandedOverride; });
</script>

<section class="overflow-hidden rounded-2xl border border-line bg-paper transition-colors {mode === 'packing' && percent === 100 ? 'border-[#c8d4b7]' : ''}">
	<div class="flex items-center pr-3 sm:pr-4">
		<button class="flex min-h-19 min-w-0 flex-1 items-center gap-3 px-4 py-4 text-left sm:gap-3.5 sm:px-5" aria-expanded={isOpen} aria-controls={contentId} onclick={() => expanded = !expanded}>
			<span class="tint-{category.color} grid size-10 shrink-0 place-items-center rounded-xl"><Icon name={category.icon} size={20} /></span>
			<span class="min-w-0 flex-1"><span class="block truncate text-[13px] font-semibold tracking-[-.2px] sm:text-sm">{category.name}</span><span class="mt-1 block text-[10px] text-muted">{mode === 'packing' ? `${packed} of ${items.length} packed` : `${items.length} ${items.length === 1 ? 'item' : 'items'}${category.custom ? ' · Your own category' : ''}`}</span></span>
			{#if mode === 'packing'}<span class="hidden h-1.5 w-16 overflow-hidden rounded-full bg-[#eceee5] sm:block"><span class="block h-full rounded-full bg-forest transition-all duration-300" style:width={`${percent}%`}></span></span>{/if}
			{#if mode === 'packing' && percent === 100}<span class="grid size-6 shrink-0 place-items-center rounded-full bg-forest text-lime"><Icon name="check" size={14} /></span>{:else}<span class="text-[11px] tabular-nums text-muted">{mode === 'packing' ? `${percent}%` : String(items.length).padStart(2, '0')}</span>{/if}
			<Icon name="down" size={15} class="shrink-0 text-muted transition-transform {isOpen ? 'rotate-180' : ''}" />
		</button>
		{#if mode === 'builder' && category.custom}<button class="icon-button text-muted hover:text-terracotta" aria-label={`Delete ${category.name} category`} onclick={() => ondelete(category.id)}><Icon name="trash" size={15} /></button>{/if}
	</div>
	{#if isOpen}
		<div id={contentId} class="border-t border-line">
			<ul class="px-4 sm:px-5">
				{#each visibleItems as item (item.id)}
					<li class="group flex min-h-12 items-center gap-2 border-b border-line/70 py-1 last:border-b-0 sm:gap-3">
						{#if mode === 'packing'}
							<label class="flex min-h-11 min-w-0 flex-1 cursor-pointer items-center gap-3 py-1">
								<input type="checkbox" checked={item.packed} onchange={() => ontoggle(item.id)} class="peer sr-only" />
								<span class="grid size-5 shrink-0 place-items-center rounded-md border transition-all peer-focus-visible:ring-2 peer-focus-visible:ring-forest peer-focus-visible:ring-offset-2 {item.packed ? 'border-forest bg-forest text-white' : 'border-[#cccec1] bg-white'}">{#if item.packed}<Icon name="check" size={13} />{/if}</span>
								<span class="min-w-0 text-[13px] leading-relaxed {item.packed ? 'text-muted line-through decoration-[#afb5a1]' : ''}">{item.name}{#if item.quantity > 1}<span class="ml-2 inline-block rounded-md bg-canvas px-1.5 py-0.5 text-[10px] text-muted no-underline">×{item.quantity}</span>{/if}{#if item.note && !item.packed}<span class="mt-0.5 block text-[10px] leading-relaxed text-muted">{item.note}</span>{/if}</span>
							</label>
						{:else}
							<span class="mr-1 size-1.5 shrink-0 rounded-full bg-[#b9c2a2]"></span>
							<span class="min-w-0 flex-1 py-2 text-[12px] leading-relaxed sm:text-[13px]">{item.name}{#if item.custom}<span class="ml-1.5 text-[9px] text-muted">CUSTOM</span>{/if}</span>
							<div class="flex shrink-0 items-center rounded-lg border border-line bg-canvas" aria-label={`Quantity for ${item.name}`}>
								<button class="grid size-8 place-items-center rounded-l-lg text-muted hover:bg-sand disabled:opacity-25" disabled={item.quantity <= 1} aria-label={`Decrease ${item.name} quantity`} onclick={() => onquantity(item.id, -1)}><Icon name="minus" size={11} /></button>
								<span class="min-w-4 text-center text-[11px] tabular-nums">{item.quantity}</span>
								<button class="grid size-8 place-items-center rounded-r-lg text-muted hover:bg-sand disabled:opacity-25" disabled={item.quantity >= 99} aria-label={`Increase ${item.name} quantity`} onclick={() => onquantity(item.id, 1)}><Icon name="plus" size={11} /></button>
							</div>
							<button class="grid size-9 shrink-0 place-items-center rounded-lg text-[#8e9384] transition-colors hover:bg-[#f7e8e1] hover:text-terracotta" aria-label={`Remove ${item.name}`} onclick={() => onremove(item.id)}><Icon name="x" size={14} /></button>
						{/if}
					</li>
				{/each}
			</ul>
			{#if mode === 'builder'}
				<button class="flex min-h-12 w-full items-center gap-2 border-t border-line px-5 text-[11px] font-medium text-muted transition-colors hover:bg-canvas hover:text-forest" onclick={() => onadd(category.id)}><Icon name="plus" size={14} /> Add to {category.name.toLocaleLowerCase()}</button>
			{:else if items.length}
				<button class="flex min-h-11 w-full items-center justify-end gap-1.5 border-t border-line px-5 text-[10px] font-medium text-muted hover:bg-canvas hover:text-forest" onclick={() => onpackall(category.id, percent !== 100)}><Icon name={percent === 100 ? 'reset' : 'check'} size={12} />{percent === 100 ? 'Unpack category' : 'Pack entire category'}</button>
			{/if}
		</div>
	{/if}
</section>
