<script lang="ts">
	import { page } from '$app/state';
	import { getLocale } from '$lib/i18n/locale.svelte';
	import { localePath } from '$lib/i18n/locale';

	const locale = getLocale();
	const slug = $derived(typeof page.params.slug === 'string' ? page.params.slug : null);
	const editHref = $derived(slug ? `/admin/products/${slug}` : '/admin');
	const redirectTo = $derived(page.url.pathname);
</script>

<div
	class="fixed inset-x-0 top-0 z-[70] flex h-14 items-center justify-between gap-3 bg-brand-black px-4 text-sm text-white sm:px-6"
>
	<div class="flex items-center gap-3">
		<span class="rounded-full bg-brand-orange px-3 py-1 text-xs font-bold tracking-wide uppercase"
			>Preview mode</span
		>
		<span class="hidden text-white/70 sm:inline">Drafts are visible only to you.</span>
	</div>
	<div class="flex items-center gap-2">
		<form method="POST" action="/api/admin/preview/exit">
			<input type="hidden" name="redirectTo" value={redirectTo} />
			<button
				type="submit"
				class="rounded-full border border-white/30 px-3 py-1.5 font-semibold transition hover:bg-white/10"
			>
				Exit
			</button>
		</form>
		<a
			href={editHref}
			class="rounded-full border border-white/30 px-3 py-1.5 font-semibold transition hover:bg-white/10"
		>
			Edit
		</a>
		{#if slug}
			<form method="POST" action="/api/admin/preview/publish">
				<input type="hidden" name="id" value={slug} />
				<input
					type="hidden"
					name="redirectTo"
					value={localePath(`/products/${slug}`, locale.value)}
				/>
				<button
					type="submit"
					class="rounded-full bg-brand-orange px-3 py-1.5 font-semibold transition hover:brightness-110"
				>
					Publish
				</button>
			</form>
		{:else}
			<a
				href="/admin"
				class="rounded-full bg-brand-orange px-3 py-1.5 font-semibold transition hover:brightness-110"
			>
				Open drafts
			</a>
		{/if}
	</div>
</div>
