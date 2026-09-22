export type Category = {
	id: string;
	name: string;
	icon: string;
	color: string;
	custom?: boolean;
};

export type CatalogItem = { id: string; name: string; categoryId: string; note?: string };
export type Topic = {
	id: string;
	name: string;
	description: string;
	icon: string;
	color: string;
	group: string;
	itemIds: string[];
};

export type ChecklistItem = CatalogItem & {
	quantity: number;
	packed: boolean;
	custom?: boolean;
	manual?: boolean;
};

export type Trip = {
	id: string;
	name: string;
	destination: string;
	departure: string;
	days: number;
	topicIds: string[];
	categories: Category[];
	items: ChecklistItem[];
	savedAt: string | null;
};

export type SavedState = { version: 1; trips: Trip[]; draft: Trip | null; activeTripId: string | null };
export type TripDetails = Pick<Trip, 'name' | 'destination' | 'departure' | 'days'>;
