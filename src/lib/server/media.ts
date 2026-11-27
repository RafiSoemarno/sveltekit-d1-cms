import type { D1Database, R2Bucket, R2Object } from '@cloudflare/workers-types';
import { itemLabel } from '$lib/admin/collections';
import type { CollectionName, MediaAsset } from '$lib/types';

export type { MediaAsset } from '$lib/types';

export type MediaReference = {
	kind: 'live' | 'draft' | 'settings' | 'revision';
	collection: CollectionName | 'settings';
	id: string;
	label: string;
	revisionId?: string;
};

export type MediaUsage = {
	total: number;
	live: number;
	drafts: number;
	settings: number;
	revisions: number;
	references: MediaReference[];
};

export type UploadResult = MediaAsset & { deduped: boolean };

const MEDIA_PREFIX = '/media/';

export function mediaUrl(key: string): string {
	return `${MEDIA_PREFIX}${key}`;
}

export function mediaKeyFromUrl(url: string): string {
	return url.startsWith(MEDIA_PREFIX) ? url.slice(MEDIA_PREFIX.length) : url;
}

export function safeFilename(name: string): string {
	const base = (name.split(/[\\/]/).pop() ?? 'upload').trim().toLowerCase();
	const cleaned = base
		.replace(/[^a-z0-9._-]+/g, '-')
		.replace(/-+/g, '-')
		.replace(/^[.-]+/, '')
		.replace(/[.-]+$/, '');
	return cleaned || 'upload';
}

export async function hashHex(bytes: ArrayBuffer | Uint8Array): Promise<string> {
	const buffer = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
	const digest = await crypto.subtle.digest('SHA-256', buffer as BufferSource);
	return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

function numberOrUndefined(value: string | undefined): number | undefined {
	if (!value) return undefined;
	const parsed = Number(value);
	return Number.isFinite(parsed) ? parsed : undefined;
}

function assetFromObject(object: R2Object): MediaAsset {
	const key = object.key;
	const filename = key.split('/').pop() ?? key;
	const metadata = (object.customMetadata ?? {}) as Record<string, string>;
	return {
		key,
		url: mediaUrl(key),
		filename,
		size: object.size,
		uploadedAt: metadata.uploadedAt ?? object.uploaded.toISOString(),
		contentType: object.httpMetadata?.contentType ?? 'application/octet-stream',
		width: numberOrUndefined(metadata.width),
		height: numberOrUndefined(metadata.height)
	};
}

export async function listMedia(bucket: R2Bucket): Promise<MediaAsset[]> {
	const assets: MediaAsset[] = [];
	let cursor: string | undefined;
	do {
		const page = await bucket.list({ cursor, include: ['customMetadata', 'httpMetadata'] });
		assets.push(...page.objects.map(assetFromObject));
		cursor = page.truncated ? page.cursor : undefined;
	} while (cursor);

	return assets.sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt));
}

export async function uploadMedia(
	bucket: R2Bucket,
	bytes: ArrayBuffer | Uint8Array,
	contentType: string,
	filename: string,
	width?: number,
	height?: number
): Promise<UploadResult> {
	const hash = await hashHex(bytes);
	const prefix = hash.slice(0, 16);
	const safe = safeFilename(filename);
	const key = `${prefix}/${safe}`;
	const now = new Date().toISOString();

	const existing = await bucket.list({
		prefix: `${prefix}/`,
		include: ['customMetadata', 'httpMetadata']
	});
	if (existing.objects.length > 0) {
		const asset = assetFromObject(existing.objects[0]);
		return { ...asset, deduped: true };
	}

	const head = await bucket.head(key);
	if (head) {
		return { ...assetFromObject(head), deduped: true };
	}

	const customMetadata: Record<string, string> = {
		originalFilename: filename,
		uploadedAt: now
	};
	if (width) customMetadata.width = String(width);
	if (height) customMetadata.height = String(height);

	await bucket.put(key, bytes, {
		httpMetadata: {
			contentType,
			cacheControl: 'public, max-age=31536000, immutable'
		},
		customMetadata
	});

	return {
		key,
		url: mediaUrl(key),
		filename: safe,
		size: bytes instanceof Uint8Array ? bytes.byteLength : bytes.byteLength,
		uploadedAt: now,
		contentType,
		width,
		height,
		deduped: false
	};
}

