<script lang="ts">
	import MediaField from './MediaField.svelte';
	import type { FieldDef } from '$lib/admin/collections';
	import type { MediaAsset } from '$lib/types';
	import { getAdminForm } from '$lib/admin/form-context.svelte';

	let { fields, media }: { fields: FieldDef[]; media: MediaAsset[] } = $props();

	const form = getAdminForm();
</script>

<div class="grid gap-5 sm:grid-cols-2">
	{#each fields as field (field.key)}
		{@const full =
			field.type === 'localizedText' ||
			field.type === 'localizedTextarea' ||
			field.type === 'image'}
		<div class="flex flex-col gap-1 {full ? 'sm:col-span-2' : ''}">
			{#if field.type === 'image'}
				<MediaField
					label={field.label}
					value={form[field.key]}
					onchange={(next) => (form[field.key] = next)}
					{media}
					accept="image"
					required={field.required}
					help={field.help}
				/>
			{:else}
				<label class="text-sm font-medium text-brand-black" for={`field-${field.key}`}>
					{field.label}{#if field.required}<span class="text-red-500"> *</span>{/if}
				</label>

				{#if field.type === 'localizedText'}
					<div class="grid gap-3 sm:grid-cols-2">
						<label class="flex flex-col gap-1 text-xs font-medium text-gray-600">
							English
							<input
								id={`field-${field.key}-en`}
								bind:value={form[field.key].en}
								maxlength={field.maxLength}
								placeholder={field.placeholder}
								class="rounded-lg border border-gray-300 px-3 py-2 text-sm text-brand-black outline-none focus:border-brand-orange"
							/>
						</label>
						<label class="flex flex-col gap-1 text-xs font-medium text-gray-600">
							Indonesian
							<input
								id={`field-${field.key}-id`}
								bind:value={form[field.key].id}
								maxlength={field.maxLength}
								placeholder={field.placeholder}
								class="rounded-lg border border-gray-300 px-3 py-2 text-sm text-brand-black outline-none focus:border-brand-orange"
							/>
						</label>
					</div>
				{:else if field.type === 'localizedTextarea'}
					<div class="grid gap-3 sm:grid-cols-2">
						<label class="flex flex-col gap-1 text-xs font-medium text-gray-600">
							English
							<textarea
								id={`field-${field.key}-en`}
								bind:value={form[field.key].en}
								rows="4"
								maxlength={field.maxLength}
								class="rounded-lg border border-gray-300 px-3 py-2 text-sm text-brand-black outline-none focus:border-brand-orange"
							></textarea>
						</label>
						<label class="flex flex-col gap-1 text-xs font-medium text-gray-600">
							Indonesian
							<textarea
								id={`field-${field.key}-id`}
								bind:value={form[field.key].id}
								rows="4"
								maxlength={field.maxLength}
								class="rounded-lg border border-gray-300 px-3 py-2 text-sm text-brand-black outline-none focus:border-brand-orange"
							></textarea>
						</label>
					</div>
				{:else if field.type === 'select'}
					<select
						id={`field-${field.key}`}
						bind:value={form[field.key]}
						class="rounded-lg border border-gray-300 px-3 py-2 text-sm text-brand-black outline-none focus:border-brand-orange"
					>
						{#each field.options ?? [] as option (option.value)}
							<option value={option.value}>{option.label}</option>
						{/each}
					</select>
				{:else if field.type === 'textarea'}
					<textarea
						id={`field-${field.key}`}
						bind:value={form[field.key]}
						rows="4"
						maxlength={field.maxLength}
						class="rounded-lg border border-gray-300 px-3 py-2 text-sm text-brand-black outline-none focus:border-brand-orange"
					></textarea>
				{:else}
					<input
						id={`field-${field.key}`}
						type={field.type === 'url' ? 'url' : 'text'}
						bind:value={form[field.key]}
						maxlength={field.maxLength}
						placeholder={field.placeholder}
						class="rounded-lg border border-gray-300 px-3 py-2 text-sm text-brand-black outline-none focus:border-brand-orange"
					/>
				{/if}
				{#if field.help}
					<p class="text-xs text-gray-500">{field.help}</p>
				{/if}
			{/if}
		</div>
	{/each}
</div>
