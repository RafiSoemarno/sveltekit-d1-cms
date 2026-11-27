import type { D1Database, D1PreparedStatement } from '@cloudflare/workers-types';
import {
	COLLECTIONS,
	collectionConfig,
	defaultData,
	getPath,
	isValidSlug,
	itemLabel,
	rowCount,
	slugify
} from '$lib/admin/collections';
import { sortContent, type ContentEntry } from '$lib/server/content';
import { partnerRowCounts, validatePublish, validateSettings } from '$lib/server/validation';
import type { AdminItem, CollectionName, ContentStatus, SiteSettings } from '$lib/types';

export type LiveRow = {
	id: string;
	data: string;
	sort_order: number;
	created_at: string;
	updated_at: string;
	published_at: string | null;
};

export type DraftRow = {
	id: string;
	data: string;
	created_at: string;
	updated_at: string;
};

export type RevisionRow = {
	revision_id: string;
	collection: CollectionName;
	item_id: string;
	data: string;
	status: 'draft' | 'published';
	action: 'save' | 'publish' | 'unpublish' | 'restore' | 'delete';
	note: string | null;
	created_at: string;
};

export type AdminItemView = AdminItem & {
	live: boolean;
	draft: boolean;
	everPublished: boolean;
};

export type DeletedItem = {
	collection: CollectionName;
	id: string;
	data: Record<string, unknown>;
	deletedAt: string;
	note: string | null;
	revisionId: string;
};

export type RevisionView = {
	revisionId: string;
	action: RevisionRow['action'];
	status: RevisionRow['status'];
	note: string | null;
	createdAt: string;
	data: Record<string, unknown>;
};

export type AdminCounts = {
	live: number;
	drafts: number;
	lastUpdated: string | null;
};

export type DraftSummary = {
	collection: CollectionName;
	id: string;
	label: string;
	path: string;
	updatedAt: string;
};

function nowIso(): string {
	return new Date().toISOString();
}

function parse<T = Record<string, unknown>>(data: string): T {
	return JSON.parse(data) as T;
}

function normalizeNote(note: unknown): string | null {
	if (typeof note !== 'string') return null;
	const trimmed = note.trim().slice(0, 200);
	return trimmed.length > 0 ? trimmed : null;
}

function toContentEntry(
	id: string,
	data: string,
	sortOrder: number,
	publishedAt: string | null,
	createdAt: string
): ContentEntry {
	return { id, data: parse(data), sortOrder, publishedAt, createdAt };
}

function statusOf(live: boolean, draft: boolean): ContentStatus {
	if (live && draft) return 'published-draft';
	if (live) return 'published';
	return 'draft';
}

export function editorPath(collection: CollectionName, id?: string): string {
	const base = COLLECTIONS[collection].path;
	if (!id) return `${base}/new`;
	return `${base}/${encodeURIComponent(id)}`;
}

export async function listAdminItems(
	db: D1Database,
	collection: CollectionName
): Promise<AdminItemView[]> {
	const liveRows = await db
		.prepare(
			`SELECT id, data, sort_order, created_at, updated_at, published_at
			 FROM content_items WHERE collection = ? AND status = 'published'`
		)
		.bind(collection)
		.all<LiveRow>();
	const draftRows = await db
		.prepare(
			`SELECT id, data, created_at, updated_at
			 FROM content_drafts WHERE collection = ?`
		)
		.bind(collection)
		.all<DraftRow>();

	const liveById = new Map((liveRows.results ?? []).map((row) => [row.id, row]));
	const draftById = new Map((draftRows.results ?? []).map((row) => [row.id, row]));
	const ids = new Set([...liveById.keys(), ...draftById.keys()]);

	const entries: ContentEntry[] = [...ids].map((id) => {
		const live = liveById.get(id);
		const draft = draftById.get(id);
		return toContentEntry(
			id,
			draft?.data ?? live?.data ?? '{}',
			live?.sort_order ?? 0,
			live?.published_at ?? null,
			live?.created_at ?? draft?.created_at ?? nowIso()
		);
	});

	const sorted = sortContent(collection, entries);
	return sorted.map((entry) => {
		const live = liveById.get(entry.id);
		const draft = draftById.get(entry.id);
		return {
			collection,
			id: entry.id,
			data: entry.data,
			status: statusOf(Boolean(live), Boolean(draft)),
			updatedAt: latestTimestamp(live?.updated_at, draft?.updated_at),
			publishedAt: live?.published_at ?? null,
			createdAt: entry.createdAt,
			live: Boolean(live),
			draft: Boolean(draft),
			everPublished: Boolean(live)
		};
	});
}

