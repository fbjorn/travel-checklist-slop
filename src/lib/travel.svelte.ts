import { onMount } from 'svelte';
import {
	addItems, catalog, cloneTrip, createTrip, normalizeName, readSavedState,
	STORAGE_KEY, toggleTopic as togglePack, topics, uniqueId
} from './checklist';
import type { CatalogItem, SavedState, Trip, TripDetails } from './types';

/** Browser-only persistence and checklist actions shared by the page's components. */
export class TravelState {
	trip = $state<Trip>(createTrip());
	trips = $state<Trip[]>([]);
	draft = $state<Trip | null>(null);
	mode = $state<'builder' | 'packing'>('builder');
	loaded = $state(false);
	saveStatus = $state<'ready' | 'saving' | 'saved' | 'error'>('ready');
	storageError = $state('');
	storageBlocked = $state(false);
	notice = $state('');
	undo = $state<(() => void) | null>(null);
	private unreadableBackup = '';
	private noticeTimer: ReturnType<typeof setTimeout> | undefined;

	constructor() {
		onMount(() => {
			this.restore();
			window.addEventListener('pagehide', this.persist);
			return () => {
				window.removeEventListener('pagehide', this.persist);
				clearTimeout(this.noticeTimer);
			};
		});
		$effect(() => {
			if (!this.loaded || this.storageBlocked) return;
			const serialized = this.serialize();
			this.saveStatus = 'saving';
			const timer = setTimeout(() => this.write(serialized), 200);
			return () => clearTimeout(timer);
		});
	}

	private restore() {
		let raw: string | null = null;
		try {
			raw = localStorage.getItem(STORAGE_KEY);
			if (raw) {
				const state = readSavedState(raw);
				this.trips = state.trips;
				this.draft = state.draft;
				const active = state.trips.find((trip) => trip.id === state.activeTripId);
				if (active) {
					this.trip = cloneTrip(active);
					this.mode = 'packing';
				} else if (state.draft) {
					this.trip = cloneTrip(state.draft);
					this.draft = null;
				}
			}
		} catch {
			this.saveStatus = 'error';
			if (raw) {
				this.unreadableBackup = raw;
				this.storageBlocked = true;
				this.storageError = 'Existing saved data couldn’t be read. It has been left untouched. Download a backup before starting fresh.';
			} else {
				this.storageError = 'Your browser isn’t allowing local storage. You can still use this list in this tab, but it won’t be saved until storage is available.';
			}
		}
		this.loaded = true;
	}

	private serialize() {
		const state: SavedState = {
			version: 1, trips: this.trips,
			draft: this.mode === 'builder' ? this.trip : this.draft,
			activeTripId: this.mode === 'packing' ? this.trip.id : null
		};
		return JSON.stringify(state);
	}

	private write(serialized: string) {
		if (!this.loaded || this.storageBlocked) return false;
		try {
			localStorage.setItem(STORAGE_KEY, serialized);
			this.storageError = '';
			this.saveStatus = 'saved';
			return true;
		} catch {
			this.saveStatus = 'error';
			this.storageError = 'Changes are available in this tab, but couldn’t be saved on this device. Browser storage may be full or disabled. Try saving again before leaving.';
			return false;
		}
	}

	persist = () => this.write(this.serialize());

	private updateSavedTrip() {
		if (this.mode !== 'packing') return;
		const saved = cloneTrip(this.trip);
		this.trips = this.trips.some((trip) => trip.id === saved.id)
			? this.trips.map((trip) => trip.id === saved.id ? saved : trip)
			: [saved, ...this.trips];
	}

	notify = (message: string, undo: (() => void) | null = null) => {
		clearTimeout(this.noticeTimer);
		this.notice = message;
		this.undo = undo;
		this.noticeTimer = setTimeout(() => { this.notice = ''; this.undo = null; }, undo ? 6500 : 3500);
	};

	saveTrip = () => {
		if (!this.trip.items.length || !this.loaded) return;
		this.trip = { ...this.trip, savedAt: new Date().toISOString() };
		this.mode = 'packing';
		this.draft = null;
		this.updateSavedTrip();
		if (this.persist()) this.notify('Checklist saved. Next stop: a packed bag.');
	};

	editChecklist = () => {
		this.trip = cloneTrip(this.trip);
		this.mode = 'builder';
		this.notify('Make it yours. Packed items keep their progress.');
	};

	toggleTopic = (topicId: string) => {
		const wasSelected = this.trip.topicIds.includes(topicId);
		const previousCount = this.trip.items.length;
		this.trip = togglePack(this.trip, topicId);
		const difference = Math.abs(this.trip.items.length - previousCount);
		const name = topics.find((topic) => topic.id === topicId)?.name ?? 'Pack';
		this.notify(wasSelected
			? `${name} removed. ${difference} ${difference === 1 ? 'item' : 'items'} taken off the list.`
			: difference ? `${name} added. ${difference} new ${difference === 1 ? 'idea' : 'ideas'}, no duplicates.` : `${name} selected. Those items are already on your list.`);
	};

