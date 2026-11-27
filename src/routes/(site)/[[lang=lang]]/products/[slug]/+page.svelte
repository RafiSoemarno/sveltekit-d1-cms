<script lang="ts">
	import ProductDetail from '$lib/components/ProductDetail.svelte';
	import Seo from '$lib/components/Seo.svelte';
	import { categoryLabel, brandLabel } from '$lib/catalog';
	import { SITE } from '$lib/brand';
	import { useT, getLocale } from '$lib/i18n/locale.svelte';
	import { localePath } from '$lib/i18n/locale';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const locale = getLocale();
	const t = useT();
	const product = $derived(data.product);
	const seoTitle = $derived(product.seo?.title?.[locale.value] || `${product.name} — ${SITE.name}`);
	const seoDescription = $derived(
		product.seo?.description?.[locale.value] || product.shortDescription[locale.value]
	);
</script>

<Seo
	title={seoTitle}
	description={seoDescription}
	image={product.image}
	path={`/products/${product.slug}`}
/>

<section class="py-10 sm:py-16">
	<nav class="flex items-center gap-2 text-sm text-gray-500">
		<a
			href={localePath('/products', locale.value)}
			class="transition-colors hover:text-brand-orange">{t('detail.breadcrumb-products')}</a
		>
		<span>/</span>
		<span class="text-gray-400">{categoryLabel(product.category)[locale.value]}</span>
		<span>/</span>
		<span class="text-gray-400">{brandLabel(product.brand)[locale.value]}</span>
		<span>/</span>
		<span class="font-medium text-brand-orange">{product.name}</span>
	</nav>

	<a
		href={localePath('/products', locale.value)}
		class="mt-4 inline-flex items-center gap-1.5 text-sm text-gray-500 transition-colors hover:text-brand-orange"
	>
		<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
			<path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
		</svg>
		{t('cta.back-to-products')}
	</a>

	<div class="mt-8">
		<ProductDetail {product} />
	</div>
</section>
