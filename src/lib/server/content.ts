import type { D1Database } from '@cloudflare/workers-types';
import { productCategoryRank, rowCount } from '$lib/admin/collections';
import { DEFAULT_SETTINGS } from '$lib/settings';
import { CATEGORY_IDS } from '$lib/catalog';
import {
	type CarouselSlide,
	type CollectionName,
	type Partner,
	type Product,
	type ProductWithSlug,
	type Service,
	type SiteSettings,
	type Solution,
	type Stat,
	type Testimony
} from '$lib/types';

export type { CollectionName } from '$lib/types';

export type CollectionMap = {
	slides: CarouselSlide;
	products: Product;
	solutions: Solution;
	services: Service;
	stats: Stat;
	testimonies: Testimony;
	partners: Partner;
};

export type ContentEntry = {
	id: string;
	data: Record<string, unknown>;
	sortOrder: number;
	publishedAt: string | null;
	createdAt: string;
};

type PublishedRow = {
	id: string;
	data: string;
	sort_order: number;
	created_at: string;
	published_at: string | null;
};

type DraftRow = {
	id: string;
	data: string;
	created_at: string;
	updated_at: string;
};

function parseData(data: string): Record<string, unknown> {
	return JSON.parse(data) as Record<string, unknown>;
}

function publishedEntry(row: PublishedRow): ContentEntry {
	return {
		id: row.id,
		data: parseData(row.data),
		sortOrder: row.sort_order,
		publishedAt: row.published_at,
		createdAt: row.created_at
	};
}

function draftEntry(row: DraftRow): ContentEntry {
	return {
		id: row.id,
		data: parseData(row.data),
		sortOrder: 0,
		publishedAt: null,
		createdAt: row.created_at
	};
}

function compareEntries(collection: CollectionName, a: ContentEntry, b: ContentEntry): number {
	const nameA = typeof a.data.name === 'string' ? a.data.name : '';
	const nameB = typeof b.data.name === 'string' ? b.data.name : '';

	switch (collection) {
		case 'products': {
			const rank =
				productCategoryRank(a.data.category, CATEGORY_IDS) -
				productCategoryRank(b.data.category, CATEGORY_IDS);
			return rank || nameA.localeCompare(nameB) || a.id.localeCompare(b.id);
		}
		case 'testimonies': {
			const aTime = a.publishedAt ?? a.createdAt;
			const bTime = b.publishedAt ?? b.createdAt;
			return bTime.localeCompare(aTime) || a.id.localeCompare(b.id);
		}
		case 'partners': {
			const row = rowCount(a.data) - rowCount(b.data);
			return row || nameA.localeCompare(nameB) || a.id.localeCompare(b.id);
		}
		default:
			return a.sortOrder - b.sortOrder || a.id.localeCompare(b.id);
	}
}

export function sortContent(collection: CollectionName, entries: ContentEntry[]): ContentEntry[] {
	return [...entries].sort((a, b) => compareEntries(collection, a, b));
}

async function publishedEntries(
	db: D1Database,
	collection: CollectionName
): Promise<ContentEntry[]> {
	const { results } = await db
		.prepare(
			`SELECT id, data, sort_order, created_at, published_at
			 FROM content_items
			 WHERE collection = ? AND status = 'published'`
		)
		.bind(collection)
		.all<PublishedRow>();
	return sortContent(collection, (results ?? []).map(publishedEntry));
}

async function draftRows(db: D1Database, collection: CollectionName): Promise<DraftRow[]> {
	const { results } = await db
		.prepare(
			`SELECT id, data, created_at, updated_at
			 FROM content_drafts
			 WHERE collection = ?`
		)
		.bind(collection)
		.all<DraftRow>();
	return results ?? [];
}

/**
 * Published content, optionally overlaid with drafts for the maintainer's preview.
 */
export async function listContent(
	db: D1Database,
	collection: CollectionName,
	preview = false
): Promise<ContentEntry[]> {
	const live = await publishedEntries(db, collection);
	if (!preview) return live;

	const drafts = await draftRows(db, collection);
	const draftById = new Map(drafts.map((row) => [row.id, row]));
	const merged: ContentEntry[] = live.map((entry) => {
		const draft = draftById.get(entry.id);
		if (!draft) return entry;
		draftById.delete(entry.id);
		return { ...entry, data: parseData(draft.data) };
	});

	for (const draft of draftById.values()) {
		merged.push(draftEntry(draft));
	}

	return sortContent(collection, merged);
}