function latestTimestamp(a?: string | null, b?: string | null): string {
	if (!a) return b ?? nowIso();
	if (!b) return a;
	return a > b ? a : b;
}

export async function getAdminItem(
	db: D1Database,
	collection: CollectionName,
	id: string
): Promise<AdminItemView | undefined> {
	const live = await db
		.prepare(
			`SELECT id, data, sort_order, created_at, updated_at, published_at
			 FROM content_items WHERE collection = ? AND id = ? LIMIT 1`
		)
		.bind(collection, id)
		.first<LiveRow>();
	const draft = await db
		.prepare(
			`SELECT id, data, created_at, updated_at
			 FROM content_drafts WHERE collection = ? AND id = ? LIMIT 1`
		)
		.bind(collection, id)
		.first<DraftRow>();

	if (!live && !draft) return undefined;

	const everPublished = Boolean(live) || (await hasPublishedRevision(db, collection, id));
	return {
		collection,
		id,
		data: parse(draft?.data ?? live?.data ?? '{}'),
		status: statusOf(Boolean(live), Boolean(draft)),
		updatedAt: latestTimestamp(live?.updated_at, draft?.updated_at),
		publishedAt: live?.published_at ?? null,
		createdAt: live?.created_at ?? draft?.created_at ?? nowIso(),
		live: Boolean(live),
		draft: Boolean(draft),
		everPublished
	};
}

async function hasPublishedRevision(
	db: D1Database,
	collection: CollectionName,
	id: string
): Promise<boolean> {
	const row = await db
		.prepare(
			`SELECT 1 AS found FROM content_revisions
			 WHERE collection = ? AND item_id = ? AND action = 'publish' LIMIT 1`
		)
		.bind(collection, id)
		.first<{ found: number }>();
	return Boolean(row);
}

export async function getRevisions(
	db: D1Database,
	collection: CollectionName,
	id: string,
	limit = 50
): Promise<RevisionView[]> {
	const { results } = await db
		.prepare(
			`SELECT revision_id, collection, item_id, data, status, action, note, created_at
			 FROM content_revisions
			 WHERE collection = ? AND item_id = ?
			 ORDER BY created_at DESC, rowid DESC
			 LIMIT ?`
		)
		.bind(collection, id, limit)
		.all<RevisionRow>();
	return (results ?? []).map((row) => ({
		revisionId: row.revision_id,
		action: row.action,
		status: row.status,
		note: row.note,
		createdAt: row.created_at,
		data: parse(row.data)
	}));
}

