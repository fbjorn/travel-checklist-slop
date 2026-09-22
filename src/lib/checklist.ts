import categoryData from './data/categories.json';
import itemData from './data/items.json';
import topicData from './data/topics.json';
import defaults from './data/defaults.json';
import type { CatalogItem, Category, ChecklistItem, SavedState, Topic, Trip } from './types';

export const categories: Category[] = categoryData;
export const catalog: CatalogItem[] = itemData;
export const topics: Topic[] = topicData;
export const STORAGE_KEY = 'roam.checklists.v1';

export function uniqueId(prefix: string) {
	return `${prefix}-${globalThis.crypto.randomUUID()}`;
}

export function normalizeName(name: string) {
	return name.trim().replace(/\s+/g, ' ').toLocaleLowerCase();
}

export function itemsForTopics(topicIds: string[]): CatalogItem[] {
	const ids = new Set(topics.filter((topic) => topicIds.includes(topic.id)).flatMap((topic) => topic.itemIds));
	return catalog.filter((item) => ids.has(item.id));
}

export function createTrip(starter = true): Trip {
	const topicIds = starter ? [...defaults.topicIds] : [];
	return {
		id: uniqueId('trip'),
		name: defaults.tripName,
		destination: defaults.destination,
		departure: '',
		days: defaults.days,
		topicIds,
		categories: categories.map((category) => ({ ...category })),
		items: itemsForTopics(topicIds).map((item) => ({ ...item, quantity: 1, packed: false })),
		savedAt: null
	};
}

export function addItems(trip: Trip, additions: CatalogItem[], manual = false): Trip {
	const ids = new Set(trip.items.map((item) => item.id));
	const names = new Set(trip.items.map((item) => normalizeName(item.name)));
	const newItems: ChecklistItem[] = [];
	for (const item of additions) {
		const name = normalizeName(item.name);
		if (ids.has(item.id) || names.has(name)) continue;
		ids.add(item.id);
		names.add(name);
		newItems.push({ ...item, quantity: 1, packed: false, manual });
	}
	return { ...trip, items: [...trip.items, ...newItems] };
}

export function toggleTopic(trip: Trip, topicId: string): Trip {
	const topic = topics.find((entry) => entry.id === topicId);
	if (!topic) return trip;
	if (!trip.topicIds.includes(topicId)) {
		return addItems({ ...trip, topicIds: [...trip.topicIds, topicId] }, itemsForTopics([topicId]));
	}
	const topicIds = trip.topicIds.filter((id) => id !== topicId);
	const removedIds = new Set(topic.itemIds);
	const remainingIds = new Set(itemsForTopics(topicIds).map((item) => item.id));
	return {
		...trip,
		topicIds,
		items: trip.items.filter((item) => item.manual || item.custom || !removedIds.has(item.id) || remainingIds.has(item.id))
	};
}

export function progress(items: ChecklistItem[]) {
	const packed = items.filter((item) => item.packed).length;
	return { packed, total: items.length, percent: items.length ? Math.round((packed / items.length) * 100) : 0 };
}

export function formatDeparture(departure: string) {
	if (!departure) return 'Dates to be decided';
	const date = new Date(`${departure}T12:00:00`);
	if (Number.isNaN(date.getTime())) return 'Dates to be decided';
	return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readTrip(value: unknown): Trip {
	if (!isRecord(value) || typeof value.id !== 'string' || typeof value.name !== 'string' ||
		typeof value.destination !== 'string' || typeof value.departure !== 'string' ||
		typeof value.days !== 'number' || !Number.isInteger(value.days) || value.days < 1 || value.days > 365 ||
		!Array.isArray(value.topicIds) || !value.topicIds.every((id) => typeof id === 'string') ||
		!Array.isArray(value.categories) || !Array.isArray(value.items) ||
		!(value.savedAt === null || typeof value.savedAt === 'string')) {
		throw new Error('This saved checklist could not be read.');
	}
	const restoredCategories: Category[] = value.categories.map((category: unknown) => {
		if (!isRecord(category) || typeof category.id !== 'string' || typeof category.name !== 'string' ||
			typeof category.icon !== 'string' || typeof category.color !== 'string') throw new Error('Invalid saved category.');
		return { id: category.id, name: category.name, icon: category.icon, color: category.color, custom: category.custom === true };
	});
	const categoryIds = new Set(restoredCategories.map((category) => category.id));
	if (categoryIds.size !== restoredCategories.length) throw new Error('Duplicate saved categories.');
	const ids = new Set<string>();
	const restoredItems: ChecklistItem[] = value.items.map((item: unknown) => {
		if (!isRecord(item) || typeof item.id !== 'string' || typeof item.name !== 'string' ||
			typeof item.categoryId !== 'string' || !categoryIds.has(item.categoryId) ||
			typeof item.quantity !== 'number' || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 99 ||
			typeof item.packed !== 'boolean' || ids.has(item.id)) throw new Error('Invalid saved item.');
		ids.add(item.id);
		return {
			id: item.id, name: item.name, categoryId: item.categoryId, quantity: item.quantity,
			packed: item.packed, custom: item.custom === true, manual: item.manual === true,
			...(typeof item.note === 'string' ? { note: item.note } : {})
		};
	});
	return {
		id: value.id, name: value.name, destination: value.destination, departure: value.departure,
		days: value.days, topicIds: [...new Set(value.topicIds as string[])],
		categories: [...restoredCategories, ...categories.filter((category) => !categoryIds.has(category.id))],
		items: restoredItems, savedAt: value.savedAt
	};
}

export function readSavedState(raw: string): SavedState {
	const value: unknown = JSON.parse(raw);
	if (!isRecord(value) || value.version !== 1 || !Array.isArray(value.trips) ||
		!(value.activeTripId === null || typeof value.activeTripId === 'string')) throw new Error('Unrecognized saved data.');
	const trips = value.trips.map(readTrip);
	if (new Set(trips.map((trip) => trip.id)).size !== trips.length) throw new Error('Duplicate saved trips.');
	return { version: 1, trips, draft: value.draft === null ? null : readTrip(value.draft), activeTripId: value.activeTripId };
}

export function cloneTrip(trip: Trip): Trip {
	return JSON.parse(JSON.stringify(trip));
}
