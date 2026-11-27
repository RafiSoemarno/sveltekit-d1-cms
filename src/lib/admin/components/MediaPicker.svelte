<script lang="ts">
	import { formatBytes } from '$lib/admin/format';
	import type { MediaAsset } from '$lib/types';

	let {
		open = $bindable(false),
		media,
		accept = 'all',
		onselect
	}: {
		open: boolean;
		media: MediaAsset[];
		accept?: 'image' | 'pdf' | 'all';
		onselect: (asset: MediaAsset) => void;
	} = $props();

	let dialogEl = $state<HTMLDialogElement>();

	$effect(() => {
		const dialog = dialogEl;
		if (!dialog) return;
		if (open && !dialog.open) dialog.showModal();
		if (!open && dialog.open) dialog.close();
	});

	const filtered = $derived(
		media.filter((asset) => {
			if (accept === 'image') return asset.contentType.startsWith('image/');
			if (accept === 'pdf') {
				return asset.contentType === 'application/pdf' || /\.pdf$/i.test(asset.filename);
			}
			return true;
		})
	);

	function choose(asset: MediaAsset) {
		onselect(asset);
		open = false;
	}
</script>

<dialog
	bind:this={dialogEl}
	class="m-auto max-h-[85vh] w-[calc(100%-2rem)] max-w-4xl rounded-2xl bg-white p-0 shadow-2xl backdrop:bg-black/50"
	onclose={() => (open = false)}
>
	<div class="flex max-h-[85vh] flex-col">
		<header class="flex items-center justify-between border-b border-gray-200 px-5 py-4">
			<h2 class="text-lg font-semibold text-brand-black">Media library</h2>
			<button
				type="button"
				onclick={() => (open = false)}
				class="rounded-full border border-gray-300 px-3 py-1.5 text-sm font-semibold text-gray-600 hover:bg-gray-50"
			>
				Close
			</button>
		</header>
		<div class="min-h-0 flex-1 overflow-y-auto p-5">
			{#if filtered.length === 0}
				<p class="py-10 text-center text-sm text-gray-500">
					No matching assets yet. Upload one from the field instead.
				</p>
			{:else}
				<div class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
					{#each filtered as asset (asset.key)}
						<button
							type="button"
							onclick={() => choose(asset)}
							class="flex flex-col overflow-hidden rounded-xl border border-gray-200 text-left transition hover:border-brand-orange hover:shadow-sm"
						>
							<div class="flex h-32 items-center justify-center bg-[#eef5fa] p-2">
								{#if asset.contentType.startsWith('image/')}
									<img
										src={asset.url}
										alt=""
										class="max-h-full max-w-full object-contain"
										loading="lazy"
									/>
								{:else}
									<span class="text-3xl" aria-hidden="true">PDF</span>
								{/if}
							</div>
							<div class="border-t border-gray-100 p-2">
								<p class="truncate text-xs font-medium text-brand-black" title={asset.filename}>
									{asset.filename}
								</p>
								<p class="text-[11px] text-gray-400">
									{formatBytes(asset.size)}
									{asset.width ? `· ${asset.width}×${asset.height}` : ''}
								</p>
							</div>
						</button>
					{/each}
				</div>
			{/if}
		</div>
	</div>
</dialog>