export async function listDeleted(
	db: D1Database,
	collection: CollectionName
): Promise<DeletedItem[]> {
	const { results } = await db
		.prepare(
			`SELECT r.revision_id, r.collection, r.item_id, r.data, r.note, r.created_at
			 FROM content_revisions r
			 WHERE r.collection = ?
			   AND r.action = 'delete'
			   AND r.rowid = (
			     SELECT r2.rowid FROM content_revisions r2
			     WHERE r2.collection = r.collection
			       AND r2.item_id = r.item_id
			       AND r2.action = 'delete'
			     ORDER BY r2.created_at DESC, r2.rowid DESC LIMIT 1
			   )
			   AND NOT EXISTS (
			     SELECT 1 FROM content_items ci
			     WHERE ci.collection = r.collection AND ci.id = r.item_id
			   )
			   AND NOT EXISTS (
			     SELECT 1 FROM content_drafts cd
			     WHERE cd.collection = r.collection AND cd.id = r.item_id
			   )
			 ORDER BY r.created_at DESC, r.rowid DESC`
		)
		.bind(collection)
		.all<{
			revision_id: string;
			collection: CollectionName;
			item_id: string;
			data: string;
			note: string | null;
			created_at: string;
		}>();

	return (results ?? []).map((row) => ({
		collection,
		id: row.item_id,
		data: parse(row.data),
		deletedAt: row.created_at,
		note: row.note,
		revisionId: row.revision_id
	}));
}

export async function listDrafts(db: D1Database): Promise<DraftSummary[]> {
	const { results } = await db
		.prepare(
			`SELECT collection, id, data, updated_at
			 FROM content_drafts ORDER BY updated_at DESC`
		)
		.all<{ collection: CollectionName; id: string; data: string; updated_at: string }>();

	return (results ?? []).map((row) => ({
		collection: row.collection,
		id: row.id,
		label: itemLabel(row.collection, parse(row.data)),
		path: editorPath(row.collection, row.id),
		updatedAt: row.updated_at
	}));
}

export async function getCounts(db: D1Database): Promise<Record<CollectionName, AdminCounts>> {
	const counts = Object.fromEntries(
		Object.keys(COLLECTIONS).map((collection) => [
			collection,
			{ live: 0, drafts: 0, lastUpdated: null }
		])
	) as Record<CollectionName, AdminCounts>;

	const live = await db
		.prepare(
			`SELECT collection, COUNT(*) AS count, MAX(updated_at) AS last_updated
			 FROM content_items WHERE status = 'published' GROUP BY collection`
		)
		.all<{ collection: CollectionName; count: number; last_updated: string | null }>();
	for (const row of live.results ?? []) {
		const entry = counts[row.collection];
		if (!entry) continue;
		entry.live = Number(row.count);
		entry.lastUpdated = row.last_updated;
	}

	const drafts = await db
		.prepare(
			`SELECT collection, COUNT(*) AS count, MAX(updated_at) AS last_updated
			 FROM content_drafts GROUP BY collection`
		)
		.all<{ collection: CollectionName; count: number; last_updated: string | null }>();
	for (const row of drafts.results ?? []) {
		const entry = counts[row.collection];
		if (!entry) continue;
		entry.drafts = Number(row.count);
		if (!entry.lastUpdated || (row.last_updated && row.last_updated > entry.lastUpdated)) {
			entry.lastUpdated = row.last_updated;
		}
	}

	return counts;
}

async function collectionIds(
	db: D1Database,
	collection: CollectionName,
	excludeId?: string
): Promise<{ live: string[]; drafts: string[]; reserved: string[] }> {
	const live = await db
		.prepare(`SELECT id FROM content_items WHERE collection = ?`)
		.bind(collection)
		.all<{ id: string }>();
	const drafts = await db
		.prepare(`SELECT id FROM content_drafts WHERE collection = ?`)
		.bind(collection)
		.all<{ id: string }>();
	const reserved = await db
		.prepare(`SELECT DISTINCT item_id AS id FROM content_revisions WHERE collection = ?`)
		.bind(collection)
		.all<{ id: string }>();

	const filter = (rows: { id: string }[] | undefined) =>
		(rows ?? []).map((row) => row.id).filter((id) => id !== excludeId);

	return {
		live: filter(live.results),
		drafts: filter(drafts.results),
		reserved: filter(reserved.results)
	};
}

