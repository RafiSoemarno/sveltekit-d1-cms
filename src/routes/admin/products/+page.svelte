<script lang="ts">
	import { formatDateTime } from '$lib/admin/format';
	import EmptyState from '$lib/admin/components/EmptyState.svelte';
	import StatusBadge from '$lib/admin/components/StatusBadge.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Products | Admin</title>
</svelte:head>

<div class="flex flex-col gap-5">
	<div class="flex flex-wrap items-center justify-between gap-3">
		<div>
			<h1 class="text-2xl font-semibold text-brand-black">Products</h1>
			<p class="mt-1 text-sm text-gray-500">Manage the product catalog and product pages.</p>
		</div>
		<a
			href="/admin/products/new"
			class="rounded-full bg-brand-orange px-4 py-2 text-sm font-semibold text-white hover:brightness-105"
		>
			Add product
		</a>
	</div>

	<div class="flex flex-wrap items-center gap-2">
		<a
			href="/admin/products"
			class="rounded-full px-4 py-2 text-sm font-semibold {data.filter === 'all'
				? 'bg-brand-black text-white'
				: 'border border-gray-300 text-gray-600 hover:bg-gray-50'}"
		>
			All
		</a>
		<a
			href="/admin/products?filter=drafts"
			class="rounded-full px-4 py-2 text-sm font-semibold {data.filter === 'drafts'
				? 'bg-brand-black text-white'
				: 'border border-gray-300 text-gray-600 hover:bg-gray-50'}"
		>
			Drafts
		</a>
		<a
			href="/admin/products?filter=deleted"
			class="rounded-full px-4 py-2 text-sm font-semibold {data.filter === 'deleted'
				? 'bg-brand-black text-white'
				: 'border border-gray-300 text-gray-600 hover:bg-gray-50'}"
		>
			Deleted
		</a>
		<form method="GET" class="ml-auto flex items-center gap-2">
			{#if data.filter !== 'all'}<input type="hidden" name="filter" value={data.filter} />{/if}
			<input
				type="search"
				name="q"
				value={data.q}
				placeholder="Search products…"
				class="w-56 rounded-full border border-gray-300 px-4 py-2 text-sm outline-none focus:border-brand-orange"
			/>
			<button
				type="submit"
				class="rounded-full border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50"
			>
				Search
			</button>
		</form>
	</div>

	{#if data.filter === 'deleted'}
		{#if data.deleted.length === 0}
			<EmptyState
				title="Nothing deleted"
				body="Deleted products keep a snapshot here so you can restore them as a draft."
			/>
		{:else}
			<div class="overflow-hidden rounded-xl border border-gray-200 bg-white">
				<ul class="divide-y divide-gray-100">
					{#each data.deleted as item (item.revisionId)}
						<li class="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
							<div>
								<p class="text-sm font-semibold text-brand-black">
									{typeof item.data.name === 'string' ? item.data.name : item.id}
								</p>
								<p class="text-xs text-gray-500">Deleted {formatDateTime(item.deletedAt)}</p>
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
	{:else if data.items.length === 0}
		<EmptyState
			title={data.q ? 'No matching products' : 'No products yet'}
			body={data.q
				? 'Try a different search or clear the filters.'
				: 'Add the first product to build the catalog.'}
			actionHref={data.q ? undefined : '/admin/products/new'}
			actionLabel={data.q ? undefined : 'Add the first product'}
		/>
	{:else}
		<div class="overflow-x-auto rounded-xl border border-gray-200 bg-white">
			<table class="min-w-full text-left text-sm">
				<thead
					class="border-b border-gray-200 bg-gray-50 text-xs tracking-wide text-gray-500 uppercase"
				>
					<tr>
						<th class="px-4 py-3 font-semibold">Product</th>
						<th class="px-4 py-3 font-semibold">Brand</th>
						<th class="px-4 py-3 font-semibold">Category</th>
						<th class="px-4 py-3 font-semibold">Status</th>
						<th class="px-4 py-3 font-semibold">Updated</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-gray-100">
					{#each data.items as item (item.id)}
						<tr class="hover:bg-gray-50">
							<td class="px-4 py-3">
								<a
									href={`/admin/products/${encodeURIComponent(item.id)}`}
									class="flex items-center gap-3 font-semibold text-brand-black hover:text-brand-orange"
								>
									<span
										class="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#eef5fa] p-1"
									>
										{#if typeof item.data.image === 'string' && item.data.image}
											<img
												src={item.data.image}
												alt=""
												class="max-h-full max-w-full object-contain"
											/>
										{/if}
									</span>
									<span class="truncate"
										>{typeof item.data.name === 'string' ? item.data.name : item.id}</span
									>
								</a>
							</td>
							<td class="px-4 py-3 text-gray-600">{String(item.data.brand ?? '—')}</td>
							<td class="px-4 py-3 text-gray-600">{String(item.data.category ?? '—')}</td>
							<td class="px-4 py-3"><StatusBadge status={item.status} /></td>
							<td class="px-4 py-3 text-gray-500">{formatDateTime(item.updatedAt)}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</div>
