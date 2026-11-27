import type { Localized } from '$lib/types';

export type CatalogEntry = {
	id: string;
	label: Localized;
};

// Demo catalog. Product records store the `id` values below, so replace these
// entries with your own brands and categories before adding content.
export const BRANDS: CatalogEntry[] = [
	{ id: 'acme', label: { en: 'Acme', id: 'Acme' } },
	{ id: 'globex', label: { en: 'Globex', id: 'Globex' } }
];

export const CATEGORIES: CatalogEntry[] = [
	{ id: 'hardware', label: { en: 'Hardware', id: 'Perangkat Keras' } },
	{ id: 'software', label: { en: 'Software', id: 'Perangkat Lunak' } },
	{ id: 'accessories', label: { en: 'Accessories', id: 'Aksesori' } }
];

export const BRAND_IDS = BRANDS.map((entry) => entry.id);
export const CATEGORY_IDS = CATEGORIES.map((entry) => entry.id);

export function brandLabel(id: string): Localized {
	return BRANDS.find((entry) => entry.id === id)?.label ?? { en: id, id };
}

export function categoryLabel(id: string): Localized {
	return CATEGORIES.find((entry) => entry.id === id)?.label ?? { en: id, id };
}
