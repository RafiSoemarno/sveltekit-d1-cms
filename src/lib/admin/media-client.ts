import type { MediaAsset } from '$lib/types';

const MAX_IMAGE_INPUT = 5 * 1024 * 1024;
const MAX_PDF_INPUT = 20 * 1024 * 1024;
const MAX_DIMENSION = 1600;

export type PreparedUpload = {
	blob: Blob;
	filename: string;
	width?: number;
	height?: number;
	contentType: string;
};

function isPdf(file: File): boolean {
	return file.type === 'application/pdf' || /\.pdf$/i.test(file.name);
}

export async function prepareUpload(file: File): Promise<PreparedUpload> {
	if (isPdf(file)) {
		if (file.size > MAX_PDF_INPUT) throw new Error('PDFs must be 20 MB or smaller.');
		return {
			blob: file,
			filename: file.name.replace(/[^a-zA-Z0-9._-]+/g, '-').toLowerCase(),
			contentType: 'application/pdf'
		};
	}

	if (!/^image\/(png|jpeg|webp)$/.test(file.type)) {
		throw new Error('Upload a PNG, JPEG, or WebP image.');
	}
	if (file.size > MAX_IMAGE_INPUT) throw new Error('Images must be 5 MB or smaller.');

	const bitmap = await createImageBitmap(file);
	const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
	const width = Math.max(1, Math.round(bitmap.width * scale));
	const height = Math.max(1, Math.round(bitmap.height * scale));
	const canvas = document.createElement('canvas');
	canvas.width = width;
	canvas.height = height;
	const context = canvas.getContext('2d');
	if (!context) throw new Error('Could not process the image in this browser.');
	context.drawImage(bitmap, 0, 0, width, height);
	bitmap.close();

	const blob = await new Promise<Blob | null>((resolve) =>
		canvas.toBlob((result) => resolve(result), 'image/webp', 0.82)
	);
	if (!blob) throw new Error('Could not convert the image to WebP.');

	return {
		blob,
		filename: `${file.name.replace(/\.[^.]+$/, '') || 'image'}.webp`,
		width,
		height,
		contentType: 'image/webp'
	};
}

export async function uploadFile(file: File): Promise<MediaAsset> {
	const prepared = await prepareUpload(file);
	const form = new FormData();
	form.set('file', prepared.blob, prepared.filename);
	form.set('filename', prepared.filename);
	form.set('contentType', prepared.contentType);
	if (prepared.width) form.set('width', String(prepared.width));
	if (prepared.height) form.set('height', String(prepared.height));

	const response = await fetch('/api/admin/upload', { method: 'POST', body: form });
	const body = (await response.json().catch(() => ({}))) as {
		asset?: MediaAsset;
		error?: string;
	};
	if (!response.ok || !body.asset) {
		throw new Error(body.error ?? 'Upload failed.');
	}
	return body.asset;
}
