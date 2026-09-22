<script lang="ts">
	import AppHeader from '$lib/components/AppHeader.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import TravelIllustration from '$lib/components/TravelIllustration.svelte';
	import TripDetails from '$lib/components/TripDetails.svelte';
	import ProgressCard from '$lib/components/ProgressCard.svelte';
	import TopicPicker from '$lib/components/TopicPicker.svelte';
	import CategoryCard from '$lib/components/CategoryCard.svelte';
	import TopicModal from '$lib/components/TopicModal.svelte';
	import ItemModal from '$lib/components/ItemModal.svelte';
	import TripEditor from '$lib/components/TripEditor.svelte';
	import TripsModal from '$lib/components/TripsModal.svelte';
	import Modal from '$lib/components/Modal.svelte';
	import { normalizeName, progress, topics } from '$lib/checklist';
	import { TravelState } from '$lib/travel.svelte';
	import type { Trip, TripDetails as TripFields } from '$lib/types';

	const app = new TravelState();
	let search = $state('');
	let packingFilter = $state<'all' | 'remaining' | 'packed'>('all');
	let expandedOverride = $state<boolean | null>(null);
	let topicModal = $state(false);
	let itemModal = $state(false);
	let itemCategory = $state('');
	let tripsModal = $state(false);
	let tripEditor = $state(false);
	let creatingTrip = $state(false);
	let categoryModal = $state(false);
	let categoryName = $state('');
	let categoryIcon = $state('bag');
	let categoryColor = $state('mint');
	let confirmation = $state<{ kind: 'trip' | 'category' | 'packing' | 'storage'; id?: string; name: string } | null>(null);
	const categoryIcons = ['bag', 'heart', 'sparkles', 'coffee', 'camera', 'laptop', 'sun', 'mountain'];
	const categoryColors = ['mint', 'sand', 'peach', 'pink', 'lavender', 'yellow', 'blue'];
	let summary = $derived(progress(app.trip.items));
	let activeCategories = $derived(app.trip.categories.filter((category) => app.trip.items.some((item) => item.categoryId === category.id) || (app.mode === 'builder' && category.custom)));
	let selectedTopics = $derived(topics.filter((topic) => app.trip.topicIds.includes(topic.id)));
	let categoryDuplicate = $derived(app.trip.categories.some((category) => normalizeName(category.name) === normalizeName(categoryName)));
	let groupedItems = $derived(activeCategories.map((category) => {
		const items = app.trip.items.filter((item) => item.categoryId === category.id);
		const query = search.toLocaleLowerCase().trim();
		const visibleItems = items.filter((item) => {
			const matchesSearch = `${item.name} ${category.name}`.toLocaleLowerCase().includes(query);
			const matchesFilter = app.mode === 'builder' || packingFilter === 'all' || (packingFilter === 'packed' ? item.packed : !item.packed);
			return matchesSearch && matchesFilter;
		});
		return { category, items, visibleItems };
	}).filter((group) => group.visibleItems.length || (app.mode === 'builder' && group.category.custom && !search.trim() && !group.items.length)));

	function resetView() { search = ''; packingFilter = 'all'; expandedOverride = null; }
	function openItems(categoryId = '') { itemCategory = categoryId; itemModal = true; }
	function showNewTrip() { tripsModal = false; creatingTrip = true; tripEditor = true; }
	function showTripEditor() { creatingTrip = false; tripEditor = true; }
	function saveDetails(details: TripFields, starter: boolean) {
		if (creatingTrip) { app.newTrip(details, starter); resetView(); }
		else app.updateDetails(details);
		tripEditor = false;
	}
	function openTrip(trip: Trip) { app.openTrip(trip); tripsModal = false; resetView(); }
	function saveAndPack() { app.saveTrip(); resetView(); }
	function editChecklist() { app.editChecklist(); resetView(); }
	function showCategoryModal() { categoryName = ''; categoryIcon = 'bag'; categoryColor = 'mint'; categoryModal = true; }
	function addCategory(event: SubmitEvent) {
		event.preventDefault();
		if (app.addCategory(categoryName, categoryIcon, categoryColor)) {
			categoryModal = false;
			search = '';
			const category = app.trip.categories[app.trip.categories.length - 1];
			openItems(category.id);
		}
	}
	function confirmAction() {
		if (!confirmation) return;
		if (confirmation.kind === 'trip' && confirmation.id) { app.deleteTrip(confirmation.id); resetView(); }
		if (confirmation.kind === 'category' && confirmation.id) app.deleteCategory(confirmation.id);
		if (confirmation.kind === 'packing') { app.resetPacking(); packingFilter = 'all'; }
		if (confirmation.kind === 'storage') app.replaceUnreadableStorage();
		confirmation = null;
	}
