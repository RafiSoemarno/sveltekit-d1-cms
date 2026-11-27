import { COLLECTIONS, getPath, isValidSlug, rowCount } from '$lib/admin/collections';
import { BRAND_IDS, CATEGORY_IDS } from '$lib/catalog';
import type { CollectionName, SiteSettings } from '$lib/types';

export type PublishContext = {
	/** Live and draft IDs in the collection, excluding the item being published. */
	otherIds: string[];
	/** IDs that ever existed in the collection, excluding the item being published. */
	reservedIds: string[];
	/** Number of live + draft items in the collection, excluding the item being published. */
	collectionCount: number;
	/** Partner counts by row, excluding the item being published. */
	rowCounts: Record<number, number>;
};

export type ValidationResult = {
	ok: boolean;
	errors: string[];
};

function localizedComplete(value: unknown): boolean {
	if (!value || typeof value !== 'object') return false;
	const record = value as Record<string, unknown>;
	return (
		typeof record.en === 'string' &&
		record.en.trim().length > 0 &&
		typeof record.id === 'string' &&
		record.id.trim().length > 0
	);
}

function localizedEitherEmptyOrComplete(value: unknown): boolean {
	if (value === undefined || value === null) return true;
	if (typeof value !== 'object') return false;
	const record = value as Record<string, unknown>;
	const en = typeof record.en === 'string' ? record.en.trim() : '';
	const id = typeof record.id === 'string' ? record.id.trim() : '';
	return (en === '' && id === '') || (en !== '' && id !== '');
}

function isNonEmptyString(value: unknown): value is string {
	return typeof value === 'string' && value.trim().length > 0;
}

export function isMediaUrl(value: unknown): value is string {
	return typeof value === 'string' && value.startsWith('/media/');
}

export function isPdfUrl(value: unknown): value is string {
	return isMediaUrl(value) && /\.pdf$/i.test(value);
}

export function isLinkedinUrl(value: string): boolean {
	try {
		const url = new URL(value);
		return (
			url.protocol === 'https:' &&
			(url.hostname === 'linkedin.com' || url.hostname.endsWith('.linkedin.com'))
		);
	} catch {
		return false;
	}
}

export function validatePublish(
	collection: CollectionName,
	data: Record<string, unknown>,
	ctx: PublishContext
): ValidationResult {
	const errors: string[] = [];
	const config = COLLECTIONS[collection];

	if (config.cap && ctx.collectionCount >= config.cap) {
		errors.push(`${config.label} is capped at ${config.cap} items.`);
	}

	switch (collection) {
		case 'slides':
			if (!isMediaUrl(data.image)) errors.push('Image is required.');
			if (!localizedComplete(data.title))
				errors.push('Title is required in English and Indonesian.');
			if (!localizedComplete(data.tagline))
				errors.push('Tagline is required in English and Indonesian.');
			if (!localizedComplete(data.description))
				errors.push('Description is required in English and Indonesian.');
			break;
		case 'partners': {
			if (!isNonEmptyString(data.name)) errors.push('Name is required.');
			if (!isMediaUrl(data.logo)) errors.push('Logo is required.');
			const row = Number(data.row);
			if (row !== 1 && row !== 2) errors.push('Row must be 1 or 2.');
			else if ((ctx.rowCounts[row] ?? 0) >= 5)
				errors.push(`Row ${row} already has the maximum of 5 partners.`);
			break;
		}
		case 'stats':
			if (!isNonEmptyString(data.value)) errors.push('Value is required.');
			if (!localizedComplete(data.label))
				errors.push('Label is required in English and Indonesian.');
			if (!isMediaUrl(data.icon)) errors.push('Icon is required.');
			break;
		case 'services':
			if (!localizedComplete(data.name)) errors.push('Name is required in English and Indonesian.');
			if (!localizedComplete(data.description))
				errors.push('Description is required in English and Indonesian.');
			if (!isMediaUrl(data.icon)) errors.push('Icon is required.');
			break;
		case 'solutions':
			if (!localizedComplete(data.title))
				errors.push('Title is required in English and Indonesian.');
			if (!localizedComplete(data.description))
				errors.push('Description is required in English and Indonesian.');
			if (!isMediaUrl(data.image)) errors.push('Image is required.');
			if (!isMediaUrl(data.icon)) errors.push('Icon is required.');
			break;
		case 'testimonies':
			if (!localizedComplete(data.paragraph))
				errors.push('Paragraph is required in English and Indonesian.');
			if (!isNonEmptyString(data.name)) errors.push('Name is required.');
			if (!isNonEmptyString(data.company)) errors.push('Company is required.');
			if (!localizedComplete(data.location))
				errors.push('Location is required in English and Indonesian.');
			if (isNonEmptyString(data.linkedinUrl) && !isLinkedinUrl(data.linkedinUrl))
				errors.push('LinkedIn URL must be an HTTPS linkedin.com URL.');
			if (isNonEmptyString(data.profileImage) && !isMediaUrl(data.profileImage))
				errors.push('Profile photo must be uploaded through the media library.');
			break;
		case 'products':
			errors.push(...validateProduct(data, ctx));
			break;
	}

	return { ok: errors.length === 0, errors };
}

