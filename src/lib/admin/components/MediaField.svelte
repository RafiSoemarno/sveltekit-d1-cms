<script lang="ts">
	import MediaPicker from './MediaPicker.svelte';
	import { uploadFile } from '$lib/admin/media-client';
	import { formatBytes } from '$lib/admin/format';
	import type { MediaAsset } from '$lib/types';

	let {
		label,
		value,
		onchange,
		media,
		accept = 'image',
		required = false,
		help
	}: {
		label: string;
		value: string;
		onchange: (value: string) => void;
		media: MediaAsset[];
		accept?: 'image' | 'pdf';
		required?: boolean;
		help?: string;
	} = $props();

	let pickerOpen = $state(false);
	let uploading = $state(false);
	let error = $state('');
	let fileInput = $state<HTMLInputElement>();
	let uploads = $state<MediaAsset[]>([]);

	const assets = $derived([...uploads, ...media]);
	const selected = $derived(assets.find((asset) => asset.url === value));
	const isPdf = $derived(
		value.toLowerCase().endsWith('.pdf') || selected?.contentType === 'application/pdf'
	);

	function handlePicked(asset: MediaAsset) {
		onchange(asset.url);
	}

	async function handleFile(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;
		error = '';
		uploading = true;
		try {
			const asset = await uploadFile(file);
			uploads = [asset, ...uploads.filter((entry) => entry.key !== asset.key)];
			onchange(asset.url);
		} catch (uploadError) {
			error = uploadError instanceof Error ? uploadError.message : 'Upload failed.';
		} finally {
			uploading = false;
			input.value = '';
		}
	}
</script>

<div class="flex flex-col gap-2">
	<div class="flex items-center justify-between gap-2">
		<span class="text-sm font-medium text-brand-black">
			{label}{#if required}<span class="text-red-500"> *</span>{/if}
		</span>
		{#if value}
			<button
				type="button"
				onclick={() => onchange('')}
				class="text-xs font-semibold text-red-600 hover:underline"
			>
				Clear
			</button>
		{/if}
	</div>

	{#if value}
		<div class="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 p-3">
			<div
				class="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white"
			>
				{#if isPdf}
					<span class="text-xs font-bold text-red-600">PDF</span>
				{:else}
					<img src={value} alt="" class="h-full w-full object-contain p-1" />
				{/if}
			</div>
			<div class="min-w-0 flex-1">
				<p class="truncate text-sm font-medium text-brand-black">
					{selected?.filename ?? value.split('/').pop()}
				</p>
				{#if selected}
					<p class="text-xs text-gray-500">
						{formatBytes(selected.size)}
						{selected.width ? `· ${selected.width}×${selected.height}` : ''}
					</p>
				{/if}
			</div>
		</div>
	{/if}

	<div class="flex flex-wrap items-center gap-2">
		<button
			type="button"
			onclick={() => (pickerOpen = true)}
			class="rounded-full border border-brand-blue px-4 py-2 text-sm font-semibold text-brand-blue transition hover:bg-brand-blue hover:text-white"
		>
			Choose from library
		</button>
		<button
			type="button"
			onclick={() => fileInput?.click()}
			disabled={uploading}
			class="rounded-full bg-brand-black px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
		>
			{uploading ? 'Uploading…' : 'Upload new'}
		</button>
		<input
			bind:this={fileInput}
			type="file"
			accept={accept === 'pdf' ? 'application/pdf' : 'image/png,image/jpeg,image/webp'}
			class="hidden"
			onchange={handleFile}
		/>
	</div>

	{#if help}
		<p class="text-xs text-gray-500">{help}</p>
	{/if}
	{#if error}
		<p class="text-xs font-medium text-red-600">{error}</p>
	{/if}
</div>

<MediaPicker bind:open={pickerOpen} media={assets} {accept} onselect={handlePicked} />
