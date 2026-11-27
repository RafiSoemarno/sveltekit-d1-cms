<script lang="ts">
	import { COLLECTIONS } from '$lib/admin/collections';
	import { formatDateTime } from '$lib/admin/format';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const contentCollections = [
		'slides',
		'partners',
		'stats',
		'services',
		'solutions',
		'testimonies',
		'products'
	] as const;
</script>

<svelte:head>
	<title>Admin overview</title>
</svelte:head>

<div class="flex flex-col gap-6">
	<div class="flex flex-wrap items-end justify-between gap-3">
		<div>
			<h1 class="text-2xl font-semibold text-brand-black">Overview</h1>
			<p class="mt-1 text-sm text-gray-500">
				Publishing is live. Drafts stay private until you publish them.
			</p>
		</div>
		<a
			href="/"
			target="_blank"
			rel="noreferrer"
			class="rounded-full bg-brand-orange px-4 py-2 text-sm font-semibold text-white hover:brightness-105"
		>
			View site
		</a>
	</div>

	<div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
		{#each contentCollections as collection (collection)}
			{@const config = COLLECTIONS[collection]}
			{@const count = data.counts[collection]}
			<a
				href={config.path}
				class="rounded-xl border border-gray-200 bg-white p-4 transition hover:border-brand-orange hover:shadow-sm"
			>
				<div class="flex items-center justify-between gap-2">
					<h2 class="text-sm font-semibold text-brand-black">{config.label}</h2>
					<span class="text-xs text-gray-400">{count.live} live · {count.drafts} drafts</span>
				</div>
				<p class="mt-3 text-xs text-gray-500">
					{count.lastUpdated ? `Updated ${formatDateTime(count.lastUpdated)}` : 'No content yet'}
				</p>
			</a>
		{/each}
		<a
			href="/admin/media"
			class="rounded-xl border border-gray-200 bg-white p-4 transition hover:border-brand-orange hover:shadow-sm"
		>
			<div class="flex items-center justify-between gap-2">
				<h2 class="text-sm font-semibold text-brand-black">Media</h2>
				<span class="text-xs text-gray-400">{data.mediaCount} assets</span>
			</div>
			<p class="mt-3 text-xs text-gray-500">Shared image and PDF library</p>
		</a>
		<a
			href="/admin/settings"
			class="rounded-xl border border-gray-200 bg-white p-4 transition hover:border-brand-orange hover:shadow-sm"
		>
			<div class="flex items-center justify-between gap-2">
				<h2 class="text-sm font-semibold text-brand-black">Settings</h2>
			</div>
			<p class="mt-3 text-xs text-gray-500">
				{data.settingsUpdatedAt
					? `Updated ${formatDateTime(data.settingsUpdatedAt)}`
					: 'Contact details and default SEO'}
			</p>
		</a>
	</div>

	<section class="rounded-xl border border-gray-200 bg-white">
		<div class="flex items-center justify-between border-b border-gray-100 px-5 py-4">
			<h2 class="text-base font-semibold text-brand-black">Drafts</h2>
			<span class="text-xs text-gray-400">{data.drafts.length} unpublished</span>
		</div>
		{#if data.drafts.length === 0}
			<p class="px-5 py-6 text-sm text-gray-500">No unpublished drafts. Everything is live.</p>
		{:else}
			<ul class="divide-y divide-gray-100">
				{#each data.drafts as draft (draft.path)}
					<li>
						<a
							href={draft.path}
							class="flex items-center justify-between gap-3 px-5 py-3 transition hover:bg-gray-50"
						>
							<div class="min-w-0">
								<p class="truncate text-sm font-semibold text-brand-black">{draft.label}</p>
								<p class="text-xs text-gray-500">
									{COLLECTIONS[draft.collection].label} · updated {formatDateTime(draft.updatedAt)}
								</p>
							</div>
							<span class="shrink-0 text-xs font-semibold text-brand-orange">Edit</span>
						</a>
					</li>
				{/each}
			</ul>
		{/if}
	</section>
</div>