</script>

<svelte:head>
	<title>Roam — A little prep. A better trip.</title>
	<meta name="description" content="A thoughtful travel checklist builder. Mix and match packing packs, make your own list, and keep track of every little thing. Saved on your device." />
	<meta name="theme-color" content="#f6f5ee" />
</svelte:head>

<a href="#checklist" class="fixed top-3 left-3 z-50 -translate-y-24 rounded-xl bg-forest px-5 py-3 text-sm text-white focus:translate-y-0">Skip to checklist</a>
<AppHeader tripCount={app.trips.length} ontrips={() => tripsModal = true} onnew={showNewTrip} />

<main id="main" class="page-enter mx-auto max-w-7xl px-5 pb-32 sm:px-8 lg:px-12 lg:pb-10">
	<section class="relative grid items-center gap-3 pt-9 pb-8 sm:grid-cols-[1.15fr_1fr] sm:pt-8 sm:pb-6 lg:gap-10" aria-label="Welcome to Roam">
		<div class="relative z-10 py-2">
			<p class="mb-4 flex items-center gap-2 text-[9px] font-semibold tracking-[.17em] text-forest"><span class="grid size-5 place-items-center rounded-full bg-lime"><Icon name="sun" size={12} /></span>{app.mode === 'builder' ? 'PACK A LITTLE PEACE OF MIND' : 'YOUR ADVENTURE IS ALMOST HERE'}</p>
			<h1 class="font-display text-[42px] leading-[1.06] tracking-[-1.5px] sm:text-[48px] lg:text-[57px]">{#if app.mode === 'builder'}Good trips start<br />with a <em class="font-normal text-terracotta">little prep.</em>{:else if summary.percent === 100}All packed.<br /><em class="font-normal text-terracotta">Adventure awaits.</em>{:else}Less forgetting.<br /><em class="font-normal text-terracotta">More exploring.</em>{/if}</h1>
			<p class="mt-4 max-w-90 text-xs leading-[1.8] text-muted sm:text-[13px]">{app.mode === 'builder' ? 'A thoughtful little checklist for your next big adventure. Make it yours, pack it up, and go make memories.' : 'One item at a time, a little closer to getting away. Your list is saved, so you can pick up right where you left off.'}</p>
		</div>
		<div class="relative hidden sm:block"><TravelIllustration /><span class="absolute bottom-1 left-1/2 -translate-x-1/2 -rotate-3 whitespace-nowrap rounded-md border border-[#dfdec9] bg-paper px-3 py-1.5 text-[9px] font-medium tracking-wider text-muted">TAKE THE TRIP. LEAVE THE WORRY.</span></div>
	</section>

	<div class="mb-7 flex flex-wrap items-center justify-between gap-x-4 gap-y-3 border-y border-line py-4">
		<ol class="flex items-center gap-3 text-[11px] font-medium sm:gap-5" aria-label="Checklist steps">
			<li class="flex items-center gap-2 {app.mode === 'builder' ? 'text-forest' : 'text-muted'}" aria-current={app.mode === 'builder' ? 'step' : undefined}><span class="grid size-6 place-items-center rounded-full text-[9px] {app.mode === 'builder' ? 'bg-forest text-white' : 'bg-[#e6eadc] text-forest'}">{#if app.mode === 'packing'}<Icon name="check" size={12} />{:else}01{/if}</span>Build your list</li>
			<li aria-hidden="true" class="text-[#b8bdac]"><Icon name="chevron" size={13} /></li>
			<li class="flex items-center gap-2 {app.mode === 'packing' ? 'text-forest' : 'text-muted'}" aria-current={app.mode === 'packing' ? 'step' : undefined}><span class="grid size-6 place-items-center rounded-full text-[9px] {app.mode === 'packing' ? 'bg-forest text-white' : 'border border-line'}">02</span>Pack & go</li>
		</ol>
		<span class="flex items-center gap-1.5 text-[10px] text-muted" role="status"><Icon name={app.storageError ? 'alert' : 'lock'} size={12} />{!app.loaded ? 'Getting your list ready' : app.storageError ? 'Not saved on this device' : app.saveStatus === 'saving' ? 'Saving on this device…' : app.mode === 'builder' ? 'Draft saved on this device' : 'Saved on this device'}</span>
	</div>

	{#if app.storageError}
		<div role="alert" class="mb-6 rounded-xl border border-[#e4c0a6] bg-[#fcf0e3] p-4 text-xs leading-relaxed text-[#805536]"><p>{app.storageError}</p><div class="mt-2 flex flex-wrap gap-3">{#if app.storageBlocked}<button class="font-semibold underline underline-offset-4" onclick={app.downloadUnreadableBackup}>Download backup</button><button class="font-semibold underline underline-offset-4" onclick={() => confirmation = { kind: 'storage', name: '' }}>Start fresh</button>{:else}<button class="font-semibold underline underline-offset-4" onclick={app.persist}>Try saving again</button>{/if}</div></div>
	{/if}

	<div class="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-7">
		<div class="min-w-0 space-y-6">
			<TripDetails trip={app.trip} mode={app.mode} onedit={showTripEditor} />
			<div class="lg:hidden">
				{#if app.mode === 'builder'}
					<button class="flex w-full items-center gap-3 rounded-xl border border-[#daddbf] bg-[#eeefdd] p-4 text-left" onclick={() => topicModal = true}><span class="grid size-10 shrink-0 place-items-center rounded-xl bg-[#e0e5c1] text-forest"><Icon name="sparkles" size={21} /></span><span class="flex-1"><span class="block text-xs font-semibold">A little help packing</span><span class="mt-1 block text-[10px] text-muted">{app.trip.topicIds.length} packs selected · Explore {topics.length} topic packs</span></span><Icon name="arrow" size={18} /></button>
				{:else}<ProgressCard total={summary.total} packed={summary.packed} categoryCount={activeCategories.length} mode={app.mode} onsave={saveAndPack} onedit={editChecklist} />{/if}
			</div>

			<section id="checklist" class="scroll-mt-6" aria-labelledby="checklist-title">
				<div class="mb-4 flex items-center justify-between gap-3"><div><h2 id="checklist-title" class="text-lg font-semibold tracking-[-.5px]">Your packing list<span class="ml-2.5 inline-block rounded-md bg-[#eaece0] px-2 py-1 align-middle text-[10px] font-medium tracking-normal text-muted">{summary.total}</span></h2><p class="mt-1 text-[11px] text-muted">{app.mode === 'builder' ? 'Bring what you need. Leave what you don’t.' : 'Give each item a check when it’s in your bag.'}</p></div>{#if app.mode === 'builder'}<button class="button-quiet shrink-0 gap-1 border border-line bg-paper px-3 text-[11px]" onclick={() => openItems()}><Icon name="plus" size={14} /> Add items</button>{/if}</div>
				{#if app.mode === 'builder' && selectedTopics.length}
					<div class="mb-4 flex flex-wrap gap-1.5" aria-label="Selected topic packs">
						{#each selectedTopics.slice(0, 4) as topic}<button class="inline-flex min-h-8 items-center gap-1.5 rounded-lg border border-line bg-paper px-2.5 text-[10px] text-muted transition-colors hover:border-[#d1b196] hover:text-terracotta" onclick={() => app.toggleTopic(topic.id)} aria-label={`Remove ${topic.name} pack`}><Icon name={topic.icon} size={12} />{topic.name}<Icon name="x" size={11} /></button>{/each}
						{#if selectedTopics.length > 4}<button class="min-h-8 rounded-lg border border-line bg-paper px-2.5 text-[10px] text-muted" onclick={() => topicModal = true}>+{selectedTopics.length - 4} more</button>{/if}
					</div>
				{/if}
				{#if app.mode === 'packing'}
					<div class="mb-4 flex gap-1 rounded-xl border border-line bg-[#efefe5] p-1" aria-label="Filter packing status">
						{#each [{ id: 'all', label: 'All items', count: summary.total }, { id: 'remaining', label: 'Still to pack', count: summary.total - summary.packed }, { id: 'packed', label: 'Packed', count: summary.packed }] as filter}<button class="min-h-10 flex-1 rounded-lg px-1 text-[11px] transition-colors {packingFilter === filter.id ? 'bg-paper font-semibold text-forest shadow-sm' : 'text-muted'}" aria-pressed={packingFilter === filter.id} onclick={() => packingFilter = filter.id as typeof packingFilter}>{filter.label}<span class="ml-1 text-[9px] opacity-65">{filter.count}</span></button>{/each}
					</div>
				{/if}
				<div class="mb-4 flex items-center gap-2"><label class="search-field flex-1"><Icon name="search" size={15} /><input type="search" bind:value={search} placeholder="Find something on your list…" aria-label="Search your checklist" /></label><button class="icon-button shrink-0 border border-line bg-paper text-muted" onclick={() => expandedOverride = expandedOverride === true ? false : true} aria-label={expandedOverride === true ? 'Collapse all categories' : 'Expand all categories'} title={expandedOverride === true ? 'Collapse all categories' : 'Expand all categories'}><Icon name="down" size={16} class={expandedOverride === true ? 'rotate-180' : ''} /></button></div>

				{#if app.mode === 'packing' && summary.percent === 100 && !search && packingFilter !== 'packed'}
					<div class="mb-4 flex items-center gap-3 rounded-xl border border-[#ced7b4] bg-[#edf2db] p-4"><span class="grid size-10 shrink-0 place-items-center rounded-full bg-forest text-lime"><Icon name="check" size={22} /></span><div><h3 class="text-sm font-semibold text-forest">You’re all packed. Go make memories.</h3><p class="mt-1 text-[11px] text-muted">Everything on your list is ready for the adventure.</p></div><Icon name="sparkles" size={20} class="ml-auto hidden shrink-0 text-[#87915e] sm:block" /></div>
				{/if}

				<div class="space-y-3">
					{#each groupedItems as group, index (app.trip.id + '-' + app.mode + '-' + group.category.id)}
						<CategoryCard category={group.category} items={group.items} visibleItems={group.visibleItems} mode={app.mode} initialOpen={index < 2 || group.category.id === 'beach' || !!group.category.custom} {expandedOverride} searching={!!search.trim() || packingFilter !== 'all'} ontoggle={app.togglePacked} onremove={app.removeItem} onquantity={app.changeQuantity} onadd={openItems} onpackall={app.packCategory} ondelete={(id) => confirmation = { kind: 'category', id, name: group.category.name }} />
					{:else}
						{#if !(app.mode === 'packing' && summary.percent === 100 && packingFilter === 'remaining' && !search)}
							<div class="rounded-2xl border border-dashed border-[#cdd0bd] bg-paper px-5 py-12 text-center"><span class="mx-auto grid size-13 place-items-center rounded-2xl bg-sand text-forest"><Icon name={search ? 'search' : 'bag'} size={25} /></span><h3 class="mt-4 font-display text-2xl">{search ? 'Not in this bag… yet.' : !summary.total ? 'Every adventure starts somewhere.' : packingFilter === 'packed' ? 'One check is all it takes.' : 'Nothing here right now.'}</h3><p class="mx-auto mt-2 max-w-65 text-xs leading-relaxed text-muted">{search ? 'Try another search, or add something of your own.' : !summary.total ? 'Pick a topic pack or add your first item to start your list.' : 'Your items will appear here as you pack.'}</p>{#if search}<button class="button-quiet mt-4 text-xs" onclick={() => search = ''}>Clear search</button>{:else if app.mode === 'builder'}<button class="button-dark mt-5" onclick={() => topicModal = true}>Explore topic packs <Icon name="arrow" size={15} /></button>{:else}<button class="button-quiet mt-4 text-xs" onclick={() => packingFilter = 'all'}>Show all items</button>{/if}</div>
						{/if}
					{/each}
				</div>
				{#if app.mode === 'builder'}<button class="mt-4 flex min-h-14 w-full items-center justify-center gap-2 rounded-xl border border-dashed border-[#ccd0bd] text-xs font-medium text-muted transition-colors hover:border-forest hover:bg-[#eff0e4] hover:text-forest" onclick={showCategoryModal}><Icon name="plus" size={16} /> Make your own category</button>{:else if summary.packed > 0}<button class="button-quiet mx-auto mt-5 flex text-[11px] text-muted" onclick={() => confirmation = { kind: 'packing', name: app.trip.name }}><Icon name="reset" size={13} /> Reset packing progress</button>{/if}
				<p class="mt-5 text-center text-[10px] leading-relaxed text-muted">{app.mode === 'builder' ? 'Your list, your rules. Adjust quantities for your trip and make room for your favorites.' : 'Progress counts checklist entries. Tick an item once you’ve packed its full quantity.'}</p>
			</section>
		</div>

		<aside class="hidden space-y-5 lg:sticky lg:top-6 lg:block">
			<ProgressCard total={summary.total} packed={summary.packed} categoryCount={activeCategories.length} mode={app.mode} onsave={saveAndPack} onedit={editChecklist} />
			{#if app.mode === 'builder'}<TopicPicker selected={app.trip.topicIds} ontoggle={app.toggleTopic} onbrowse={() => topicModal = true} />{:else}
				<section class="rounded-2xl border border-line bg-paper p-6"><h2 class="mb-5 text-sm font-semibold">A little at a time.</h2><div class="space-y-4">{#each activeCategories as category}{@const items = app.trip.items.filter((item) => item.categoryId === category.id)}{@const categoryProgress = progress(items)}<div><div class="mb-2 flex items-center gap-2"><Icon name={category.icon} size={14} class="text-muted" /><span class="flex-1 truncate text-[11px]">{category.name}</span><span class="text-[10px] text-muted">{categoryProgress.packed}/{categoryProgress.total}</span></div><div class="h-1 overflow-hidden rounded-full bg-canvas"><div class="h-full rounded-full bg-[#98a77b] transition-all duration-300" style:width={`${categoryProgress.percent}%`}></div></div></div>{/each}</div></section>
			{/if}
			<div class="px-4 py-2 text-center"><Icon name="sun" size={22} class="mx-auto mb-2 text-[#a5ad84]" /><p class="font-display text-[18px] italic text-[#7b856b]">Less stuff on your mind.<br />More world at your feet.</p></div>
		</aside>
	</div>

	<footer class="mt-12 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-6 text-[10px] text-muted"><span class="flex items-center gap-2"><span class="text-base font-bold tracking-[-.6px] text-forest">roam.</span>A little prep. A better trip.</span><span class="flex items-center gap-1.5"><Icon name="lock" size={11} /> Just you, your browser, and a little wanderlust.</span></footer>
</main>

<div class="safe-bottom fixed inset-x-0 bottom-0 z-20 border-t border-line bg-paper/95 px-5 pt-3 backdrop-blur-xl lg:hidden">
	<div class="mx-auto flex max-w-2xl items-center justify-between gap-4">
		<div class="min-w-0"><p class="text-sm font-semibold tracking-tight">{app.mode === 'builder' ? `${summary.total} items. One great trip.` : `${summary.packed} of ${summary.total} packed`}<span class="ml-1 text-xs text-muted">{app.mode === 'packing' ? `· ${summary.percent}%` : ''}</span></p>{#if app.mode === 'builder'}<p class="mt-1 text-[9px] text-muted">{app.storageError ? 'Storage needs attention' : 'Saved on your device. Ready when you are.'}</p>{:else}<div class="mt-2 h-1.5 w-34 overflow-hidden rounded-full bg-sand"><div class="h-full rounded-full bg-forest transition-all duration-300" style:width={`${summary.percent}%`}></div></div>{/if}</div>
		{#if app.mode === 'builder'}<button class="button-dark shrink-0 px-4 text-[11px]" disabled={!summary.total || !app.loaded} onclick={saveAndPack}>Save & pack <Icon name="arrow" size={15} /></button>{:else}<button class="button-quiet shrink-0 border border-line text-[11px]" onclick={editChecklist}><Icon name="edit" size={14} /> Edit list</button>{/if}
	</div>
</div>

{#if app.notice}<div class="toast-enter fixed right-4 bottom-26 left-4 z-40 mx-auto flex max-w-md items-center gap-3 rounded-xl border border-[#53654b] bg-forest px-4 py-3.5 text-white shadow-lg lg:bottom-6" role="status"><Icon name="check" size={17} class="shrink-0 text-lime" /><p class="flex-1 text-xs leading-relaxed">{app.notice}</p>{#if app.undo}<button class="min-h-8 shrink-0 text-xs font-semibold text-lime underline underline-offset-4" onclick={() => app.undo?.()}>Undo</button>{/if}<button class="grid size-8 shrink-0 place-items-center rounded-md text-white/65 hover:bg-white/10" aria-label="Dismiss notification" onclick={() => app.notice = ''}><Icon name="x" size={14} /></button></div>{/if}

<TopicModal open={topicModal} selected={app.trip.topicIds} ontoggle={app.toggleTopic} onclose={() => topicModal = false} />
<ItemModal open={itemModal} categories={app.trip.categories} items={app.trip.items} initialCategory={itemCategory} onadd={app.addCatalogItem} oncustom={app.addCustomItem} onclose={() => itemModal = false} />
<TripEditor open={tripEditor} trip={app.trip} creating={creatingTrip} hasDraft={app.mode === 'builder' || !!app.draft} onsave={saveDetails} onclose={() => tripEditor = false} />
<TripsModal open={tripsModal} trips={app.trips} draft={app.mode === 'builder' ? app.trip : app.draft} activeId={app.mode === 'packing' ? app.trip.id : null} onopen={openTrip} ondraft={() => { app.openDraft(); tripsModal = false; resetView(); }} ondelete={(id) => { tripsModal = false; confirmation = { kind: 'trip', id, name: app.trips.find((trip) => trip.id === id)?.name ?? 'this trip' }; }} onnew={showNewTrip} onclose={() => tripsModal = false} />

<Modal open={categoryModal} title="A space for your things." description="For hobbies, special occasions, and things only you would think to pack." onclose={() => categoryModal = false}>
	<form onsubmit={addCategory} class="space-y-5">
		<label class="form-label">Category name<input class="field mt-2" bind:value={categoryName} placeholder="My creative corner" maxlength="60" required /></label>
		{#if categoryDuplicate}<p class="text-xs text-terracotta">There’s already a category with that name.</p>{/if}
		<fieldset><legend class="form-label mb-3">Pick a little symbol</legend><div class="flex flex-wrap gap-2">{#each categoryIcons as icon}<button type="button" class="grid size-11 place-items-center rounded-xl border {categoryIcon === icon ? 'border-forest bg-[#e8edda] text-forest' : 'border-line text-muted'}" aria-label={`Use ${icon} icon`} aria-pressed={categoryIcon === icon} onclick={() => categoryIcon = icon}><Icon name={icon} size={21} /></button>{/each}</div></fieldset>
		<fieldset><legend class="form-label mb-3">A splash of color</legend><div class="flex flex-wrap gap-2">{#each categoryColors as color}<button type="button" class="tint-{color} grid size-10 place-items-center rounded-full border-2 {categoryColor === color ? 'border-forest' : 'border-transparent'}" aria-label={`Use ${color} color`} aria-pressed={categoryColor === color} onclick={() => categoryColor = color}>{#if categoryColor === color}<Icon name="check" size={16} />{/if}</button>{/each}</div></fieldset>
		<button class="button-dark w-full" type="submit" disabled={!categoryName.trim() || categoryDuplicate}>Create category <Icon name="plus" size={16} /></button>
	</form>
</Modal>

<Modal open={!!confirmation} title={confirmation?.kind === 'packing' ? 'Ready for another round?' : confirmation?.kind === 'storage' ? 'Start fresh on this device?' : 'A little less to keep.'} onclose={() => confirmation = null}>
	<p class="text-sm leading-relaxed text-muted">{#if confirmation?.kind === 'trip'}Delete <strong class="text-ink">{confirmation.name}</strong> and its saved packing progress? This can’t be undone.{:else if confirmation?.kind === 'category'}Remove <strong class="text-ink">{confirmation.name}</strong> and all items in this category?{:else if confirmation?.kind === 'packing'}Uncheck every item in <strong class="text-ink">{confirmation.name}</strong>? Your items, categories, and quantities will stay on the list.{:else}Replace the unreadable saved data with your current checklist? Download a backup first if you’d like to keep a copy of the old data.{/if}</p>
	<div class="mt-6 flex justify-end gap-2"><button class="button-quiet" onclick={() => confirmation = null}>Keep it as is</button><button class="button-dark" onclick={confirmAction}>{confirmation?.kind === 'packing' ? 'Reset progress' : confirmation?.kind === 'storage' ? 'Start fresh' : 'Remove'}<Icon name={confirmation?.kind === 'packing' ? 'reset' : 'trash'} size={15} /></button></div>
</Modal>
