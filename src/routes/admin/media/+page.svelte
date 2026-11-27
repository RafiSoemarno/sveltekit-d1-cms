<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { page } from '$app/state';
	import { formatBytes, formatDateTime } from '$lib/admin/format';
	import UploadDropzone from '$lib/admin/components/UploadDropzone.svelte';
	import EmptyState from '$lib/admin/components/EmptyState.svelte';
	import type { PageData } from './$types';

	let {
		data,
		form
	}: { data: PageData; form: { errors?: string[]; references?: unknown[] } | null } = $props();

	let copied = $state(false);

	const filterQuery = $derived(
		`type=${encodeURIComponent(data.type)}${data.q ? `&q=${encodeURIComponent(data.q)}` : ''}`
	);

	function assetHref(key: string) {
		return `/admin/media?type=${encodeURIComponent(data.type)}&asset=${encodeURIComponent(key)}${
			data.q ? `&q=${encodeURIComponent(data.q)}` : ''
		}`;
	}

	function usageHref(reference: { kind: string; collection: string; id: string }) {
		if (reference.collection === 'products')
			return `/admin/products/${encodeURIComponent(reference.id)}`;
		if (reference.collection === 'settings') return '/admin/settings';
		return `/admin/homepage/${reference.collection}/${encodeURIComponent(reference.id)}`;
	}

	async function copyUrl(url: string) {
		await navigator.clipboard.writeText(new URL(url, page.url.origin).href);
		copied = true;
		setTimeout(() => (copied = false), 1500);
	}
</script>

<svelte:head>
	<title>Media | Admin</title>
</svelte:head>

