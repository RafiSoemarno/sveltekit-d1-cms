<script lang="ts">
	import ContactButton from '$lib/components/ContactButton.svelte';
	import ProductGallery from '$lib/components/ProductGallery.svelte';
	import { brandLabel } from '$lib/catalog';
	import { useT, getLocale } from '$lib/i18n/locale.svelte';
	import type { ProductWithSlug } from '$lib/types';

	let {
		product,
		layout = 'page',
		titleId
	}: {
		product: ProductWithSlug;
		layout?: 'page' | 'dialog';
		titleId?: string;
	} = $props();

	const locale = getLocale();
	const t = useT();

	type TabId = 'overview' | 'download';

	const hasBrochures = $derived(product.brochures ? product.brochures.length > 0 : false);
	let activeTab = $state<TabId>('overview');

	const visibleTab = $derived(hasBrochures ? activeTab : 'overview');

	function brochureLabel(brochure: { url: string; label?: string }) {
		return brochure.label ?? brochure.url.split('/').pop() ?? brochure.url;
	}
</script>

<div
	class="grid gap-6 {layout === 'page'
		? 'grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16'
		: 'grid-cols-1 lg:grid-cols-2 lg:gap-14'}"
>
	<div
		class="flex min-h-64 items-center justify-center {layout === 'page'
			? 'rounded-2xl'
			: 'p-2 sm:min-h-112'}"
	>
		{#if layout === 'page'}
			<ProductGallery images={[product.image, ...(product.gallery ?? [])]} name={product.name} />
		{:else}
			<img src={product.image} alt={product.name} class="h-auto max-h-112 w-full object-contain" />
		{/if}
	</div>

	<div class="flex flex-col gap-6">
		{#if layout === 'dialog'}
			<div
				class="grid items-center gap-5 border-b border-gray-200 pb-5 sm:grid-cols-[minmax(0,1fr)_auto]"
			>
				<div>
					<h1 id={titleId} class="text-3xl font-bold text-brand-black sm:text-4xl">
						{product.name}
					</h1>
					<p class="mt-1 text-xl font-semibold text-brand-blue italic">
						{brandLabel(product.brand)[locale.value]}
					</p>
				</div>
				<ContactButton
					text={t('cta.inquire-wa')}
					message={`${t('waMsg.interested')}${product.name}`}
					class="w-fit justify-self-start sm:justify-self-end"
				/>
			</div>
		{:else}
			<div>
				<h1 id={titleId} class="text-4xl font-bold text-brand-black sm:text-5xl">
					{product.name}
				</h1>
				<p class="mt-2 text-xl text-brand-orange italic">
					{brandLabel(product.brand)[locale.value]}
				</p>
			</div>

			<ContactButton
				text={t('cta.inquire-wa')}
				message={`${t('waMsg.interested')}${product.name}`}
				class="w-fit"
			/>
		{/if}

		{#if hasBrochures}
			<div role="tablist" aria-label={product.name} class="flex gap-1 border-b border-gray-200">
				<button
					type="button"
					role="tab"
					id="product-tab-overview"
					aria-selected={visibleTab === 'overview'}
					aria-controls="product-panel-overview"
					onclick={() => (activeTab = 'overview')}
					class="border-b-2 px-4 py-2.5 text-sm font-medium transition-colors {visibleTab ===
					'overview'
						? 'border-brand-orange text-brand-orange'
						: 'border-transparent text-gray-500 hover:text-brand-black'}"
				>
					{t('detail.tab-overview')}
				</button>
				<button
					type="button"
					role="tab"
					id="product-tab-download"
					aria-selected={visibleTab === 'download'}
					aria-controls="product-panel-download"
					onclick={() => (activeTab = 'download')}
					class="border-b-2 px-4 py-2.5 text-sm font-medium transition-colors {visibleTab ===
					'download'
						? 'border-brand-orange text-brand-orange'
						: 'border-transparent text-gray-500 hover:text-brand-black'}"
				>
					{t('detail.tab-download')}
				</button>
			</div>
		{/if}

		{#if visibleTab === 'overview'}
			<div
				id="product-panel-overview"
				role={hasBrochures ? 'tabpanel' : undefined}
				aria-labelledby={hasBrochures ? 'product-tab-overview' : undefined}
				class="space-y-4 leading-relaxed text-black/80"
			>
				<p class="text-lg">{product.shortDescription[locale.value]}</p>
				<p>{product.longDescription[locale.value]}</p>

				{#if product.features && product.features.length > 0}
					<div>
						<h3 class="text-xl font-bold text-brand-black">{t('detail.features-heading')}</h3>
						<ul class="mt-3 space-y-2">
							{#each product.features as feature (feature)}
								<li class="flex items-start gap-2 text-black/80">
									<span class="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand-orange"></span>
									{feature[locale.value]}
								</li>
							{/each}
						</ul>
					</div>
				{/if}
			</div>
		{:else}
			<div role="tabpanel" id="product-panel-download" aria-labelledby="product-tab-download">
				<ul class="space-y-3">
					{#each product.brochures ?? [] as brochure (brochure.url)}
						<li>
							<a
								href={brochure.url}
								download
								target="_blank"
								rel="noopener"
								class="group inline-flex items-center gap-3 rounded-xl border border-gray-200 p-4 transition-colors hover:border-brand-orange"
							>
								<svg
									class="h-6 w-6 shrink-0 text-brand-orange"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
									stroke-width="1.5"
									aria-hidden="true"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
									/>
								</svg>
								<span class="min-w-0">
									<span
										class="block truncate font-medium text-brand-black transition-colors group-hover:text-brand-orange"
									>
										{brochureLabel(brochure)}
									</span>
									<span class="block text-xs text-gray-500">PDF</span>
								</span>
							</a>
						</li>
					{/each}
				</ul>
			</div>
		{/if}
	</div>
</div>
