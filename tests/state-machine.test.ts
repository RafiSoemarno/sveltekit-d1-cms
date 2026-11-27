import { beforeEach, describe, expect, it } from 'vitest';
import { env } from 'cloudflare:test';
import {
	deleteItem,
	generateId,
	getAdminItem,
	getRevisions,
	listDeleted,
	publishItem,
	restoreDeleted,
	saveDraft,
	saveSettings,
	unpublishItem
} from '$lib/server/admin-content';
import { getSiteSettings, listContent, listProducts } from '$lib/server/content';
import { DEFAULT_SETTINGS } from '$lib/settings';

const db = () => env.DB;

async function reset() {
	await db().batch([
		db().prepare('DELETE FROM content_items'),
		db().prepare('DELETE FROM content_drafts'),
		db().prepare('DELETE FROM content_revisions'),
		db().prepare('DELETE FROM site_settings')
	]);
}

const media = (name: string) => `/media/0123456789abcdef/${name}`;

function slide(title: string) {
	return {
		image: media('slide.png'),
		title: { en: title, id: title },
		tagline: { en: 'Tagline', id: 'Tagline' },
		description: { en: 'Description', id: 'Description' }
	};
}

function stat(value: string) {
	return {
		value,
		label: { en: 'Label', id: 'Label' },
		icon: media('icon.png')
	};
}

function partner(name: string, row: 1 | 2) {
	return { name, logo: media('logo.png'), row };
}

function product(name: string, category: string) {
	return {
		name,
		brand: 'acme',
		category,
		image: media('product.png'),
		gallery: [],
		shortDescription: { en: 'Short', id: 'Short' },
		longDescription: { en: 'Long', id: 'Long' },
		features: [{ en: 'Feature', id: 'Feature' }],
		brochures: [],
		seo: { title: { en: '', id: '' }, description: { en: '', id: '' } }
	};
}

async function seedPublished(
	collection: 'slides' | 'stats' | 'partners' | 'products' | 'testimonies',
	id: string,
	data: Record<string, unknown>
) {
	await saveDraft(db(), { collection, id, data });
	const result = await publishItem(db(), collection, id);
	expect(result.ok).toBe(true);
}

beforeEach(reset);

