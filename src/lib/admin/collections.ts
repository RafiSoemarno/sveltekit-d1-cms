import type { CollectionName, HomepageSection } from '$lib/types';

export type FieldType =
	| 'text'
	| 'textarea'
	| 'localizedText'
	| 'localizedTextarea'
	| 'image'
	| 'select'
	| 'url';

export type FieldDef = {
	key: string;
	label: string;
	type: FieldType;
	required?: boolean;
	placeholder?: string;
	maxLength?: number;
	help?: string;
	options?: { value: string | number; label: string }[];
};

export type CollectionConfig = {
	name: CollectionName;
	label: string;
	singular: string;
	path: string;
	listType: 'grid' | 'table';
	labelKey: string;
	thumbnailKey?: string;
	order: 'sort' | 'product' | 'newest' | 'partner';
	cap?: number;
	capPerRow?: number;
	fields: FieldDef[];
};

export const HOMEPAGE_SECTIONS: HomepageSection[] = [
	'slides',
	'partners',
	'stats',
	'services',
	'solutions',
	'testimonies'
];

const localized = (
	key: string,
	label: string,
	type: 'localizedText' | 'localizedTextarea' = 'localizedText'
): FieldDef => ({
	key,
	label,
	type,
	required: true
});

export const COLLECTIONS: Record<CollectionName, CollectionConfig> = {
	slides: {
		name: 'slides',
		label: 'Slides',
		singular: 'Slide',
		path: '/admin/homepage/slides',
		listType: 'grid',
		labelKey: 'title.en',
		thumbnailKey: 'image',
		order: 'sort',
		cap: 8,
		fields: [
			{ key: 'image', label: 'Image', type: 'image', required: true },
			localized('title', 'Title'),
			localized('tagline', 'Tagline'),
			localized('description', 'Description', 'localizedTextarea')
		]
	},
	partners: {
		name: 'partners',
		label: 'Partners',
		singular: 'Partner',
		path: '/admin/homepage/partners',
		listType: 'grid',
		labelKey: 'name',
		thumbnailKey: 'logo',
		order: 'partner',
		capPerRow: 5,
		fields: [
			{ key: 'name', label: 'Name', type: 'text', required: true },
			{ key: 'logo', label: 'Logo', type: 'image', required: true },
			{
				key: 'row',
				label: 'Row',
				type: 'select',
				required: true,
				options: [
					{ value: 1, label: 'Row 1' },
					{ value: 2, label: 'Row 2' }
				]
			}
		]
	},
	stats: {
		name: 'stats',
		label: 'Stats',
		singular: 'Stat',
		path: '/admin/homepage/stats',
		listType: 'grid',
		labelKey: 'label.en',
		thumbnailKey: 'icon',
		order: 'sort',
		cap: 3,
		fields: [
			{ key: 'value', label: 'Value', type: 'text', required: true, maxLength: 12 },
			localized('label', 'Label'),
			{ key: 'icon', label: 'Icon', type: 'image', required: true }
		]
	},
	services: {
		name: 'services',
		label: 'Services',
		singular: 'Service',
		path: '/admin/homepage/services',
		listType: 'grid',
		labelKey: 'name.en',
		thumbnailKey: 'icon',
		order: 'sort',
		fields: [
			localized('name', 'Name'),
			localized('description', 'Description', 'localizedTextarea'),
			{ key: 'icon', label: 'Icon', type: 'image', required: true }
		]
	},
	solutions: {
		name: 'solutions',
		label: 'Solutions',
		singular: 'Solution',
		path: '/admin/homepage/solutions',
		listType: 'grid',
		labelKey: 'title.en',
		thumbnailKey: 'image',
		order: 'sort',
		fields: [
			localized('title', 'Title'),
			localized('description', 'Description', 'localizedTextarea'),
			{ key: 'image', label: 'Image', type: 'image', required: true },
			{ key: 'icon', label: 'Icon', type: 'image', required: true }
		]
	},
	testimonies: {
		name: 'testimonies',
		label: 'Testimonies',
		singular: 'Testimony',
		path: '/admin/homepage/testimonies',
		listType: 'table',
		labelKey: 'name',
		thumbnailKey: 'profileImage',
		order: 'newest',
		fields: [
			localized('paragraph', 'Paragraph', 'localizedTextarea'),
			{ key: 'name', label: 'Name', type: 'text', required: true },
			{ key: 'company', label: 'Company', type: 'text', required: true },
			localized('location', 'Location'),
			{ key: 'profileImage', label: 'Profile photo', type: 'image' },
			{ key: 'linkedinHandle', label: 'LinkedIn handle', type: 'text' },
			{ key: 'linkedinUrl', label: 'LinkedIn URL', type: 'url' }
		]
	},
	products: {
		name: 'products',
		label: 'Products',
		singular: 'Product',
		path: '/admin/products',
		listType: 'table',
		labelKey: 'name',
		thumbnailKey: 'image',
		order: 'product',
		fields: []
	}
};

