<script lang="ts">
	/* eslint-disable @typescript-eslint/no-explicit-any */
	import FormSection from '$lib/admin/components/FormSection.svelte';
	import PublishBar from '$lib/admin/components/PublishBar.svelte';
	import HistoryList from '$lib/admin/components/HistoryList.svelte';
	import StatusBadge from '$lib/admin/components/StatusBadge.svelte';
	import Toast from '$lib/admin/components/Toast.svelte';
	import UnsavedChangesGuard from '$lib/admin/components/UnsavedChangesGuard.svelte';
	import ProductFields from '$lib/admin/components/ProductFields.svelte';
	import { setAdminForm } from '$lib/admin/form-context.svelte';
	import type { PageData } from './$types';

	let { data, form }: { data: PageData; form: { success?: boolean; errors?: string[] } | null } =
		$props();

	// svelte-ignore state_referenced_locally
	let item = $state<Record<string, any>>(structuredClone(data.item.data));
	setAdminForm(item);
	// svelte-ignore state_referenced_locally
	let initial = $state(JSON.stringify(data.item.data));
	let note = $state('');

	const dirty = $derived(JSON.stringify(item) !== initial);
	const errors = $derived(form?.errors ?? []);
	const statusLabel = $derived(
		data.item.live && data.item.draft
			? 'Published + draft changes'
			: data.item.live
				? 'Published'
				: 'Draft'
	);
</script>

<svelte:head>
	<title>{item.name || 'Product'} | Admin</title>
</svelte:head>

<div class="flex flex-col gap-5">
	<div class="flex flex-wrap items-center justify-between gap-3">
		<div>
			<a href="/admin/products" class="text-xs font-semibold text-brand-blue hover:underline"
				>← Back to Products</a
			>
			<h1 class="mt-1 text-2xl font-semibold text-brand-black">
				{item.name || 'Untitled product'}
			</h1>
			<p class="mt-1 text-xs text-gray-500">ID: {data.item.id}</p>
		</div>
		<StatusBadge status={data.item.status} />
	</div>

	{#if errors.length > 0}
		<div class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
			<p class="font-semibold">Could not save or publish</p>
			<ul class="mt-1 list-disc pl-5">
				{#each errors as error (error)}
					<li>{error}</li>
				{/each}
			</ul>
		</div>
	{/if}

	<form method="POST" class="flex flex-col gap-4">
		<input type="hidden" name="data" value={JSON.stringify(item)} />

		<ProductFields media={data.media} everPublished={data.item.everPublished} />

		<PublishBar
			{statusLabel}
			updatedAt={data.item.updatedAt}
			bind:note
			published={data.item.live}
			hasDraft={data.item.draft}
			isNew={false}
			previewPath={`/products/${data.item.id}`}
		/>
	</form>

	<FormSection title="History" description="The last 50 revisions for this product." open={false}>
		<HistoryList revisions={data.revisions} />
	</FormSection>

	<UnsavedChangesGuard {dirty} />
	{#if form?.success}
		<Toast message="Draft saved." />
	{/if}
</div>
