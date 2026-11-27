<script lang="ts">
	import { itemLabel, itemThumbnail } from '$lib/admin/collections';
	import { formatDateTime } from '$lib/admin/format';
	import EmptyState from '$lib/admin/components/EmptyState.svelte';
	import StatusBadge from '$lib/admin/components/StatusBadge.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const visibleItems = $derived(
		data.filter === 'drafts' ? data.items.filter((item) => item.status !== 'published') : data.items
	);

	const addPath = $derived(`${data.config.path}/new`);
</script>

<svelte:head>
	<title>{data.config.label} | Admin</title>
</svelte:head>

<div class="flex flex-col gap-5">
	<div class="flex flex-wrap items-center justify-between gap-3">
		<div>
			<h1 class="text-2xl font-semibold text-brand-black">{data.config.label}</h1>
			<p class="mt-1 text-sm text-gray-500">
				Manage the homepage {data.config.label.toLowerCase()} collection.
			</p>
		</div>
		{#if data.capReached}
			<span class="rounded-full bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-500">
				Limit reached ({data.config.cap})
			</span>
		{:else}
			<a
				href={addPath}
				class="rounded-full bg-brand-orange px-4 py-2 text-sm font-semibold text-white hover:brightness-105"
			>
				Add {data.config.singular.toLowerCase()}
			</a>
		{/if}
	</div>

	<div class="flex flex-wrap gap-2">
		<a
			href={data.config.path}
			class="rounded-full px-4 py-2 text-sm font-semibold {data.filter === 'all'
				? 'bg-brand-black text-white'
				: 'border border-gray-300 text-gray-600 hover:bg-gray-50'}"
		>
			All
		</a>
		<a
			href={`${data.config.path}?filter=drafts`}
			class="rounded-full px-4 py-2 text-sm font-semibold {data.filter === 'drafts'
				? 'bg-brand-black text-white'
				: 'border border-gray-300 text-gray-600 hover:bg-gray-50'}"
		>
			Drafts
		</a>
		<a
			href={`${data.config.path}?filter=deleted`}
			class="rounded-full px-4 py-2 text-sm font-semibold {data.filter === 'deleted'
				? 'bg-brand-black text-white'
				: 'border border-gray-300 text-gray-600 hover:bg-gray-50'}"
		>
			Deleted
		</a>
	</div>

	{#if data.filter === 'deleted'}
		{#if data.deleted.length === 0}
			<EmptyState
				title="Nothing deleted"
				body="Deleted items keep a snapshot here so you can restore them as a draft."
			/>
		{:else}
			<div class="overflow-hidden rounded-xl border border-gray-200 bg-white">
				<ul class="divide-y divide-gray-100">
					{#each data.deleted as item (item.revisionId)}
						<li class="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
							<div class="min-w-0">
								<p class="truncate text-sm font-semibold text-brand-black">
									{itemLabel(data.section, item.data)}
								</p>
								<p class="text-xs text-gray-500">
									Deleted {formatDateTime(item.deletedAt)}{item.note ? ` — ${item.note}` : ''}
								</p>
							</div>
							<form method="POST" action="?/restore">
								<input type="hidden" name="id" value={item.id} />
								<button
									type="submit"
									class="rounded-full border border-brand-blue px-4 py-2 text-xs font-semibold text-brand-blue hover:bg-brand-blue hover:text-white"
								>
									Restore as draft
								</button>
							</form>
						</li>
					{/each}
				</ul>
			</div>
		{/if}
	{:else if visibleItems.length === 0}
		<EmptyState
			title={data.filter === 'drafts' ? 'No drafts' : `No ${data.config.label.toLowerCase()} yet`}
			body={data.filter === 'drafts'
				? 'Items you save as drafts will appear here until they are published.'
				: `Add the first ${data.config.singular.toLowerCase()} to show it on the homepage.`}
			actionHref={data.filter === 'drafts' ? undefined : addPath}
			actionLabel={data.filter === 'drafts'
				? undefined
				: `Add the first ${data.config.singular.toLowerCase()}`}
		/>
	{:else if data.config.listType === 'table'}
		<div class="overflow-x-auto rounded-xl border border-gray-200 bg-white">
			<table class="min-w-full text-left text-sm">
				<thead
					class="border-b border-gray-200 bg-gray-50 text-xs tracking-wide text-gray-500 uppercase"
				>
					<tr>
						<th class="px-4 py-3 font-semibold">Name</th>
						<th class="px-4 py-3 font-semibold">Company</th>
						<th class="px-4 py-3 font-semibold">Status</th>
						<th class="px-4 py-3 font-semibold">Updated</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-gray-100">
					{#each visibleItems as item (item.id)}
						<tr class="hover:bg-gray-50">
							<td class="px-4 py-3">
								<a
									href={`${data.config.path}/${encodeURIComponent(item.id)}`}
									class="font-semibold text-brand-black hover:text-brand-orange"
								>
									{itemLabel(data.section, item.data)}
								</a>
							</td>
							<td class="px-4 py-3 text-gray-600">
								{typeof item.data.company === 'string' ? item.data.company : '—'}
							</td>
							<td class="px-4 py-3"><StatusBadge status={item.status} /></td>
							<td class="px-4 py-3 text-gray-500">{formatDateTime(item.updatedAt)}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{:else}
		<div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
			{#each visibleItems as item (item.id)}
				{@const thumbnail = itemThumbnail(data.section, item.data)}
				<a
					href={`${data.config.path}/${encodeURIComponent(item.id)}`}
					class="flex gap-3 rounded-xl border border-gray-200 bg-white p-3 transition hover:border-brand-orange hover:shadow-sm"
				>
					<div
						class="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#eef5fa] p-2"
					>
						{#if thumbnail}
							<img src={thumbnail} alt="" class="max-h-full max-w-full object-contain" />
						{:else}
							<span class="text-xs text-gray-400">No image</span>
						{/if}
					</div>
					<div class="flex min-w-0 flex-1 flex-col gap-1">
						<p class="truncate text-sm font-semibold text-brand-black">
							{itemLabel(data.section, item.data)}
						</p>
						{#if data.section === 'stats' && typeof item.data.value === 'string'}
							<p class="text-xs text-gray-500">Value: {item.data.value}</p>
						{/if}
						<StatusBadge status={item.status} />
						<p class="text-[11px] text-gray-400">{formatDateTime(item.updatedAt)}</p>
					</div>
				</a>
			{/each}
		</div>
	{/if}
</div>