export function collectionConfig(collection: CollectionName): CollectionConfig {
	return COLLECTIONS[collection];
}

export function isHomepageSection(value: string): value is HomepageSection {
	return (HOMEPAGE_SECTIONS as string[]).includes(value);
}

export function defaultData(collection: CollectionName): Record<string, unknown> {
	switch (collection) {
		case 'slides':
			return {
				image: '',
				title: { en: '', id: '' },
				tagline: { en: '', id: '' },
				description: { en: '', id: '' }
			};
		case 'partners':
			return { name: '', logo: '', row: 1 };
		case 'stats':
			return { value: '', label: { en: '', id: '' }, icon: '' };
		case 'services':
			return { name: { en: '', id: '' }, description: { en: '', id: '' }, icon: '' };
		case 'solutions':
			return {
				title: { en: '', id: '' },
				description: { en: '', id: '' },
				image: '',
				icon: ''
			};
		case 'testimonies':
			return {
				paragraph: { en: '', id: '' },
				name: '',
				company: '',
				location: { en: '', id: '' },
				profileImage: '',
				linkedinHandle: '',
				linkedinUrl: ''
			};
		case 'products':
			return {
				name: '',
				brand: 'acme',
				category: 'hardware',
				image: '',
				gallery: [],
				shortDescription: { en: '', id: '' },
				longDescription: { en: '', id: '' },
				features: [],
				brochures: [],
				seo: { title: { en: '', id: '' }, description: { en: '', id: '' } }
			};
	}
}

export function getPath(source: unknown, path: string): unknown {
	let value: unknown = source;
	for (const part of path.split('.')) {
		if (!value || typeof value !== 'object') return undefined;
		value = (value as Record<string, unknown>)[part];
	}
	return value;
}

export function itemLabel(collection: CollectionName, data: Record<string, unknown>): string {
	const value = getPath(data, COLLECTIONS[collection].labelKey);
	return typeof value === 'string' && value.trim() ? value : 'Untitled';
}

export function itemThumbnail(
	collection: CollectionName,
	data: Record<string, unknown>
): string | undefined {
	const key = COLLECTIONS[collection].thumbnailKey;
	if (!key) return undefined;
	const value = getPath(data, key);
	return typeof value === 'string' && value ? value : undefined;
}

export function slugify(value: string, fallback: string): string {
	const slug = value
		.normalize('NFKD')
		.replace(/[\u0300-\u036f]/g, '')
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '')
		.slice(0, 80)
		.replace(/-+$/g, '');
	return slug || fallback;
}

export function isValidSlug(value: string): boolean {
	return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value) && value.length <= 80;
}

export function rowCount(data: Record<string, unknown>): number {
	return Number(data.row) === 2 ? 2 : 1;
}

export function productCategoryRank(category: unknown, categories: readonly string[]): number {
	const index = categories.indexOf(String(category ?? ''));
	return index === -1 ? categories.length : index;
}
