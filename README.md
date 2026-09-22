# Roam

A mobile-first travel checklist builder made with SvelteKit, Svelte 5, and Tailwind CSS. Build a list from topic packs, customize it, then save it and check things off as you pack.

## Run locally

Use the existing project commands:

```sh
pnpm dev
```

Create a static production build with `pnpm build`. The existing static adapter and `src/routes/+layout.ts` prerender the site. There are no server routes, accounts, or external services.

## Edit the catalog

All suggested content lives in `src/lib/data/`:

- `categories.json`: category IDs, names, icons, and colors.
- `items.json`: one canonical entry for each item, with its ID, name, category ID, and optional note.
- `topics.json`: topic packs grouped by travel plans, weather, journey, and extras. Each pack refers to canonical item IDs.
- `defaults.json`: starter trip details and the initially selected packs.

Keep item IDs unique. Reuse the same item ID in every relevant topic: for example, Winter and Skiing both refer to `warm-socks`. Roam combines shared IDs and normalized item names, so overlapping packs never add duplicate checklist entries.

Adding a pack adds its missing items. Removing one removes its unique suggestions while preserving items needed by other selected packs and anything added manually. Individual removals stay removed until a relevant pack is added again or the item is added from the library.

Available icon names are defined in `src/lib/components/Icon.svelte`. Category color names are `sand`, `peach`, `pink`, `lavender`, `yellow`, `mint`, and `blue`.

## Build, save, pack

The initial list combines essentials, beach days, and warm weather. Explore the other packs for remote work, devices and cables, snow sports, camping, family travel, and more. Items can be added individually from the searchable library, or written from scratch in any category. Quantities range from 1 to 99 and are adjusted manually to suit each trip.

Draft changes save automatically. **Save & start packing** creates a saved trip and switches to packing mode. Checking items, packing a whole category, and resetting packing progress persist immediately. Packing progress counts checklist entries; tick an entry after packing its full quantity.

**My trips** opens saved trips and the current draft. Editing a saved checklist preserves packed items; saving again updates that trip. Starting a new trip replaces the current draft and leaves saved trips available.

Data is stored only in this browser's local storage under `roam.checklists.v1`. It does not sync across devices. Clearing browser storage removes saved trips. Storage failures are shown in the interface, and unreadable existing data is left untouched with an option to download a backup before replacing it.

## Code layout

- `src/routes/+page.svelte`: page composition, view filters, and dialogs.
- `src/lib/components/`: reusable visual and interaction components.
- `src/lib/travel.svelte.ts`: reactive trip state, user actions, and browser persistence.
- `src/lib/checklist.ts`: catalog operations, deduplication, progress, and saved-data parsing.
- `src/lib/types.ts`: catalog and saved-trip types.
- `src/routes/layout.css`: Tailwind theme and shared styles.

No additional dependencies were installed. No tests, checks, linters, or build commands were run during implementation, as requested.
