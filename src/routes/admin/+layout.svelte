<script lang="ts">
	import { SITE } from '$lib/brand';
	import { page } from '$app/state';
	import type { Snippet } from 'svelte';
	import type { LayoutData } from './$types';

	let { data, children }: { data: LayoutData; children: Snippet } = $props();

	const nav = [
		{ href: '/admin', label: 'Homepage', match: (path: string) => path === '/admin' },
		{
			href: '/admin/products',
			label: 'Products',
			match: (path: string) => path.startsWith('/admin/products')
		},
		{
			href: '/admin/media',
			label: 'Media',
			match: (path: string) => path.startsWith('/admin/media')
		},
		{
			href: '/admin/settings',
			label: 'Settings',
			match: (path: string) => path.startsWith('/admin/settings')
		}
	];

	const sectionLabels: Record<string, string> = {
		slides: 'Slides',
		partners: 'Partners',
		stats: 'Stats',
		services: 'Services',
		solutions: 'Solutions',
		testimonies: 'Testimonies'
	};

	const crumbs = $derived.by(() => {
		const parts = page.url.pathname.split('/').filter(Boolean);
		const result: { label: string; href?: string }[] = [{ label: 'Admin', href: '/admin' }];
		if (parts.length <= 1) return result;
		if (parts[1] === 'homepage' && parts[2]) {
			result.push({ label: 'Homepage', href: '/admin' });
			result.push({ label: sectionLabels[parts[2]] ?? parts[2] });
			if (parts[3] === 'new') result.push({ label: 'New' });
			else if (parts[3]) result.push({ label: 'Edit' });
		} else if (parts[1] === 'products') {
			result.push({ label: 'Products', href: '/admin/products' });
			if (parts[2] === 'new') result.push({ label: 'New' });
			else if (parts[2]) result.push({ label: 'Edit' });
		} else if (parts[1] === 'media') {
			result.push({ label: 'Media' });
		} else if (parts[1] === 'settings') {
			result.push({ label: 'Settings' });
		}
		return result;
	});
</script>

<svelte:head>
	<meta name="robots" content="noindex" />
	<title>Admin</title>
</svelte:head>

<div class="min-h-screen bg-[#F7F8FA] text-brand-black">
	<aside
		class="fixed inset-y-0 left-0 z-30 hidden w-60 border-r border-gray-200 bg-white md:flex md:flex-col"
	>
		<div class="flex h-16 items-center gap-2 border-b border-gray-200 px-5">
			<img src="/logo.svg" alt="" class="h-8 w-auto" />
			<div class="leading-tight">
				<p class="text-sm font-bold">{SITE.name}</p>
				<p class="text-[11px] text-gray-500">Content manager</p>
			</div>
		</div>
		<nav class="flex flex-1 flex-col gap-1 p-3">
			{#each nav as item (item.href)}
				<a
					href={item.href}
					class="rounded-lg px-3 py-2 text-sm font-semibold transition {item.match(
						page.url.pathname
					)
						? 'bg-brand-orange/10 text-brand-orange'
						: 'text-gray-600 hover:bg-gray-50 hover:text-brand-black'}"
				>
					{item.label}
				</a>
			{/each}
		</nav>
		<div class="border-t border-gray-200 p-3 text-xs text-gray-500">
			Signed in as<br />
			<span class="font-medium text-brand-black">{data.email || 'local developer'}</span>
		</div>
	</aside>

	<div class="md:pl-60">
		<header
			class="sticky top-0 z-20 flex h-16 items-center justify-between gap-4 border-b border-gray-200 bg-white px-4 sm:px-6"
		>
			<div class="flex min-w-0 items-center gap-2 text-sm">
				{#each crumbs as crumb, index (index)}
					{#if index > 0}<span class="text-gray-300">/</span>{/if}
					{#if crumb.href}
						<a href={crumb.href} class="truncate text-gray-500 hover:text-brand-orange"
							>{crumb.label}</a
						>
					{:else}
						<span class="truncate font-semibold text-brand-black">{crumb.label}</span>
					{/if}
				{/each}
			</div>
			<div class="flex shrink-0 items-center gap-2">
				<a
					href="/"
					target="_blank"
					rel="noreferrer"
					class="rounded-full border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50"
				>
					View site
				</a>
				<a
					href="/cdn-cgi/access/logout"
					class="rounded-full border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50"
				>
					Sign out
				</a>
			</div>
		</header>

		<nav class="flex gap-1 overflow-x-auto border-b border-gray-200 bg-white px-3 py-2 md:hidden">
			{#each nav as item (item.href)}
				<a
					href={item.href}
					class="shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold {item.match(
						page.url.pathname
					)
						? 'bg-brand-orange/10 text-brand-orange'
						: 'text-gray-600'}"
				>
					{item.label}
				</a>
			{/each}
		</nav>

		<main class="mx-auto w-full max-w-6xl p-4 sm:p-6">
			{@render children()}
		</main>
	</div>
</div>