export async function deleteMedia(bucket: R2Bucket, key: string): Promise<void> {
	await bucket.delete(key);
}

function collectMediaUrls(value: unknown, target: Set<string>): void {
	if (typeof value === 'string') {
		if (value.startsWith(MEDIA_PREFIX)) target.add(mediaKeyFromUrl(value));
		return;
	}
	if (Array.isArray(value)) {
		for (const entry of value) collectMediaUrls(entry, target);
		return;
	}
	if (value && typeof value === 'object') {
		for (const entry of Object.values(value)) collectMediaUrls(entry, target);
	}
}

function parseJson(value: string): unknown {
	try {
		return JSON.parse(value);
	} catch {
		return null;
	}
}

function emptyUsage(): MediaUsage {
	return { total: 0, live: 0, drafts: 0, settings: 0, revisions: 0, references: [] };
}

function addReference(map: Map<string, MediaUsage>, key: string, reference: MediaReference): void {
	const usage = map.get(key) ?? emptyUsage();
	usage.total += 1;
	usage.references.push(reference);
	if (reference.kind === 'live') usage.live += 1;
	else if (reference.kind === 'draft') usage.drafts += 1;
	else if (reference.kind === 'settings') usage.settings += 1;
	else usage.revisions += 1;
	map.set(key, usage);
}

export async function mediaUsage(db: D1Database): Promise<Map<string, MediaUsage>> {
	const usage = new Map<string, MediaUsage>();

	const live = await db
		.prepare(`SELECT collection, id, data FROM content_items`)
		.all<{ collection: CollectionName; id: string; data: string }>();
	for (const row of live.results ?? []) {
		const data = parseJson(row.data);
		const keys = new Set<string>();
		collectMediaUrls(data, keys);
		for (const key of keys) {
			addReference(usage, key, {
				kind: 'live',
				collection: row.collection,
				id: row.id,
				label: itemLabel(row.collection, data as Record<string, unknown>)
			});
		}
	}

	const drafts = await db
		.prepare(`SELECT collection, id, data FROM content_drafts`)
		.all<{ collection: CollectionName; id: string; data: string }>();
	for (const row of drafts.results ?? []) {
		const data = parseJson(row.data);
		const keys = new Set<string>();
		collectMediaUrls(data, keys);
		for (const key of keys) {
			addReference(usage, key, {
				kind: 'draft',
				collection: row.collection,
				id: row.id,
				label: itemLabel(row.collection, data as Record<string, unknown>)
			});
		}
	}

	const settings = await db
		.prepare(`SELECT id, data FROM site_settings`)
		.all<{ id: string; data: string }>();
	for (const row of settings.results ?? []) {
		const keys = new Set<string>();
		collectMediaUrls(parseJson(row.data), keys);
		for (const key of keys) {
			addReference(usage, key, {
				kind: 'settings',
				collection: 'settings',
				id: row.id,
				label: 'Site settings'
			});
		}
	}

	const revisions = await db
		.prepare(`SELECT revision_id, collection, item_id, data FROM content_revisions`)
		.all<{
			revision_id: string;
			collection: CollectionName;
			item_id: string;
			data: string;
		}>();
	for (const row of revisions.results ?? []) {
		const data = parseJson(row.data);
		const keys = new Set<string>();
		collectMediaUrls(data, keys);
		for (const key of keys) {
			addReference(usage, key, {
				kind: 'revision',
				collection: row.collection,
				id: row.item_id,
				label: itemLabel(row.collection, data as Record<string, unknown>),
				revisionId: row.revision_id
			});
		}
	}

	return usage;
}

export function usageFor(usage: Map<string, MediaUsage>, key: string): MediaUsage {
	return usage.get(key) ?? emptyUsage();
}

export function canDeleteMedia(usage: MediaUsage): boolean {
	return usage.live === 0 && usage.drafts === 0 && usage.settings === 0;
}