<div class="flex flex-col gap-5">
	<div class="flex flex-wrap items-center justify-between gap-3">
		<div>
			<h1 class="text-2xl font-semibold text-brand-black">Media</h1>
			<p class="mt-1 text-sm text-gray-500">
				Shared R2 library. {data.total} assets. Delete is blocked while an asset is in use.
			</p>
		</div>
	</div>

	<UploadDropzone onuploaded={() => invalidateAll()} />

	<div class="flex flex-wrap items-center gap-2">
		<a
			href="/admin/media"
			class="rounded-full px-4 py-2 text-sm font-semibold {data.type === 'all'
				? 'bg-brand-black text-white'
				: 'border border-gray-300 text-gray-600 hover:bg-gray-50'}"
		>
			All
		</a>
		<a
			href="/admin/media?type=image"
			class="rounded-full px-4 py-2 text-sm font-semibold {data.type === 'image'
				? 'bg-brand-black text-white'
				: 'border border-gray-300 text-gray-600 hover:bg-gray-50'}"
		>
			Images
		</a>
		<a
			href="/admin/media?type=pdf"
			class="rounded-full px-4 py-2 text-sm font-semibold {data.type === 'pdf'
				? 'bg-brand-black text-white'
				: 'border border-gray-300 text-gray-600 hover:bg-gray-50'}"
		>
			PDFs
		</a>
		<form method="GET" class="ml-auto flex items-center gap-2">
			<input type="hidden" name="type" value={data.type} />
			<input
				type="search"
				name="q"
				value={data.q}
				placeholder="Search filenames…"
				class="w-56 rounded-full border border-gray-300 px-4 py-2 text-sm outline-none focus:border-brand-orange"
			/>
			<button
				type="submit"
				class="rounded-full border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50"
			>
				Search
			</button>
		</form>
	</div>

	{#if data.assets.length === 0}
		<EmptyState
			title={data.q ? 'No matching assets' : 'No media yet'}
			body={data.q
				? 'Try a different filename or clear the filter.'
				: 'Upload an image or PDF to start the shared library.'}
		/>
	{:else}
		<div class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
			{#each data.assets as asset (asset.key)}
				<a
					href={assetHref(asset.key)}
					class="flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white transition hover:border-brand-orange hover:shadow-sm"
				>
					<div class="flex h-36 items-center justify-center bg-[#eef5fa] p-3">
						{#if asset.contentType.startsWith('image/')}
							<img
								src={asset.url}
								alt=""
								class="max-h-full max-w-full object-contain"
								loading="lazy"
							/>
						{:else}
							<span class="text-3xl font-bold text-red-500">PDF</span>
						{/if}
					</div>
					<div class="border-t border-gray-100 p-2">
						<p class="truncate text-xs font-semibold text-brand-black" title={asset.filename}>
							{asset.filename}
						</p>
						<p class="text-[11px] text-gray-400">
							{formatBytes(asset.size)}
							{asset.width ? ` · ${asset.width}×${asset.height}` : ''}
						</p>
						<p
							class="mt-1 text-[11px] font-medium {asset.usage.total > 0
								? 'text-amber-600'
								: 'text-green-600'}"
						>
							{asset.usage.total > 0 ? `Used ${asset.usage.total}×` : 'Unused'}
						</p>
					</div>
				</a>
			{/each}
		</div>
	{/if}
</div>

{#if data.selected}
	<div class="fixed inset-0 z-40 flex justify-end bg-black/30" role="presentation">
		<a href={`/admin/media?${filterQuery}`} class="flex-1" aria-label="Close details"></a>
		<aside class="flex h-full w-full max-w-md flex-col overflow-y-auto bg-white shadow-2xl">
			<header class="flex items-center justify-between border-b border-gray-200 px-5 py-4">
				<h2 class="text-lg font-semibold text-brand-black">Asset details</h2>
				<a
					href={`/admin/media?${filterQuery}`}
					class="rounded-full border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50"
				>
					Close
				</a>
			</header>
			<div class="flex flex-col gap-5 p-5">
				<div class="flex h-48 items-center justify-center rounded-xl bg-[#eef5fa] p-4">
					{#if data.selected.contentType.startsWith('image/')}
						<img src={data.selected.url} alt="" class="max-h-full max-w-full object-contain" />
					{:else}
						<span class="text-4xl font-bold text-red-500">PDF</span>
					{/if}
				</div>
				<div>
					<p class="text-sm font-semibold break-all text-brand-black">{data.selected.filename}</p>
					<p class="mt-1 text-xs text-gray-500">
						{formatBytes(data.selected.size)}
						{data.selected.width ? ` · ${data.selected.width}×${data.selected.height}` : ''}
						· uploaded {formatDateTime(data.selected.uploadedAt)}
					</p>
				</div>
				<div class="flex flex-wrap gap-2">
					<button
						type="button"
						onclick={() => copyUrl(data.selected!.url)}
						class="rounded-full border border-gray-300 px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50"
					>
						{copied ? 'Copied' : 'Copy URL'}
					</button>
					<a
						href={data.selected.url}
						target="_blank"
						rel="noreferrer"
						class="rounded-full border border-gray-300 px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50"
					>
						Open
					</a>
				</div>

				<div>
					<h3 class="text-sm font-semibold text-brand-black">
						Used by {data.selected.usage.total}
					</h3>
					{#if data.selected.usage.references.length === 0}
						<p class="mt-1 text-xs text-gray-500">
							No live, draft, settings, or revision references.
						</p>
					{:else}
						<ul class="mt-2 flex flex-col gap-1 text-xs">
							{#each data.selected.usage.references as reference (reference.kind + reference.id + (reference.revisionId ?? ''))}
								<li class="flex items-center justify-between gap-2 rounded-lg bg-gray-50 px-3 py-2">
									<span class="min-w-0 truncate text-gray-600">
										{reference.label}
										<span class="text-gray-400">({reference.kind})</span>
									</span>
									{#if reference.kind !== 'revision'}
										<a
											href={usageHref(reference)}
											class="shrink-0 font-semibold text-brand-blue hover:underline"
										>
											Open
										</a>
									{/if}
								</li>
							{/each}
						</ul>
					{/if}
				</div>

				{#if form?.errors}
					<div class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
						{#each form.errors as error (error)}
							<p>{error}</p>
						{/each}
					</div>
				{/if}

				<form method="POST" action="?/delete" class="border-t border-gray-200 pt-4">
					<input type="hidden" name="key" value={data.selected.key} />
					{#if !data.selected.canDelete}
						<p class="text-xs font-medium text-red-600">
							Delete is blocked while live content, a draft, or the settings use this asset.
						</p>
					{:else if data.selected.usage.revisions > 0}
						<label class="flex items-start gap-2 text-xs text-amber-700">
							<input type="checkbox" name="confirm" value="1" class="mt-0.5" />
							<span>
								This asset is referenced by {data.selected.usage.revisions} revision{data.selected
									.usage.revisions === 1
									? ''
									: 's'}. Deleting it will break those history snapshots. Delete anyway?
							</span>
						</label>
						<button
							type="submit"
							onclick={(event) => {
								if (!window.confirm('Delete this asset permanently?')) event.preventDefault();
							}}
							class="mt-3 rounded-full border border-red-300 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"
						>
							Delete asset
						</button>
					{:else}
						<button
							type="submit"
							onclick={(event) => {
								if (!window.confirm('Delete this asset permanently?')) event.preventDefault();
							}}
							class="rounded-full border border-red-300 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"
						>
							Delete asset
						</button>
					{/if}
				</form>
			</div>
		</aside>
	</div>
{/if}