describe('draft and publish state machine', () => {
	it('creates a draft, publishes it, and records history', async () => {
		await saveDraft(db(), {
			collection: 'slides',
			id: 'example-slide',
			data: slide('Example Slide')
		});
		let item = await getAdminItem(db(), 'slides', 'example-slide');
		expect(item?.status).toBe('draft');
		expect(item?.live).toBe(false);

		const result = await publishItem(db(), 'slides', 'example-slide');
		expect(result.ok).toBe(true);

		item = await getAdminItem(db(), 'slides', 'example-slide');
		expect(item?.status).toBe('published');
		expect(item?.live).toBe(true);
		expect(item?.draft).toBe(false);

		const revisions = await getRevisions(db(), 'slides', 'example-slide');
		expect(revisions.map((revision) => revision.action)).toEqual(['publish', 'save']);
	});

	it('keeps published content live while a draft overlay exists', async () => {
		await seedPublished('slides', 'example-slide', slide('Live title'));
		await saveDraft(db(), {
			collection: 'slides',
			id: 'example-slide',
			data: slide('Draft title')
		});

		const published = await listContent(db(), 'slides', false);
		const preview = await listContent(db(), 'slides', true);
		expect(published[0].data.title).toEqual({ en: 'Live title', id: 'Live title' });
		expect(preview[0].data.title).toEqual({ en: 'Draft title', id: 'Draft title' });

		const item = await getAdminItem(db(), 'slides', 'example-slide');
		expect(item?.status).toBe('published-draft');
	});

	it('unpublishes without overwriting a newer draft', async () => {
		await seedPublished('slides', 'example-slide', slide('Live title'));
		await saveDraft(db(), {
			collection: 'slides',
			id: 'example-slide',
			data: slide('Newer draft')
		});

		const result = await unpublishItem(db(), 'slides', 'example-slide');
		expect(result.ok).toBe(true);

		const item = await getAdminItem(db(), 'slides', 'example-slide');
		expect(item?.status).toBe('draft');
		expect(item?.data.title).toEqual({ en: 'Newer draft', id: 'Newer draft' });
	});

	it('deletes both snapshots and restores the latest as a draft', async () => {
		await seedPublished('slides', 'example-slide', slide('Live title'));
		await saveDraft(db(), {
			collection: 'slides',
			id: 'example-slide',
			data: slide('Draft title')
		});

		const result = await deleteItem(db(), 'slides', 'example-slide');
		expect(result.ok).toBe(true);
		expect(await getAdminItem(db(), 'slides', 'example-slide')).toBeUndefined();

		const deleted = await listDeleted(db(), 'slides');
		expect(deleted).toHaveLength(1);
		expect(deleted[0].data.title).toEqual({ en: 'Draft title', id: 'Draft title' });

		const restored = await restoreDeleted(db(), 'slides', 'example-slide');
		expect(restored.ok).toBe(true);
		const item = await getAdminItem(db(), 'slides', 'example-slide');
		expect(item?.status).toBe('draft');
		expect(item?.data.title).toEqual({ en: 'Draft title', id: 'Draft title' });
	});

	it('prunes revision history to the last 50 snapshots', async () => {
		for (let index = 0; index < 55; index += 1) {
			await saveDraft(db(), {
				collection: 'slides',
				id: 'example-slide',
				data: slide(`Title ${index}`)
			});
		}
		const revisions = await getRevisions(db(), 'slides', 'example-slide', 100);
		expect(revisions).toHaveLength(50);
		expect(revisions[0].data.title).toEqual({ en: 'Title 54', id: 'Title 54' });
	});
});

describe('ordering', () => {
	it('orders products by category rank and then name', async () => {
		await seedPublished('products', 'z-printer', product('Z Printer', 'hardware'));
		await seedPublished('products', 'a-software', product('A Software', 'software'));
		await seedPublished('products', 'a-printer', product('A Printer', 'hardware'));

		const products = await listProducts(db());
		expect(products.map((entry) => entry.slug)).toEqual(['a-printer', 'z-printer', 'a-software']);
	});

	it('orders partners by row and name', async () => {
		await seedPublished('partners', 'z-row1', partner('Zeta', 1));
		await seedPublished('partners', 'a-row2', partner('Alpha', 2));
		await seedPublished('partners', 'a-row1', partner('Alpha', 1));

		const partners = await listContent(db(), 'partners');
		expect(partners.map((entry) => entry.id)).toEqual(['a-row1', 'z-row1', 'a-row2']);
	});
});

