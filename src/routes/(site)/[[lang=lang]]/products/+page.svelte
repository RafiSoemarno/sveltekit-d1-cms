<script lang="ts">
	import ProductCard from '$lib/components/ProductCard.svelte';
	import ProductDialog from '$lib/components/ProductDialog.svelte';
	import HighlightedText from '$lib/components/HighlightedText.svelte';
	import Seo from '$lib/components/Seo.svelte';
	import { getSettings } from '$lib/site-settings.svelte';
	import { brandLabel, categoryLabel } from '$lib/catalog';
	import { useT, getLocale } from '$lib/i18n/locale.svelte';
	import { localePath } from '$lib/i18n/locale';
	import { BRANDS, CATEGORIES } from '$lib/catalog';
	import { SITE } from '$lib/brand';
	import type { ProductWithSlug } from '$lib/types';
	import type { PageData } from './$types';
	import { page } from '$app/state';
	import { pushState } from '$app/navigation';

	let { data }: { data: PageData } = $props();

	const locale = getLocale();
	const t = useT();
	const settings = getSettings();

	let searchQuery = $state('');
	let selectedCategory = $state<string | null>(null);
	let selectedBrand = $state<string | null>(null);

	const filtered = $derived(
		data.products.filter((p) => {
			const matchesCategory = !selectedCategory || p.category === selectedCategory;
			const matchesBrand = !selectedBrand || p.brand === selectedBrand;
			const matchesSearch =
				!searchQuery ||
				p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
				p.shortDescription[locale.value].toLowerCase().includes(searchQuery.toLowerCase());
			return matchesCategory && matchesBrand && matchesSearch;
		})
	);

	const selectedProduct = $derived(page.state?.selected?.product ?? null);

	function handleSelect(event: MouseEvent, product: ProductWithSlug) {
		if (
			event.defaultPrevented ||
			event.button !== 0 ||
			event.metaKey ||
			event.ctrlKey ||
			event.shiftKey ||
			event.altKey
		) {
			return;
		}
		event.preventDefault();
		pushState(localePath(`/products/${product.slug}`, locale.value), {
			selected: { product, slug: product.slug }
		});
	}

	function closeDialog() {
		if (page.state?.selected) {
			history.back();
		}
	}
</script>

<Seo
	title={`${t('page.products.title')} — ${SITE.name}`}
	description={t('page.products.description')}
	image={settings.seo.image || '/story-image.png'}
	path="/products"
/>

<section class="py-10 sm:py-16">
	<div class="flex flex-wrap items-center gap-x-8 gap-y-2">
		<h2 class="text-left text-4xl font-bold text-brand-black sm:text-5xl">
			<HighlightedText text={t('section.products.h2')} />
		</h2>
		<div
			class="flex-1 rounded-full bg-brand-orange px-4 py-3 text-center text-sm font-semibold text-white"
		></div>
	</div>

	<div class="relative mt-6">
		<svg
			class="pointer-events-none absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-gray-400"
			fill="none"
			viewBox="0 0 24 24"
			stroke="currentColor"
			stroke-width="2"
		>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
			/>
		</svg>
		<input
			type="text"
			bind:value={searchQuery}
			placeholder={t('search.placeholder')}
			class="w-full rounded-full border border-gray-300 bg-white py-3 pr-4 pl-12 text-sm text-brand-black placeholder:text-gray-400 focus:border-brand-orange focus:outline-none"
		/>
	</div>

	<div class="mt-8 flex flex-col gap-8 lg:flex-row lg:gap-10">
		<aside class="w-full shrink-0 lg:w-48">
			<h3 class="mb-3 text-sm font-semibold tracking-wider text-gray-500 uppercase">
				{t('filter.brand')}
			</h3>
			<div class="flex flex-row flex-wrap gap-2 lg:flex-col">
				<button
					type="button"
					onclick={() => (selectedBrand = null)}
					class="rounded-full border px-4 py-1.5 text-sm font-medium transition {!selectedBrand
						? 'border-brand-blue bg-brand-blue text-white'
						: 'border-gray-300 text-brand-black hover:border-brand-blue hover:text-brand-blue'}"
				>
					{t('filter.all')}
				</button>
				{#each BRANDS as brand (brand.id)}
					<button
						type="button"
						onclick={() => (selectedBrand = brand.id)}
						class="rounded-full border px-4 py-1.5 text-sm font-medium transition {selectedBrand ===
						brand.id
							? 'border-brand-blue bg-brand-blue text-white'
							: 'border-gray-300 text-brand-black hover:border-brand-blue hover:text-brand-blue'}"
					>
						{brandLabel(brand.id)[locale.value]}
					</button>
				{/each}
			</div>
		</aside>

		<div class="flex-1">
			<div class="flex flex-wrap gap-2">
				<button
					type="button"
					onclick={() => (selectedCategory = null)}
					class="rounded-full border px-4 py-1.5 text-sm font-medium transition {!selectedCategory
						? 'border-brand-orange bg-brand-orange text-white'
						: 'border-gray-300 text-brand-black hover:border-brand-orange hover:text-brand-orange'}"
				>
					{t('filter.all')}
				</button>
				{#each CATEGORIES as cat (cat.id)}
					<button
						type="button"
						onclick={() => (selectedCategory = cat.id)}
						class="rounded-full border px-4 py-1.5 text-sm font-medium transition {selectedCategory ===
						cat.id
							? 'border-brand-orange bg-brand-orange text-white'
							: 'border-gray-300 text-brand-black hover:border-brand-orange hover:text-brand-orange'}"
					>
						{categoryLabel(cat.id)[locale.value]}
					</button>
				{/each}
			</div>

			{#if filtered.length === 0}
				<div class="mt-16 flex flex-col items-center gap-4 text-center">
					<svg
						class="h-16 w-16 text-gray-300"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						aria-hidden="true"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="1.5"
							d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
						/>
					</svg>
					<p class="text-lg text-gray-500">{t('empty.no-match')}</p>
					<button
						type="button"
						onclick={() => {
							selectedCategory = null;
							selectedBrand = null;
							searchQuery = '';
						}}
						class="rounded-full bg-brand-blue px-6 py-2 text-sm font-semibold text-white transition hover:brightness-105"
					>
						{t('cta.reset-filters')}
					</button>
				</div>
			{:else}
				<div class="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
					{#each filtered as product (product.slug)}
						<ProductCard {...product} onSelect={(event) => handleSelect(event, product)} />
					{/each}
				</div>
			{/if}
		</div>
	</div>
</section>

<ProductDialog product={selectedProduct} open={!!selectedProduct} onclose={closeDialog} />