export async function getContent(
	db: D1Database,
	collection: CollectionName,
	id: string,
	preview = false
): Promise<ContentEntry | undefined> {
	const live = await db
		.prepare(
			`SELECT id, data, sort_order, created_at, published_at
			 FROM content_items
			 WHERE collection = ? AND id = ? AND status = 'published'
			 LIMIT 1`
		)
		.bind(collection, id)
		.first<PublishedRow>();

	if (preview) {
		const draft = await db
			.prepare(
				`SELECT id, data, created_at, updated_at
				 FROM content_drafts
				 WHERE collection = ? AND id = ?
				 LIMIT 1`
			)
			.bind(collection, id)
			.first<DraftRow>();
		if (draft) {
			return live ? { ...publishedEntry(live), data: parseData(draft.data) } : draftEntry(draft);
		}
	}

	return live ? publishedEntry(live) : undefined;
}

export async function listPublished<C extends CollectionName>(
	db: D1Database,
	collection: C
): Promise<CollectionMap[C][]> {
	const entries = await publishedEntries(db, collection);
	return entries.map((entry) => entry.data as CollectionMap[C]);
}

export async function getPublished<C extends CollectionName>(
	db: D1Database,
	collection: C,
	id: string
): Promise<CollectionMap[C] | undefined> {
	const entry = await getContent(db, collection, id, false);
	return entry ? (entry.data as CollectionMap[C]) : undefined;
}

export async function listPublishedMany<C extends CollectionName>(
	db: D1Database,
	collections: readonly C[],
	preview = false
): Promise<{ [K in C]: CollectionMap[K][] }> {
	const grouped = Object.fromEntries(collections.map((name) => [name, []])) as unknown as {
		[K in C]: CollectionMap[K][];
	};

	await Promise.all(
		collections.map(async (collection) => {
			const entries = await listContent(db, collection, preview);
			grouped[collection] = entries.map(
				(entry) => entry.data
			) as CollectionMap[typeof collection][];
		})
	);

	return grouped;
}

export async function listProducts(db: D1Database, preview = false): Promise<ProductWithSlug[]> {
	const entries = await listContent(db, 'products', preview);
	return entries.map((entry) => ({
		...(entry.data as Product),
		slug: entry.id
	}));
}

export async function listPublishedProducts(db: D1Database): Promise<ProductWithSlug[]> {
	return listProducts(db, false);
}

export async function getProduct(
	db: D1Database,
	slug: string,
	preview = false
): Promise<ProductWithSlug | undefined> {
	const entry = await getContent(db, 'products', slug, preview);
	return entry ? { ...(entry.data as Product), slug: entry.id } : undefined;
}

export async function getPublishedProduct(
	db: D1Database,
	slug: string
): Promise<ProductWithSlug | undefined> {
	return getProduct(db, slug, false);
}

function mergeSettings(value: unknown): SiteSettings {
	if (!value || typeof value !== 'object') return DEFAULT_SETTINGS;
	const data = value as Partial<SiteSettings>;
	return {
		contact: { ...DEFAULT_SETTINGS.contact, ...(data.contact ?? {}) },
		seo: {
			...DEFAULT_SETTINGS.seo,
			...(data.seo ?? {}),
			title: { ...DEFAULT_SETTINGS.seo.title, ...(data.seo?.title ?? {}) },
			description: {
				...DEFAULT_SETTINGS.seo.description,
				...(data.seo?.description ?? {})
			}
		}
	};
}

export async function getSiteSettings(db: D1Database): Promise<SiteSettings> {
	const row = await db
		.prepare(`SELECT data FROM site_settings WHERE id = 'site' LIMIT 1`)
		.first<{ data: string }>();
	if (!row) return DEFAULT_SETTINGS;
	try {
		return mergeSettings(JSON.parse(row.data));
	} catch {
		return DEFAULT_SETTINGS;
	}
}

export async function getAvailability(
	db: D1Database,
	preview = false
): Promise<Record<CollectionName, boolean>> {
	const { results } = await db
		.prepare(
			`SELECT collection, COUNT(*) AS count
			 FROM content_items
			 WHERE status = 'published'
			 GROUP BY collection`
		)
		.all<{ collection: CollectionName; count: number }>();

	const counts = new Map<CollectionName, number>();
	for (const row of results ?? []) {
		counts.set(row.collection, Number(row.count));
	}

	if (preview) {
		const drafts = await db
			.prepare(`SELECT collection, COUNT(*) AS count FROM content_drafts GROUP BY collection`)
			.all<{ collection: CollectionName; count: number }>();
		for (const row of drafts.results ?? []) {
			counts.set(row.collection, (counts.get(row.collection) ?? 0) + Number(row.count));
		}
	}

	return {
		slides: (counts.get('slides') ?? 0) > 0,
		products: (counts.get('products') ?? 0) > 0,
		solutions: (counts.get('solutions') ?? 0) > 0,
		services: (counts.get('services') ?? 0) > 0,
		stats: (counts.get('stats') ?? 0) > 0,
		testimonies: (counts.get('testimonies') ?? 0) > 0,
		partners: (counts.get('partners') ?? 0) > 0
	};
}
