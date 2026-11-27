<script lang="ts">
	import FormSection from './FormSection.svelte';
	import GalleryEditor from './GalleryEditor.svelte';
	import FeaturesEditor from './FeaturesEditor.svelte';
	import BrochuresEditor from './BrochuresEditor.svelte';
	import SeoFields from './SeoFields.svelte';
	import { BRANDS, CATEGORIES } from '$lib/catalog';
	import type { MediaAsset } from '$lib/types';
	import { getAdminForm } from '$lib/admin/form-context.svelte';

	let { media, everPublished }: { media: MediaAsset[]; everPublished: boolean } = $props();

	const item = getAdminForm();
</script>

<FormSection title="Basics">
	<div class="grid gap-4 sm:grid-cols-2">
		<label class="flex flex-col gap-1 text-sm font-medium text-brand-black sm:col-span-2">
			Name <span class="text-red-500">*</span>
			<input
				bind:value={item.name}
				class="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand-orange"
			/>
		</label>
		<label class="flex flex-col gap-1 text-sm font-medium text-brand-black">
			Brand
			<select
				bind:value={item.brand}
				class="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand-orange"
			>
				{#each BRANDS as brand (brand.id)}
					<option value={brand.id}>{brand.label.en}</option>
				{/each}
			</select>
		</label>
		<label class="flex flex-col gap-1 text-sm font-medium text-brand-black">
			Category
			<select
				bind:value={item.category}
				class="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand-orange"
			>
				{#each CATEGORIES as category (category.id)}
					<option value={category.id}>{category.label.en}</option>
				{/each}
			</select>
		</label>
		<label class="flex flex-col gap-1 text-sm font-medium text-brand-black sm:col-span-2">
			Slug
			<input
				bind:value={item.slug}
				disabled={everPublished}
				placeholder="Generated from the name if left empty"
				class="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand-orange disabled:bg-gray-100 disabled:text-gray-500"
			/>
			<span class="text-xs text-gray-500">
				{everPublished
					? 'The slug is permanent after the first publish.'
					: 'Lowercase letters, numbers, and hyphens. Editable until the first publish.'}
			</span>
		</label>
	</div>
</FormSection>

<FormSection title="Descriptions">
	<div class="grid gap-5 sm:grid-cols-2">
		<div class="flex flex-col gap-3 sm:col-span-2">
			<span class="text-sm font-medium text-brand-black">Short description</span>
			<div class="grid gap-3 sm:grid-cols-2">
				<label class="flex flex-col gap-1 text-xs font-medium text-gray-600">
					English
					<textarea
						bind:value={item.shortDescription.en}
						rows="3"
						class="rounded-lg border border-gray-300 px-3 py-2 text-sm text-brand-black outline-none focus:border-brand-orange"
					></textarea>
				</label>
				<label class="flex flex-col gap-1 text-xs font-medium text-gray-600">
					Indonesian
					<textarea
						bind:value={item.shortDescription.id}
						rows="3"
						class="rounded-lg border border-gray-300 px-3 py-2 text-sm text-brand-black outline-none focus:border-brand-orange"
					></textarea>
				</label>
			</div>
		</div>
		<div class="flex flex-col gap-3 sm:col-span-2">
			<span class="text-sm font-medium text-brand-black">Long description</span>
			<div class="grid gap-3 sm:grid-cols-2">
				<label class="flex flex-col gap-1 text-xs font-medium text-gray-600">
					English
					<textarea
						bind:value={item.longDescription.en}
						rows="7"
						class="rounded-lg border border-gray-300 px-3 py-2 text-sm text-brand-black outline-none focus:border-brand-orange"
					></textarea>
				</label>
				<label class="flex flex-col gap-1 text-xs font-medium text-gray-600">
					Indonesian
					<textarea
						bind:value={item.longDescription.id}
						rows="7"
						class="rounded-lg border border-gray-300 px-3 py-2 text-sm text-brand-black outline-none focus:border-brand-orange"
					></textarea>
				</label>
			</div>
		</div>
	</div>
</FormSection>

<FormSection title="Features">
	<FeaturesEditor />
</FormSection>

<FormSection title="Media" description="Primary image plus optional gallery.">
	<GalleryEditor {media} />
</FormSection>

<FormSection title="Brochures" open={false}>
	<BrochuresEditor {media} />
</FormSection>

<FormSection title="SEO" open={false}>
	<SeoFields />
	<p class="mt-3 text-xs text-gray-500">
		Leave empty to fall back to the product name and short description.
	</p>
</FormSection>