describe('validation and caps', () => {
	it('requires a primary image and bilingual fields for slides', async () => {
		await saveDraft(db(), {
			collection: 'slides',
			id: 'incomplete',
			data: { ...slide(''), image: '', title: { en: '', id: '' } }
		});
		const result = await publishItem(db(), 'slides', 'incomplete');
		expect(result.ok).toBe(false);
		expect(result.errors.join(' ')).toMatch(/Image|Title/);
	});

	it('enforces the stats cap', async () => {
		await seedPublished('stats', 'one', stat('1'));
		await seedPublished('stats', 'two', stat('2'));
		await seedPublished('stats', 'three', stat('3'));
		await saveDraft(db(), { collection: 'stats', id: 'four', data: stat('4') });

		const result = await publishItem(db(), 'stats', 'four');
		expect(result.ok).toBe(false);
		expect(result.errors.join(' ')).toMatch(/capped at 3/);
	});

	it('rejects restoring a deleted stat that would exceed the cap', async () => {
		await seedPublished('stats', 'one', stat('1'));
		await deleteItem(db(), 'stats', 'one');
		await seedPublished('stats', 'two', stat('2'));
		await seedPublished('stats', 'three', stat('3'));
		await seedPublished('stats', 'four', stat('4'));

		const result = await restoreDeleted(db(), 'stats', 'one');
		expect(result.ok).toBe(false);
		expect(result.errors.join(' ')).toMatch(/capped at 3/);
	});

	it('enforces five partners per row', async () => {
		for (let index = 1; index <= 5; index += 1) {
			await seedPublished('partners', `p${index}`, partner(`Partner ${index}`, 1));
		}
		await saveDraft(db(), { collection: 'partners', id: 'p6', data: partner('Partner 6', 1) });
		const result = await publishItem(db(), 'partners', 'p6');
		expect(result.ok).toBe(false);
		expect(result.errors.join(' ')).toMatch(/maximum of 5/);
	});

	it('rejects an invalid product slug', async () => {
		await saveDraft(db(), {
			collection: 'products',
			id: 'Bad Slug',
			data: product('Bad', 'software')
		});
		const result = await publishItem(db(), 'products', 'Bad Slug');
		expect(result.ok).toBe(false);
		expect(result.errors.join(' ')).toMatch(/Slug/);
	});

	it('rewrites an unpublished product slug and its revisions', async () => {
		await saveDraft(db(), {
			collection: 'products',
			id: 'old-slug',
			data: { ...product('Product', 'software'), slug: 'old-slug' }
		});
		const saved = await saveDraft(db(), {
			collection: 'products',
			id: 'new-slug',
			previousId: 'old-slug',
			data: { ...product('Product', 'software'), slug: 'new-slug' }
		});
		expect(saved.id).toBe('new-slug');
		expect(await getAdminItem(db(), 'products', 'old-slug')).toBeUndefined();
		const item = await getAdminItem(db(), 'products', 'new-slug');
		expect(item?.status).toBe('draft');
		const revisions = await getRevisions(db(), 'products', 'new-slug');
		expect(revisions).toHaveLength(2);

		const result = await publishItem(db(), 'products', 'new-slug');
		expect(result.ok).toBe(true);
		expect((await getAdminItem(db(), 'products', 'new-slug'))?.status).toBe('published');
	});

	it('rejects changing a published product slug', async () => {
		await seedPublished('products', 'old-slug', {
			...product('Product', 'software'),
			slug: 'old-slug'
		});
		await expect(
			saveDraft(db(), {
				collection: 'products',
				id: 'new-slug',
				previousId: 'old-slug',
				data: { ...product('Product', 'software'), slug: 'new-slug' }
			})
		).rejects.toThrow(/slug cannot change/);
	});
});

describe('ids and settings', () => {
	it('generates readable unique ids', async () => {
		await saveDraft(db(), {
			collection: 'slides',
			id: 'example-slide',
			data: slide('Example Slide')
		});
		expect(await generateId(db(), 'slides', 'Example Slide')).toBe('example-slide-2');
	});

	it('saves and reads site settings', async () => {
		const settings = {
			...DEFAULT_SETTINGS,
			contact: {
				...DEFAULT_SETTINGS.contact,
				phone: '021 000000',
				whatsapp: '620000000000',
				email: 'hello@example.com',
				address: '1 Example Street'
			},
			seo: {
				title: { en: 'Example Site', id: 'Situs Contoh' },
				description: { en: 'Example description.', id: 'Deskripsi contoh.' },
				image: ''
			}
		};
		const result = await saveSettings(db(), settings);
		expect(result.ok).toBe(true);
		const stored = await getSiteSettings(db());
		expect(stored.contact.phone).toBe('021 000000');
	});

	it('rejects invalid settings', async () => {
		const result = await saveSettings(db(), {
			...DEFAULT_SETTINGS,
			contact: {
				phone: '021 000000',
				whatsapp: '620000000000',
				email: 'not-an-email',
				address: '1 Example Street'
			},
			seo: {
				title: { en: 'Example Site', id: 'Situs Contoh' },
				description: { en: 'Example description.', id: 'Deskripsi contoh.' },
				image: ''
			}
		});
		expect(result.ok).toBe(false);
	});
});
