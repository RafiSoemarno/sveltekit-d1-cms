export const PREVIEW_COOKIE = 'cms_preview';
export const PREVIEW_TTL_SECONDS = 2 * 60 * 60;

function toBase64Url(bytes: ArrayBuffer): string {
	return btoa(String.fromCharCode(...new Uint8Array(bytes)))
		.replace(/\+/g, '-')
		.replace(/\//g, '_')
		.replace(/=+$/, '');
}

function fromBase64Url(value: string): Uint8Array {
	const padded = value
		.replace(/-/g, '+')
		.replace(/_/g, '/')
		.padEnd(Math.ceil(value.length / 4) * 4, '=');
	const binary = atob(padded);
	return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

async function keyFor(secret: string): Promise<CryptoKey> {
	return crypto.subtle.importKey(
		'raw',
		new TextEncoder().encode(secret),
		{ name: 'HMAC', hash: 'SHA-256' },
		false,
		['sign', 'verify']
	);
}

export async function createPreviewValue(
	secret: string,
	ttlSeconds = PREVIEW_TTL_SECONDS
): Promise<string> {
	const expires = Math.floor(Date.now() / 1000) + ttlSeconds;
	const payload = String(expires);
	const signature = await crypto.subtle.sign(
		'HMAC',
		await keyFor(secret),
		new TextEncoder().encode(payload)
	);
	return `${payload}.${toBase64Url(signature)}`;
}

export async function verifyPreviewValue(
	value: string | undefined,
	secret: string | undefined
): Promise<boolean> {
	if (!value || !secret) return false;
	const [payload, signature] = value.split('.');
	if (!payload || !signature) return false;
	const expires = Number(payload);
	if (!Number.isFinite(expires) || expires < Math.floor(Date.now() / 1000)) return false;
	try {
		return await crypto.subtle.verify(
			'HMAC',
			await keyFor(secret),
			fromBase64Url(signature) as BufferSource,
			new TextEncoder().encode(payload)
		);
	} catch {
		return false;
	}
}

export function previewCookie(value: string, secure: boolean): string {
	const parts = [
		`${PREVIEW_COOKIE}=${value}`,
		'Path=/',
		'HttpOnly',
		'SameSite=Lax',
		`Max-Age=${PREVIEW_TTL_SECONDS}`
	];
	if (secure) parts.push('Secure');
	return parts.join('; ');
}

export function clearPreviewCookie(secure: boolean): string {
	const parts = [`${PREVIEW_COOKIE}=`, 'Path=/', 'HttpOnly', 'SameSite=Lax', 'Max-Age=0'];
	if (secure) parts.push('Secure');
	return parts.join('; ');
}
