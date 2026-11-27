<script lang="ts">
	import MediaField from './MediaField.svelte';
	import type { MediaAsset } from '$lib/types';
	import { getAdminForm } from '$lib/admin/form-context.svelte';

	let { media }: { media: MediaAsset[] } = $props();

	const form = getAdminForm();
	const brochures = $derived(form.brochures as { url: string; label?: string }[]);

	function add() {
		form.brochures = [...brochures, { url: '', label: '' }];
	}

	function remove(index: number) {
		form.brochures = brochures.filter((_, i) => i !== index);
	}
</script>

<div class="flex flex-col gap-4">
	{#each brochures as brochure, index (index)}
		<div class="grid gap-3 rounded-xl border border-gray-200 p-3 sm:grid-cols-[2fr_1fr_auto]">
			<MediaField
				label="PDF"
				value={brochure.url}
				onchange={(next) => (brochure.url = next)}
				{media}
				accept="pdf"
				help="Brochures must be PDFs uploaded through the media library."
			/>
			<label class="flex flex-col gap-1 text-xs font-medium text-gray-600">
				Label (optional)
				<input
					bind:value={brochure.label}
					class="rounded-lg border border-gray-300 px-3 py-2 text-sm text-brand-black outline-none focus:border-brand-orange"
					placeholder="e.g. Product datasheet"
				/>
			</label>
			<button
				type="button"
				onclick={() => remove(index)}
				class="self-end rounded-full border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"
			>
				Remove
			</button>
		</div>
	{/each}
	<button
		type="button"
		onclick={add}
		class="self-start rounded-full border border-brand-blue px-4 py-2 text-sm font-semibold text-brand-blue hover:bg-brand-blue hover:text-white"
	>
		Add brochure
	</button>
</div>
