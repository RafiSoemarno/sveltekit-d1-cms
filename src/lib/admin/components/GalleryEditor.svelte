<script lang="ts">
	import MediaField from './MediaField.svelte';
	import MediaPicker from './MediaPicker.svelte';
	import type { MediaAsset } from '$lib/types';
	import { getAdminForm } from '$lib/admin/form-context.svelte';

	let { media }: { media: MediaAsset[] } = $props();

	const form = getAdminForm();
	const primary = $derived(form.image as string);
	const gallery = $derived((form.gallery ?? []) as string[]);

	let pickerOpen = $state(false);

	const total = $derived((form.image ? 1 : 0) + gallery.length);
	const atLimit = $derived(total >= 8);

	function addImage(asset: MediaAsset) {
		if (atLimit) return;
		if (asset.url === primary || gallery.includes(asset.url)) return;
		form.gallery = [...gallery, asset.url];
	}

	function removeGallery(index: number) {
		form.gallery = gallery.filter((_, i) => i !== index);
	}

	function setPrimary(index: number) {
		const chosen = gallery[index];
		if (!chosen) return;
		const previous = form.image;
		form.gallery = previous
			? gallery.map((image, i) => (i === index ? previous : image))
			: gallery.filter((_, i) => i !== index);
		form.image = chosen;
	}

	function removePrimary() {
		if (gallery.length === 0) return;
		form.image = gallery[0];
		form.gallery = gallery.slice(1);
	}
</script>

<div class="flex flex-col gap-5">
	<MediaField
		label="Primary image"
		value={form.image}
		onchange={(next) => (form.image = next)}
		{media}
		accept="image"
		required
		help="Used on product cards and as the social preview image."
	/>

	<div class="flex flex-col gap-2">
		<div class="flex items-center justify-between">
			<span class="text-sm font-medium text-brand-black">Gallery</span>
			<span class="text-xs text-gray-500">{total} / 8 images</span>
		</div>
		<div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
			{#if form.image}
				<div class="relative overflow-hidden rounded-xl border border-brand-orange bg-[#eef5fa]">
					<img src={form.image} alt="" class="h-28 w-full object-contain p-2" />
					<span
						class="absolute top-1 left-1 rounded-full bg-brand-orange px-2 py-0.5 text-[10px] font-bold text-white"
						>PRIMARY</span
					>
					<button
						type="button"
						onclick={removePrimary}
						disabled={gallery.length === 0}
						class="absolute right-1 bottom-1 rounded-full bg-white/90 px-2 py-1 text-[10px] font-semibold text-red-600 shadow disabled:opacity-40"
					>
						Remove
					</button>
				</div>
			{/if}
			{#each gallery as image, index (image)}
				<div class="relative overflow-hidden rounded-xl border border-gray-200 bg-[#eef5fa]">
					<img src={image} alt="" class="h-28 w-full object-contain p-2" />
					<div class="absolute inset-x-1 bottom-1 flex justify-between gap-1">
						<button
							type="button"
							onclick={() => setPrimary(index)}
							class="rounded-full bg-white/90 px-2 py-1 text-[10px] font-semibold text-brand-blue shadow"
						>
							Set primary
						</button>
						<button
							type="button"
							onclick={() => removeGallery(index)}
							class="rounded-full bg-white/90 px-2 py-1 text-[10px] font-semibold text-red-600 shadow"
						>
							Remove
						</button>
					</div>
				</div>
			{/each}
			<button
				type="button"
				onclick={() => (pickerOpen = true)}
				disabled={atLimit}
				class="flex h-28 flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-gray-300 text-sm font-semibold text-gray-500 transition hover:border-brand-orange hover:text-brand-orange disabled:cursor-not-allowed disabled:opacity-40"
			>
				<span class="text-xl">+</span>
				Add image
			</button>
		</div>
		<p class="text-xs text-gray-500">
			Gallery order is upload order. Up to 7 additional images; 8 total.
		</p>
	</div>
</div>

<MediaPicker bind:open={pickerOpen} {media} accept="image" onselect={addImage} />
