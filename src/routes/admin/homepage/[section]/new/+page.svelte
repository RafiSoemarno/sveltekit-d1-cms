<script lang="ts">
	import MappingForm from '$lib/admin/components/MappingForm.svelte';
	import { setAdminForm } from '$lib/admin/form-context.svelte';
	import PublishBar from '$lib/admin/components/PublishBar.svelte';
	import FormSection from '$lib/admin/components/FormSection.svelte';
	import Toast from '$lib/admin/components/Toast.svelte';
	import UnsavedChangesGuard from '$lib/admin/components/UnsavedChangesGuard.svelte';
	import type { PageData } from './$types';

	let { data, form }: { data: PageData; form: { errors?: string[] } | null } = $props();

	// svelte-ignore state_referenced_locally
	let item = $state<Record<string, unknown>>(structuredClone(data.data));
	setAdminForm(item);
	// svelte-ignore state_referenced_locally
	const initial = JSON.stringify(data.data);
	let note = $state('');

	const dirty = $derived(JSON.stringify(item) !== initial);
	const errors = $derived(form?.errors ?? []);
</script>

<svelte:head>
	<title>New {data.config.singular.toLowerCase()} | Admin</title>
</svelte:head>

<div class="flex flex-col gap-5">
	<div>
		<a href={data.config.path} class="text-xs font-semibold text-brand-blue hover:underline"
			>← Back to {data.config.label}</a
		>
		<h1 class="mt-1 text-2xl font-semibold text-brand-black">
			New {data.config.singular.toLowerCase()}
		</h1>
		<p class="mt-1 text-sm text-gray-500">
			Save a draft first. You can preview and publish it from the editor.
		</p>
	</div>

	{#if errors.length > 0}
		<div class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
			<ul class="list-disc pl-5">
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
			statusLabel="New draft"
			updatedAt={null}
			bind:note
			published={false}
			hasDraft={false}
			isNew
			previewPath="/"
		/>
	</form>

	<UnsavedChangesGuard {dirty} />
	{#if form && !form.errors}
		<Toast message="Draft saved." />
	{/if}
</div>
