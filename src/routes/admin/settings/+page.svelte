<script lang="ts">
	import FormSection from '$lib/admin/components/FormSection.svelte';
	import SeoFields from '$lib/admin/components/SeoFields.svelte';
	import MediaField from '$lib/admin/components/MediaField.svelte';
	import Toast from '$lib/admin/components/Toast.svelte';
	import UnsavedChangesGuard from '$lib/admin/components/UnsavedChangesGuard.svelte';
	import { setAdminForm } from '$lib/admin/form-context.svelte';
	import type { PageData } from './$types';

	let { data, form }: { data: PageData; form: { success?: boolean; errors?: string[] } | null } =
		$props();

	// svelte-ignore state_referenced_locally
	let settings = $state(structuredClone(data.settings));
	setAdminForm(settings);
	// svelte-ignore state_referenced_locally
	const initial = JSON.stringify(data.settings);
	const dirty = $derived(JSON.stringify(settings) !== initial);
	const errors = $derived(form?.errors ?? []);
</script>

<svelte:head>
	<title>Settings | Admin</title>
</svelte:head>

<div class="flex flex-col gap-5">
	<div>
		<h1 class="text-2xl font-semibold text-brand-black">Settings</h1>
		<p class="mt-1 text-sm text-gray-500">
			Contact details and default SEO. Changes apply immediately.
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

	<form method="POST" action="?/save" class="flex flex-col gap-4">
		<input type="hidden" name="data" value={JSON.stringify(settings)} />

		<FormSection title="Contact">
			<div class="grid gap-4 sm:grid-cols-2">
				<label class="flex flex-col gap-1 text-sm font-medium text-brand-black">
					Phone (display value) <span class="text-red-500">*</span>
					<input
						bind:value={settings.contact.phone}
						class="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand-orange"
					/>
				</label>
				<label class="flex flex-col gap-1 text-sm font-medium text-brand-black">
					WhatsApp (international digits) <span class="text-red-500">*</span>
					<input
						bind:value={settings.contact.whatsapp}
						inputmode="numeric"
						class="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand-orange"
					/>
				</label>
				<label class="flex flex-col gap-1 text-sm font-medium text-brand-black">
					Email <span class="text-red-500">*</span>
					<input
						bind:value={settings.contact.email}
						type="email"
						class="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand-orange"
					/>
				</label>
				<label class="flex flex-col gap-1 text-sm font-medium text-brand-black sm:col-span-2">
					Address <span class="text-red-500">*</span>
					<input
						bind:value={settings.contact.address}
						class="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand-orange"
					/>
				</label>
			</div>
		</FormSection>

		<FormSection title="Default SEO">
			<SeoFields />
			<div class="mt-5">
				<MediaField
					label="Social image"
					value={settings.seo.image}
					onchange={(next) => (settings.seo.image = next)}
					media={data.media}
					accept="image"
					help="Used when a page has no image of its own. Falls back to /story-image.png."
				/>
			</div>
		</FormSection>

		<div
			class="sticky bottom-0 z-20 flex flex-col gap-2 border-t border-gray-200 bg-white/95 py-4 backdrop-blur sm:flex-row sm:items-center sm:justify-between"
		>
			<span class="text-xs text-gray-500">
				Settings are public values. Google Ads IDs stay in code.
			</span>
			<div class="flex items-center gap-2">
				<a
					href="/admin"
					class="rounded-full border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50"
				>
					Cancel
				</a>
				<button
					type="submit"
					class="rounded-full bg-brand-orange px-5 py-2 text-sm font-semibold text-white hover:brightness-105 disabled:opacity-50"
				>
					Save settings
				</button>
			</div>
		</div>
	</form>

	<UnsavedChangesGuard {dirty} />
	{#if form?.success}
		<Toast message="Settings saved." />
	{/if}
</div>
