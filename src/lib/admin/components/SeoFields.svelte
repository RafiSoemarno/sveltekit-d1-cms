<script lang="ts">
	import { getAdminForm } from '$lib/admin/form-context.svelte';

	const form = getAdminForm();
	const title = $derived(form.seo.title);
	const description = $derived(form.seo.description);
</script>

<div class="flex flex-col gap-4">
	<div class="grid gap-4 sm:grid-cols-2">
		<label class="flex flex-col gap-1 text-xs font-medium text-gray-600">
			<span>Meta title (EN)</span>
			<input
				bind:value={title.en}
				maxlength="80"
				class="rounded-lg border border-gray-300 px-3 py-2 text-sm text-brand-black outline-none focus:border-brand-orange"
			/>
			<span class="text-[11px] {title.en.length > 60 ? 'text-amber-600' : 'text-gray-400'}"
				>{title.en.length} / 60 recommended</span
			>
		</label>
		<label class="flex flex-col gap-1 text-xs font-medium text-gray-600">
			<span>Meta title (ID)</span>
			<input
				bind:value={title.id}
				maxlength="80"
				class="rounded-lg border border-gray-300 px-3 py-2 text-sm text-brand-black outline-none focus:border-brand-orange"
			/>
			<span class="text-[11px] {title.id.length > 60 ? 'text-amber-600' : 'text-gray-400'}"
				>{title.id.length} / 60 recommended</span
			>
		</label>
	</div>
	<div class="grid gap-4 sm:grid-cols-2">
		<label class="flex flex-col gap-1 text-xs font-medium text-gray-600">
			<span>Meta description (EN)</span>
			<textarea
				bind:value={description.en}
				rows="3"
				maxlength="220"
				class="rounded-lg border border-gray-300 px-3 py-2 text-sm text-brand-black outline-none focus:border-brand-orange"
			></textarea>
			<span class="text-[11px] {description.en.length > 160 ? 'text-amber-600' : 'text-gray-400'}"
				>{description.en.length} / 160 recommended</span
			>
		</label>
		<label class="flex flex-col gap-1 text-xs font-medium text-gray-600">
			<span>Meta description (ID)</span>
			<textarea
				bind:value={description.id}
				rows="3"
				maxlength="220"
				class="rounded-lg border border-gray-300 px-3 py-2 text-sm text-brand-black outline-none focus:border-brand-orange"
			></textarea>
			<span class="text-[11px] {description.id.length > 160 ? 'text-amber-600' : 'text-gray-400'}"
				>{description.id.length} / 160 recommended</span
			>
		</label>
	</div>
</div>
