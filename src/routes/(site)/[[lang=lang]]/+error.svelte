<script lang="ts">
	import { SITE } from '$lib/brand';
	import { page } from '$app/state';
	import { useT, getLocale } from '$lib/i18n/locale.svelte';
	import { localePath } from '$lib/i18n/locale';
	import { PRODUCT_NOT_FOUND } from '$lib/constants';

	const locale = getLocale();
	const t = useT();
</script>

<svelte:head>
	<title>{page.status} — {SITE.name}</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<section class="flex min-h-[60vh] flex-col items-center justify-center gap-6 py-20 text-center">
	<h1 class="text-7xl font-bold text-brand-orange">{page.status}</h1>
	<p class="text-xl text-brand-black/80">
		{page.error?.message === PRODUCT_NOT_FOUND
			? t('error.product-not-found')
			: (page.error?.message ?? t('error.404-title'))}
	</p>
	<a
		href={localePath('/', locale.value)}
		class="rounded-full bg-brand-orange px-8 py-3 text-lg font-semibold text-white shadow-lg shadow-black/20 transition hover:brightness-105"
	>
		{t('cta.back-to-home')}
	</a>
</section>