function validateProduct(data: Record<string, unknown>, ctx: PublishContext): string[] {
	const errors: string[] = [];
	if (!isNonEmptyString(data.name)) errors.push('Name is required.');
	if (!BRAND_IDS.includes(String(data.brand ?? ''))) errors.push('Brand is invalid.');
	if (!CATEGORY_IDS.includes(String(data.category ?? ''))) errors.push('Category is invalid.');
	if (!isMediaUrl(data.image)) errors.push('Primary image is required.');
	if (!localizedComplete(data.shortDescription))
		errors.push('Short description is required in English and Indonesian.');
	if (!localizedComplete(data.longDescription))
		errors.push('Long description is required in English and Indonesian.');

	const gallery = Array.isArray(data.gallery) ? data.gallery : [];
	if (gallery.length > 7) errors.push('The gallery can contain at most 7 additional images.');
	if (1 + gallery.length > 8) errors.push('A product can have at most 8 images in total.');
	for (const image of gallery) {
		if (!isMediaUrl(image)) {
			errors.push('Every gallery image must come from the media library.');
			break;
		}
	}

	const features = Array.isArray(data.features) ? data.features : [];
	for (const feature of features) {
		if (!localizedComplete(feature)) {
			errors.push('Every feature must be complete in English and Indonesian.');
			break;
		}
	}

	const brochures = Array.isArray(data.brochures) ? data.brochures : [];
	for (const brochure of brochures) {
		if (!brochure || typeof brochure !== 'object') {
			errors.push('Brochures must be valid PDF entries.');
			break;
		}
		const url = (brochure as Record<string, unknown>).url;
		if (!isPdfUrl(url)) {
			errors.push('Brochures must be PDFs uploaded through the media library.');
			break;
		}
	}

	const slug = typeof data.slug === 'string' ? data.slug : '';
	if (!isValidSlug(slug)) errors.push('Slug must use lowercase letters, numbers, and hyphens.');
	else if (ctx.otherIds.includes(slug))
		errors.push('That slug is already used by another product.');
	else if (ctx.reservedIds.includes(slug)) errors.push('That slug belongs to a deleted product.');

	const seo = data.seo as Record<string, unknown> | undefined;
	if (seo) {
		if (!localizedEitherEmptyOrComplete(seo.title))
			errors.push('SEO title must be complete in both languages or empty.');
		if (!localizedEitherEmptyOrComplete(seo.description))
			errors.push('SEO description must be complete in both languages or empty.');
	}

	return errors;
}

export function validateSettings(value: unknown): ValidationResult {
	const errors: string[] = [];
	if (!value || typeof value !== 'object') {
		return { ok: false, errors: ['Settings are invalid.'] };
	}
	const data = value as Partial<SiteSettings>;
	const contact = data.contact;
	if (!contact || typeof contact !== 'object') {
		errors.push('Contact details are required.');
	} else {
		if (!isNonEmptyString(contact.phone)) errors.push('Phone is required.');
		if (!isNonEmptyString(contact.whatsapp) || !/^\d{6,20}$/.test(contact.whatsapp))
			errors.push('WhatsApp must be international digits only.');
		if (!isNonEmptyString(contact.email) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email))
			errors.push('Email is invalid.');
		if (!isNonEmptyString(contact.address)) errors.push('Address is required.');
	}

	const seo = data.seo;
	if (!seo || typeof seo !== 'object') {
		errors.push('Default SEO is required.');
	} else {
		if (!localizedComplete(seo.title)) errors.push('Default SEO title must be bilingual.');
		if (!localizedComplete(seo.description))
			errors.push('Default SEO description must be bilingual.');
		if (seo.image && !isMediaUrl(seo.image))
			errors.push('Default social image must come from the media library.');
	}

	return { ok: errors.length === 0, errors };
}

export function partnerRowCounts(
	items: { data: Record<string, unknown>; id: string }[],
	excludeId?: string
) {
	const counts: Record<number, number> = { 1: 0, 2: 0 };
	for (const item of items) {
		if (item.id === excludeId) continue;
		const row = rowCount(item.data);
		counts[row] = (counts[row] ?? 0) + 1;
	}
	return counts;
}

export function collectionLabel(collection: CollectionName): string {
	return COLLECTIONS[collection].label;
}

export function itemName(data: Record<string, unknown>): string {
	for (const key of ['name', 'title.en', 'label.en', 'value']) {
		const value = getPath(data, key);
		if (typeof value === 'string' && value.trim()) return value;
	}
	return 'Untitled';
}
