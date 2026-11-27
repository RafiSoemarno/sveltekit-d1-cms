<script lang="ts">
	import { getAdminForm } from '$lib/admin/form-context.svelte';

	const form = getAdminForm();
	const features = $derived(form.features as { en: string; id: string }[]);

	function add() {
		form.features = [...features, { en: '', id: '' }];
	}

	function remove(index: number) {
		form.features = features.filter((_, i) => i !== index);
	}
</script>

<div class="flex flex-col gap-3">
	{#each features as feature, index (index)}
		<div class="grid gap-3 rounded-xl border border-gray-200 p-3 sm:grid-cols-[1fr_1fr_auto]">
			<label class="flex flex-col gap-1 text-xs font-medium text-gray-600">
				English
				<input
					bind:value={feature.en}
					class="rounded-lg border border-gray-300 px-3 py-2 text-sm text-brand-black outline-none focus:border-brand-orange"
					placeholder="Feature in English"
				/>
			</label>
			<label class="flex flex-col gap-1 text-xs font-medium text-gray-600">
				Indonesian
				<input
					bind:value={feature.id}
					class="rounded-lg border border-gray-300 px-3 py-2 text-sm text-brand-black outline-none focus:border-brand-orange"
					placeholder="Fitur dalam Bahasa Indonesia"
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
		Add feature
	</button>
</div>
