<script lang="ts">
	import { categoryLabel, brandLabel } from '$lib/catalog';
	import { useT, getLocale } from '$lib/i18n/locale.svelte';
	import { localePath } from '$lib/i18n/locale';
	import ContactButton from '$lib/components/ContactButton.svelte';

	let {
		name,
		brand,
		category,
		image,
		shortDescription,
		slug,
		onSelect
	}: {
		name: string;
		brand: string;
		category: string;
		image: string;
		shortDescription: { en: string; id: string };
		slug: string;
		onSelect?: (event: MouseEvent) => void;
	} = $props();

	const locale = getLocale();
	const t = useT();
</script>

<article
	class="flex h-full w-full flex-col overflow-hidden rounded-2xl bg-white shadow-md transition-shadow hover:shadow-lg"
>
	<div class="relative h-48 bg-[#eef5fa] sm:h-56">
		<img src={image} alt={name} class="h-full w-full object-contain p-4" loading="lazy" />
		<span
			class="absolute top-3 left-3 rounded-full border border-brand-orange px-3 py-1 text-xs font-semibold text-brand-orange"
		>
			{categoryLabel(category)[locale.value]}
		</span>
	</div>

	<div class="flex flex-1 flex-col gap-2 p-5">
		<h3 class="text-lg leading-tight font-bold text-brand-black">{name}</h3>
		<p class="text-sm text-brand-orange italic">{brandLabel(brand)[locale.value]}</p>
		<p class="line-clamp-3 text-sm leading-relaxed text-black/75">
			{shortDescription[locale.value]}
		</p>
	</div>

	<div class="flex flex-col gap-2 border-t border-gray-100 px-5 py-4">
		<a
			href={localePath(`/products/${slug}`, locale.value)}
			onclick={onSelect}
			class="block w-full rounded-full border border-brand-blue px-4 py-2 text-center text-sm font-semibold text-brand-blue transition hover:bg-brand-blue hover:text-white"
		>
			{t('cta.learn-more')}
		</a>
		<p class="text-center text-xs text-gray-400">{t('cta.for-inquiries')}</p>
		<ContactButton
			text={t('cta.contact-us')}
			message={`${t('waMsg.interested')}${name}`}
			size="sm"
			class="w-full"
		/>
	</div>
</article>
