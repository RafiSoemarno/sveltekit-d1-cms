export const ADS_TAG_ID = 'AW-XXXXXXXXXX';

export const ADS_CONVERSION_SEND_TO = 'AW-XXXXXXXXXX/XXXXXXXXXX';

// Kill switch: the Google Ads tag stays inert until real AW- IDs replace the
// placeholders above. Flipping the IDs to production values is the only step
// needed to go live.
export const ADS_ENABLED = !ADS_TAG_ID.includes('XXXX');

export const PRODUCT_NOT_FOUND = 'PRODUCT_NOT_FOUND';

export function waUrl(number: string, text?: string) {
	const base = `https://wa.me/${number}`;
	return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}
