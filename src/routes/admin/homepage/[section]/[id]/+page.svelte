<script lang="ts">
	import { itemLabel } from '$lib/admin/collections';
	import { setAdminForm } from '$lib/admin/form-context.svelte';
	import MappingForm from '$lib/admin/components/MappingForm.svelte';
	import PublishBar from '$lib/admin/components/PublishBar.svelte';
	import HistoryList from '$lib/admin/components/HistoryList.svelte';
	import FormSection from '$lib/admin/components/FormSection.svelte';
	import StatusBadge from '$lib/admin/components/StatusBadge.svelte';
	import Toast from '$lib/admin/components/Toast.svelte';
	import UnsavedChangesGuard from '$lib/admin/components/UnsavedChangesGuard.svelte';
	import type { PageData } from './$types';

	let { data, form }: { data: PageData; form: { success?: boolean; errors?: string[] } | null } =
		$props();

	// svelte-ignore state_referenced_locally
	let item = $state<Record<string, unknown>>(structuredClone(data.item.data));
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
	<title>{data.config.singular} | Admin</title>
</svelte:head>

<div class="flex flex-col gap-5">
	<div class="flex flex-wrap items-center justify-between gap-3">
		<div>
			<a href={data.config.path} class="text-xs font-semibold text-brand-blue hover:underline"
				>← Back to {data.config.label}</a
			>
			<h1 class="mt-1 text-2xl font-semibold text-brand-black">
				{data.config.singular}: {itemLabel(data.section, item)}
			</h1>
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
		<FormSection title="Details">
			<MappingForm fields={data.config.fields} media={data.media} />
		</FormSection>

		<PublishBar
			{statusLabel}
			updatedAt={data.item.updatedAt}
			bind:note
			published={data.item.live}
			hasDraft={data.item.draft}
			isNew={false}
			previewPath="/"
		/>
	</form>

	<FormSection title="History" description="The last 50 revisions for this item." open={false}>
		<HistoryList revisions={data.revisions} />
	</FormSection>

	<UnsavedChangesGuard {dirty} />
	{#if form?.success}
		<Toast message="Draft saved." />
	{/if}
	<!-- Keep the id visible for debugging long drafts. -->
	<p class="text-[11px] text-gray-400">ID: {data.item.id}</p>
</div>