export async function idIsTaken(
	db: D1Database,
	collection: CollectionName,
	id: string,
	excludeId?: string
): Promise<boolean> {
	if (id === excludeId) return false;
	const ids = await collectionIds(db, collection, excludeId);
	return ids.live.includes(id) || ids.drafts.includes(id) || ids.reserved.includes(id);
}

export async function generateId(
	db: D1Database,
	collection: CollectionName,
	base: string
): Promise<string> {
	const fallback = `${collection}-${crypto.randomUUID().slice(0, 8)}`;
	let candidate = slugify(base, fallback);
	if (!isValidSlug(candidate)) candidate = fallback;
	let attempt = 1;

	while (await idIsTaken(db, collection, candidate)) {
		attempt += 1;
		candidate = `${slugify(base, fallback)}-${attempt}`;
	}

	return candidate;
}

export async function productSlugTaken(
	db: D1Database,
	slug: string,
	excludeId?: string
): Promise<boolean> {
	const ids = await collectionIds(db, 'products', excludeId);
	return ids.live.includes(slug) || ids.drafts.includes(slug) || ids.reserved.includes(slug);
}

export class AdminError extends Error {}

function revisionStatement(
	db: D1Database,
	collection: CollectionName,
	id: string,
	data: Record<string, unknown>,
	status: RevisionRow['status'],
	action: RevisionRow['action'],
	note: string | null,
	createdAt: string
): D1PreparedStatement {
	return db
		.prepare(
			`INSERT INTO content_revisions
			 (revision_id, collection, item_id, data, status, action, note, created_at)
			 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
		)
		.bind(
			crypto.randomUUID(),
			collection,
			id,
			JSON.stringify(data),
			status,
			action,
			note,
			createdAt
		);
}

function pruneStatement(
	db: D1Database,
	collection: CollectionName,
	id: string
): D1PreparedStatement {
	return db
		.prepare(
			`DELETE FROM content_revisions
			 WHERE collection = ? AND item_id = ?
			   AND rowid NOT IN (
			     SELECT rowid FROM content_revisions
			     WHERE collection = ? AND item_id = ?
			     ORDER BY created_at DESC, rowid DESC LIMIT 50
			   )`
		)
		.bind(collection, id, collection, id);
}

export type SaveDraftInput = {
	collection: CollectionName;
	id: string;
	data: Record<string, unknown>;
	note?: string;
	previousId?: string;
};

export async function saveDraft(db: D1Database, input: SaveDraftInput): Promise<{ id: string }> {
	const { collection, data, previousId } = input;
	const note = normalizeNote(input.note);
	const now = nowIso();
	let id = input.id;

	if (!id) {
		id = await generateId(db, collection, itemLabel(collection, data));
	}

	const live = await db
		.prepare(`SELECT id, created_at FROM content_items WHERE collection = ? AND id = ? LIMIT 1`)
		.bind(collection, id)
		.first<{ id: string; created_at: string }>();

	if (previousId && previousId !== id) {
		const previousLive = await db
			.prepare(`SELECT id FROM content_items WHERE collection = ? AND id = ? LIMIT 1`)
			.bind(collection, previousId)
			.first<{ id: string }>();
		if (previousLive) {
			throw new AdminError('The slug cannot change after the product is published.');
		}
		if (await idIsTaken(db, collection, id, previousId)) {
			throw new AdminError('That slug is already in use.');
		}
		const previousDraft = await db
			.prepare(`SELECT created_at FROM content_drafts WHERE collection = ? AND id = ? LIMIT 1`)
			.bind(collection, previousId)
			.first<{ created_at: string }>();

		const statements: D1PreparedStatement[] = [
			db
				.prepare(
					`INSERT INTO content_drafts (collection, id, data, created_at, updated_at)
					 VALUES (?, ?, ?, ?, ?)
					 ON CONFLICT(collection, id) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at`
				)
				.bind(collection, id, JSON.stringify(data), previousDraft?.created_at ?? now, now),
			db
				.prepare(`DELETE FROM content_drafts WHERE collection = ? AND id = ?`)
				.bind(collection, previousId),
			db
				.prepare(`UPDATE content_revisions SET item_id = ? WHERE collection = ? AND item_id = ?`)
				.bind(id, collection, previousId),
			revisionStatement(db, collection, id, data, 'draft', 'save', note, now),
			pruneStatement(db, collection, id)
		];
		await db.batch(statements);
		return { id };
	}

	if (!live) {
		const existingDraft = await db
			.prepare(`SELECT id FROM content_drafts WHERE collection = ? AND id = ? LIMIT 1`)
			.bind(collection, id)
			.first<{ id: string }>();
		if (!existingDraft && (await idIsTaken(db, collection, id))) {
			throw new AdminError('That ID is already in use.');
		}
	}

	await db.batch([
		db
			.prepare(
				`INSERT INTO content_drafts (collection, id, data, created_at, updated_at)
				 VALUES (?, ?, ?, ?, ?)
				 ON CONFLICT(collection, id) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at`
			)
			.bind(collection, id, JSON.stringify(data), now, now),
		revisionStatement(db, collection, id, data, 'draft', 'save', note, now),
		pruneStatement(db, collection, id)
	]);

	return { id };
}

async function nextSortOrder(db: D1Database, collection: CollectionName): Promise<number> {
	const row = await db
		.prepare(
			`SELECT COALESCE(MAX(sort_order), -1) AS max_order FROM content_items WHERE collection = ?`
		)
		.bind(collection)
		.first<{ max_order: number }>();
	return Number(row?.max_order ?? -1) + 1;
}

export type PublishResult = {
	ok: boolean;
	errors: string[];
};

export async function publishItem(
	db: D1Database,
	collection: CollectionName,
	id: string,
	noteInput?: string
): Promise<PublishResult> {
	const live = await db
		.prepare(
			`SELECT id, data, sort_order, created_at, updated_at, published_at
			 FROM content_items WHERE collection = ? AND id = ? LIMIT 1`
		)
		.bind(collection, id)
		.first<LiveRow>();
	const draft = await db
		.prepare(
			`SELECT id, data, created_at, updated_at
			 FROM content_drafts WHERE collection = ? AND id = ? LIMIT 1`
		)
		.bind(collection, id)
		.first<DraftRow>();

	if (!live && !draft) return { ok: false, errors: ['Item not found.'] };

	const data = parse(draft?.data ?? live?.data ?? '{}');
	if (collection === 'products') {
		data.slug = id;
	}

	const ids = await collectionIds(db, collection, id);
	const collectionCount = ids.live.length + ids.drafts.length;
	let rowCounts: Record<number, number> = { 1: 0, 2: 0 };
	if (collection === 'partners') {
		const { results } = await db
			.prepare(`SELECT id, data FROM content_items WHERE collection = 'partners'`)
			.all<{ id: string; data: string }>();
		const draftRows = await db
			.prepare(`SELECT id, data FROM content_drafts WHERE collection = 'partners'`)
			.all<{ id: string; data: string }>();
		const items = [...(results ?? []), ...(draftRows.results ?? [])].map((row) => ({
			id: row.id,
			data: parse(row.data)
		}));
		rowCounts = partnerRowCounts(items, id);
	}

	const validation = validatePublish(collection, data, {
		otherIds: [...ids.live, ...ids.drafts].filter((itemId) => itemId !== id),
		reservedIds: ids.reserved.filter((itemId) => itemId !== id),
		collectionCount,
		rowCounts
	});

	if (!validation.ok) return { ok: false, errors: validation.errors };

	const now = nowIso();
	const note = normalizeNote(noteInput);
	const sortOrder =
		collection === 'slides' ||
		collection === 'solutions' ||
		collection === 'services' ||
		collection === 'stats'
			? (live?.sort_order ?? (await nextSortOrder(db, collection)))
			: 0;
	const publishedAt = live?.published_at ?? now;
	const createdAt = live?.created_at ?? now;

	await db.batch([
		db
			.prepare(
				`INSERT INTO content_items
				 (collection, id, status, sort_order, data, created_at, updated_at, published_at)
				 VALUES (?, ?, 'published', ?, ?, ?, ?, ?)
				 ON CONFLICT(collection, id) DO UPDATE SET
				   status = 'published',
				   sort_order = excluded.sort_order,
				   data = excluded.data,
				   updated_at = excluded.updated_at,
				   published_at = excluded.published_at`
			)
			.bind(collection, id, sortOrder, JSON.stringify(data), createdAt, now, publishedAt),
		db.prepare(`DELETE FROM content_drafts WHERE collection = ? AND id = ?`).bind(collection, id),
		revisionStatement(db, collection, id, data, 'published', 'publish', note, now),
		pruneStatement(db, collection, id)
	]);

	return { ok: true, errors: [] };
}

export async function unpublishItem(
	db: D1Database,
	collection: CollectionName,
	id: string,
	noteInput?: string
): Promise<PublishResult> {
	const live = await db
		.prepare(
			`SELECT id, data, sort_order, created_at, updated_at, published_at
			 FROM content_items WHERE collection = ? AND id = ? LIMIT 1`
		)
		.bind(collection, id)
		.first<LiveRow>();
	if (!live) return { ok: false, errors: ['Item is not published.'] };

	const draft = await db
		.prepare(`SELECT id FROM content_drafts WHERE collection = ? AND id = ? LIMIT 1`)
		.bind(collection, id)
		.first<{ id: string }>();

	const now = nowIso();
	const note = normalizeNote(noteInput);
	const statements: D1PreparedStatement[] = [
		db.prepare(`DELETE FROM content_items WHERE collection = ? AND id = ?`).bind(collection, id),
		revisionStatement(db, collection, id, parse(live.data), 'published', 'unpublish', note, now),
		pruneStatement(db, collection, id)
	];

	if (!draft) {
		statements.push(
			db
				.prepare(
					`INSERT INTO content_drafts (collection, id, data, created_at, updated_at)
					 VALUES (?, ?, ?, ?, ?)`
				)
				.bind(collection, id, live.data, live.created_at, now)
		);
	}

	await db.batch(statements);
	return { ok: true, errors: [] };
}

export async function deleteItem(
	db: D1Database,
	collection: CollectionName,
	id: string,
	noteInput?: string
): Promise<PublishResult> {
	const live = await db
		.prepare(`SELECT id, data FROM content_items WHERE collection = ? AND id = ? LIMIT 1`)
		.bind(collection, id)
		.first<{ id: string; data: string }>();
	const draft = await db
		.prepare(`SELECT id, data FROM content_drafts WHERE collection = ? AND id = ? LIMIT 1`)
		.bind(collection, id)
		.first<{ id: string; data: string }>();

	if (!live && !draft) return { ok: false, errors: ['Item not found.'] };

	const now = nowIso();
	const note = normalizeNote(noteInput);
	const statements: D1PreparedStatement[] = [];

	if (live) {
		statements.push(
			revisionStatement(db, collection, id, parse(live.data), 'published', 'delete', note, now)
		);
	}
	if (draft) {
		statements.push(
			revisionStatement(db, collection, id, parse(draft.data), 'draft', 'delete', note, now)
		);
	}

	statements.push(
		db.prepare(`DELETE FROM content_items WHERE collection = ? AND id = ?`).bind(collection, id),
		db.prepare(`DELETE FROM content_drafts WHERE collection = ? AND id = ?`).bind(collection, id),
		pruneStatement(db, collection, id)
	);

	await db.batch(statements);
	return { ok: true, errors: [] };
}

export async function restoreRevision(
	db: D1Database,
	collection: CollectionName,
	id: string,
	revisionId: string,
	noteInput?: string
): Promise<PublishResult> {
	const revision = await db
		.prepare(
			`SELECT revision_id, data FROM content_revisions
			 WHERE revision_id = ? AND collection = ? AND item_id = ? LIMIT 1`
		)
		.bind(revisionId, collection, id)
		.first<{ revision_id: string; data: string }>();
	if (!revision) return { ok: false, errors: ['Revision not found.'] };

	const data = parse(revision.data);
	const ids = await collectionIds(db, collection, id);
	const count = ids.live.length + ids.drafts.length;
	const config = COLLECTIONS[collection];
	if (config.cap && count >= config.cap) {
		return {
			ok: false,
			errors: [`${config.label} is capped at ${config.cap} items. Delete an item before restoring.`]
		};
	}
	if (collection === 'partners') {
		const { results } = await db
			.prepare(`SELECT id, data FROM content_items WHERE collection = 'partners'`)
			.all<{ id: string; data: string }>();
		const draftRows = await db
			.prepare(`SELECT id, data FROM content_drafts WHERE collection = 'partners'`)
			.all<{ id: string; data: string }>();
		const items = [...(results ?? []), ...(draftRows.results ?? [])].map((row) => ({
			id: row.id,
			data: parse(row.data)
		}));
		const counts = partnerRowCounts(items, id);
		const row = rowCount(data);
		if ((counts[row] ?? 0) >= 5) {
			return {
				ok: false,
				errors: [`Row ${row} already has the maximum of 5 partners.`]
			};
		}
	}

	const existingDraft = await db
		.prepare(`SELECT created_at FROM content_drafts WHERE collection = ? AND id = ? LIMIT 1`)
		.bind(collection, id)
		.first<{ created_at: string }>();
	const now = nowIso();
	const note = normalizeNote(noteInput);

	await db.batch([
		db
			.prepare(
				`INSERT INTO content_drafts (collection, id, data, created_at, updated_at)
				 VALUES (?, ?, ?, ?, ?)
				 ON CONFLICT(collection, id) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at`
			)
			.bind(collection, id, JSON.stringify(data), existingDraft?.created_at ?? now, now),
		revisionStatement(db, collection, id, data, 'draft', 'restore', note, now),
		pruneStatement(db, collection, id)
	]);

	return { ok: true, errors: [] };
}

export async function restoreDeleted(
	db: D1Database,
	collection: CollectionName,
	id: string,
	noteInput?: string
): Promise<PublishResult> {
	const deleted = await listDeleted(db, collection);
	const item = deleted.find((entry) => entry.id === id);
	if (!item) return { ok: false, errors: ['Deleted item not found.'] };
	return restoreRevision(db, collection, id, item.revisionId, noteInput);
}

export async function saveSettings(db: D1Database, settings: SiteSettings): Promise<PublishResult> {
	const validation = validateSettings(settings);
	if (!validation.ok) return validation;
	await db
		.prepare(
			`INSERT INTO site_settings (id, data, updated_at)
			 VALUES ('site', ?, ?)
			 ON CONFLICT(id) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at`
		)
		.bind(JSON.stringify(settings), nowIso())
		.run();
	return { ok: true, errors: [] };
}

export function newItemData(collection: CollectionName): Record<string, unknown> {
	return defaultData(collection);
}

export function collectionItems(collection: CollectionName) {
	return COLLECTIONS[collection];
}

export function labelFor(collection: CollectionName, data: Record<string, unknown>): string {
	return itemLabel(collection, data);
}

export function dataPath(data: Record<string, unknown>, path: string): unknown {
	return getPath(data, path);
}

export function defaultRow(collection: CollectionName): number {
	if (collection !== 'partners') return 1;
	return 1;
}

export function rowOf(data: Record<string, unknown>): number {
	return rowCount(data);
}

export { collectionConfig, normalizeNote };
