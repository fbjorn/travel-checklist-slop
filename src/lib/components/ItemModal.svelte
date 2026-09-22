<script lang="ts">
	import Modal from './Modal.svelte';
	import Icon from './Icon.svelte';
	import { catalog, normalizeName } from '$lib/checklist';
	import type { CatalogItem, Category, ChecklistItem } from '$lib/types';
	let { open, categories, items, initialCategory = '', onadd, oncustom, onclose }: {
		open: boolean; categories: Category[]; items: ChecklistItem[]; initialCategory?: string;
		onadd: (item: CatalogItem) => void; oncustom: (name: string, categoryId: string) => void; onclose: () => void;
	} = $props();
	let tab = $state<'catalog' | 'custom'>('catalog');
	let search = $state('');
	let categoryId = $state('');
	let customCategory = $state('');
	let customName = $state('');
	let message = $state('');
	let existingIds = $derived(new Set(items.map((item) => item.id)));
	let existingNames = $derived(new Set(items.map((item) => normalizeName(item.name))));
	let filtered = $derived(catalog.filter((item) => (!categoryId || item.categoryId === categoryId) && item.name.toLocaleLowerCase().includes(search.toLocaleLowerCase().trim())));
	let duplicate = $derived(existingNames.has(normalizeName(customName)));
	$effect(() => {
		if (open) {
			search = ''; customName = ''; message = ''; categoryId = initialCategory;
			customCategory = initialCategory || categories[0]?.id || '';
			tab = initialCategory.startsWith('custom-') ? 'custom' : 'catalog';
		}
	});
	function addCustom(event: SubmitEvent) {
		event.preventDefault();
		if (!customName.trim() || !customCategory || duplicate) return;
		oncustom(customName.trim(), customCategory);
		message = `${customName.trim()} added to your list.`;
		customName = '';
	}
</script>

<Modal {open} title="Make a little room." description="Find something in the library, or add that very specific thing you can’t travel without." wide {onclose}>
	<div class="mb-5 flex gap-1 rounded-xl bg-canvas p-1" aria-label="Item source">
		<button class="min-h-10 flex-1 rounded-lg text-xs font-medium {tab === 'catalog' ? 'bg-paper shadow-sm' : 'text-muted'}" aria-pressed={tab === 'catalog'} onclick={() => tab = 'catalog'}>Browse the library <span class="ml-1 text-[10px] text-muted">{catalog.length}</span></button>
		<button class="min-h-10 flex-1 rounded-lg text-xs font-medium {tab === 'custom' ? 'bg-paper shadow-sm' : 'text-muted'}" aria-pressed={tab === 'custom'} onclick={() => tab = 'custom'}>Write your own</button>
	</div>
	{#if tab === 'catalog'}
		<div class="mb-4 grid gap-2 sm:grid-cols-[1fr_190px]">
			<label class="search-field"><Icon name="search" size={16} /><input bind:value={search} placeholder="Find an item…" aria-label="Search item library" /></label>
			<select bind:value={categoryId} class="field text-xs" aria-label="Filter item category"><option value="">All categories</option>{#each categories as category}<option value={category.id}>{category.name}</option>{/each}</select>
		</div>
		<div class="max-h-[42dvh] overflow-y-auto rounded-xl border border-line">
			{#each filtered as item (item.id)}
				{@const added = existingIds.has(item.id) || existingNames.has(normalizeName(item.name))}
				{@const category = categories.find((entry) => entry.id === item.categoryId)}
				<div class="flex min-h-16 items-center gap-3 border-b border-line px-4 py-2 last:border-b-0">
					<span class="tint-{category?.color ?? 'sand'} grid size-8 shrink-0 place-items-center rounded-lg"><Icon name={category?.icon ?? 'bag'} size={16} /></span>
					<div class="min-w-0 flex-1"><p class="text-xs leading-relaxed">{item.name}</p><p class="mt-0.5 text-[10px] text-muted">{category?.name}</p></div>
					<button class="flex min-h-10 shrink-0 items-center gap-1.5 rounded-lg px-3 text-[11px] font-medium {added ? 'text-forest' : 'bg-canvas hover:bg-lime'}" disabled={added} onclick={() => { onadd(item); message = `${item.name} added to your list.`; }} aria-label={added ? `${item.name} is already on your list` : `Add ${item.name}`}><Icon name={added ? 'check' : 'plus'} size={14} />{added ? 'Added' : 'Add'}</button>
				</div>
			{:else}
				<div class="p-8 text-center"><p class="text-sm text-muted">No matching items.</p><button class="mt-3 text-xs font-semibold text-forest underline underline-offset-4" onclick={() => { tab = 'custom'; customName = search; }}>Add your own instead</button></div>
			{/each}
		</div>
	{:else}
		<form onsubmit={addCustom} class="space-y-4">
			<label class="form-label">Item name<input class="field mt-2" bind:value={customName} placeholder="My lucky travel hoodie" maxlength="100" required /></label>
			<label class="form-label">Category<select class="field mt-2" bind:value={customCategory} required>{#each categories as category}<option value={category.id}>{category.name}</option>{/each}</select></label>
			{#if duplicate}<p class="text-xs text-terracotta">That item is already on your list.</p>{/if}
			<button class="button-dark w-full" type="submit" disabled={!customName.trim() || !customCategory || duplicate}><Icon name="plus" size={16} /> Add to checklist</button>
		</form>
	{/if}
	<div class="mt-5 flex min-h-10 items-center justify-between gap-3"><p role="status" class="text-[11px] text-forest">{message || `${items.length} items on your checklist`}</p><button class="button-quiet text-xs" onclick={onclose}>Done <Icon name="check" size={15} /></button></div>
</Modal>
