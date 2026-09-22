<script lang="ts">
	import Icon from './Icon.svelte';
	let { total, packed, categoryCount, mode, onsave, onedit }: {
		total: number; packed: number; categoryCount: number; mode: 'builder' | 'packing';
		onsave: () => void; onedit: () => void;
	} = $props();
	let percent = $derived(total ? Math.round(packed / total * 100) : 0);
</script>

<section class="relative overflow-hidden rounded-2xl bg-forest p-6 text-white" aria-label={mode === 'builder' ? 'Checklist summary' : 'Packing progress'}>
	<div class="pointer-events-none absolute -right-12 -top-17 size-44 rounded-full border border-white/10"></div>
	<div class="pointer-events-none absolute -right-6 -top-11 size-32 rounded-full border border-white/10"></div>
	<div class="relative flex items-center gap-2 text-[10px] font-semibold tracking-[.16em] text-lime"><span class="size-1.5 rounded-full bg-lime"></span>{mode === 'builder' ? 'A LITTLE PREP. A LOT OF PEACE.' : 'ONE LESS THING TO THINK ABOUT.'}</div>
	{#if mode === 'builder'}
		<h2 class="mt-4 font-display text-[28px] leading-tight">Your adventure, organized.</h2>
		<div class="my-5 flex items-center gap-6">
			<div><span class="text-3xl font-medium tracking-tight">{total}</span><span class="ml-2 text-xs text-white/65">items</span></div>
			<div class="h-8 w-px bg-white/20"></div>
			<div><span class="text-3xl font-medium tracking-tight">{categoryCount}</span><span class="ml-2 text-xs text-white/65">categories</span></div>
		</div>
		<button class="button-lime w-full justify-between" disabled={!total} onclick={onsave}>Save & start packing <Icon name="arrow" size={18} /></button>
		<p class="mt-3 flex items-center justify-center gap-1.5 text-[10px] text-white/60"><Icon name="lock" size={11} /> Saved on this device. No account needed.</p>
	{:else}
		<div class="my-5 flex items-center gap-5">
			<div class="relative size-25 shrink-0">
				<svg viewBox="0 0 100 100" class="size-full -rotate-90" aria-hidden="true"><circle cx="50" cy="50" r="43" fill="none" stroke="rgba(255,255,255,.13)" stroke-width="7" /><circle cx="50" cy="50" r="43" fill="none" stroke="#e5edb3" stroke-width="7" stroke-linecap="round" stroke-dasharray="270.18" stroke-dashoffset={270.18 * (1 - percent / 100)} class="transition-all duration-500" /></svg>
				<span class="absolute inset-0 grid place-items-center text-[26px] font-medium">{percent}<span class="absolute bottom-5 text-[8px] tracking-widest text-white/60">PERCENT</span></span>
			</div>
			<div><h2 class="font-display text-2xl">{percent === 100 ? 'Hello, holiday.' : packed === 0 ? 'Let’s get packing.' : 'Looking good.'}</h2><p class="mt-2 text-xs leading-relaxed text-white/65">{packed} of {total} items packed.<br />{percent === 100 ? 'Your next adventure is calling.' : `${total - packed} little things to go.`}</p></div>
		</div>
		<button class="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-white/25 text-xs font-medium transition-colors hover:bg-white/10" onclick={onedit}><Icon name="edit" size={15} /> Edit checklist</button>
		<p class="mt-3 flex items-center justify-center gap-1.5 text-[10px] text-white/60"><Icon name="lock" size={11} /> Packing progress saves automatically.</p>
	{/if}
</section>