	addCatalogItem = (item: CatalogItem) => { this.trip = addItems(this.trip, [item], true); };

	addCustomItem = (name: string, categoryId: string) => {
		if (!name.trim() || !this.trip.categories.some((category) => category.id === categoryId)) return;
		if (this.trip.items.some((item) => normalizeName(item.name) === normalizeName(name))) return;
		const canonical = catalog.find((item) => normalizeName(item.name) === normalizeName(name));
		if (canonical && this.trip.items.some((item) => item.id === canonical.id)) return;
		this.trip = { ...this.trip, items: [...this.trip.items, {
			id: canonical?.id ?? uniqueId('custom-item'), name: name.trim(), categoryId,
			quantity: 1, packed: false, custom: true, manual: true
		}] };
	};

	removeItem = (id: string) => {
		const index = this.trip.items.findIndex((item) => item.id === id);
		if (index < 0) return;
		const removed = { ...this.trip.items[index] };
		const tripId = this.trip.id;
		this.trip = { ...this.trip, items: this.trip.items.filter((item) => item.id !== id) };
		this.notify(`${removed.name} removed.`, () => {
			if (this.trip.id !== tripId || !this.trip.categories.some((category) => category.id === removed.categoryId)) return;
			if (this.trip.items.some((item) => item.id === removed.id || normalizeName(item.name) === normalizeName(removed.name))) return;
			const items = [...this.trip.items];
			items.splice(index, 0, removed);
			this.trip = { ...this.trip, items };
			this.notify(`${removed.name} is back on the list.`);
		});
	};

	changeQuantity = (id: string, amount: number) => {
		this.trip = { ...this.trip, items: this.trip.items.map((item) => item.id === id ? { ...item, quantity: Math.max(1, Math.min(99, item.quantity + amount)) } : item) };
	};

	togglePacked = (id: string) => {
		this.trip = { ...this.trip, items: this.trip.items.map((item) => item.id === id ? { ...item, packed: !item.packed } : item) };
		this.updateSavedTrip();
		this.persist();
	};

	packCategory = (categoryId: string, packed: boolean) => {
		this.trip = { ...this.trip, items: this.trip.items.map((item) => item.categoryId === categoryId ? { ...item, packed } : item) };
		this.updateSavedTrip();
		this.persist();
	};

	resetPacking = () => {
		this.trip = { ...this.trip, items: this.trip.items.map((item) => ({ ...item, packed: false })) };
		this.updateSavedTrip();
		this.persist();
		this.notify('A fresh start. Everything is ready to pack again.');
	};

	addCategory = (name: string, icon: string, color: string) => {
		if (!name.trim() || this.trip.categories.some((category) => normalizeName(category.name) === normalizeName(name))) return false;
		this.trip = { ...this.trip, categories: [...this.trip.categories, { id: uniqueId('custom-category'), name: name.trim(), icon, color, custom: true }] };
		this.notify(`${name.trim()} is ready for your items.`);
		return true;
	};

	deleteCategory = (id: string) => {
		this.trip = { ...this.trip, categories: this.trip.categories.filter((category) => category.id !== id), items: this.trip.items.filter((item) => item.categoryId !== id) };
	};

	updateDetails = (details: TripDetails) => {
		this.trip = { ...this.trip, ...details };
		this.updateSavedTrip();
		this.persist();
	};

	newTrip = (details: TripDetails, starter: boolean) => {
		this.trip = { ...createTrip(starter), ...details };
		this.mode = 'builder';
		this.draft = null;
		this.persist();
		this.notify('A new adventure starts here.');
	};

	openTrip = (trip: Trip) => {
		if (this.mode === 'builder') this.draft = cloneTrip(this.trip);
		this.trip = cloneTrip(trip);
		this.mode = 'packing';
		this.persist();
	};

	openDraft = () => {
		if (this.draft && this.mode !== 'builder') this.trip = cloneTrip(this.draft);
		this.mode = 'builder';
		this.draft = null;
		this.persist();
	};

	deleteTrip = (id: string) => {
		this.trips = this.trips.filter((trip) => trip.id !== id);
		if (this.mode === 'packing' && this.trip.id === id) {
			this.trip = this.draft ? cloneTrip(this.draft) : createTrip();
			this.mode = 'builder';
			this.draft = null;
		}
		this.persist();
		this.notify('Saved trip deleted.');
	};

	downloadUnreadableBackup = () => {
		const url = URL.createObjectURL(new Blob([this.unreadableBackup], { type: 'application/json' }));
		const anchor = document.createElement('a');
		anchor.href = url;
		anchor.download = 'roam-saved-data-backup.json';
		anchor.click();
		setTimeout(() => URL.revokeObjectURL(url), 1000);
	};

	replaceUnreadableStorage = () => {
		this.storageBlocked = false;
		this.persist();
	};
}
