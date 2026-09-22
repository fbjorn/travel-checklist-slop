<script lang="ts">
	import type { Snippet } from 'svelte';
	import Icon from './Icon.svelte';
	let { open, title, description = '', wide = false, onclose, children }: {
		open: boolean; title: string; description?: string; wide?: boolean; onclose: () => void; children: Snippet;
	} = $props();
	let dialog: HTMLDialogElement;
	const headingId = $props.id();
	$effect(() => {
		if (open && !dialog.open) dialog.showModal();
		else if (!open && dialog.open) dialog.close();
	});
</script>

<dialog bind:this={dialog} class="modal-shell {wide ? 'sm:max-w-2xl' : 'sm:max-w-lg'}" aria-labelledby={headingId} oncancel={(event) => { event.preventDefault(); onclose(); }} onclick={(event) => { if (event.target === dialog) onclose(); }}>
	<div class="flex max-h-[88dvh] flex-col bg-paper">
		<div class="flex shrink-0 items-start justify-between gap-4 border-b border-line px-5 py-5 sm:px-7 sm:py-6">
			<div><h2 id={headingId} class="font-display text-3xl leading-tight">{title}</h2>{#if description}<p class="mt-2 max-w-lg text-xs leading-relaxed text-muted">{description}</p>{/if}</div>
			<button class="icon-button shrink-0 bg-canvas" onclick={onclose} aria-label="Close dialog"><Icon name="x" size={18} /></button>
		</div>
		<div class="overflow-y-auto overscroll-contain px-5 py-5 sm:px-7 sm:py-6">{@render children()}</div>
	</div>
</dialog>
