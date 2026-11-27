<script lang="ts">
	import { page } from '$app/state';
	import { getLocale } from '$lib/i18n/locale.svelte';
	import { SITE } from '$lib/brand';
	import { localeAlternates, localePath } from '$lib/i18n/locale';

	let {
		title,
		description,
		image,
		type = 'website',
		path
	}: {
		title: string;
		description: string;
		image?: string;
		type?: string;
		path?: string;
	} = $props();

	const locale = getLocale();
	const barePath = $derived(path ?? page.url.pathname);
	const origin = $derived(page.url.origin);
	const canonical = $derived(`${origin}${localePath(barePath, locale.value)}`);
	const alternates = $derived(localeAlternates(barePath));
	const socialImage = $derived(image ? new URL(image, origin).href : undefined);
	const ogLocale = $derived(locale.value === 'id' ? 'id_ID' : 'en_US');
	const ogAlternate = $derived(locale.value === 'id' ? 'en_US' : 'id_ID');
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={description} />
	<link rel="canonical" href={canonical} />
	<link rel="alternate" hreflang="en" href={`${origin}${alternates.en}`} />
	<link rel="alternate" hreflang="id" href={`${origin}${alternates.id}`} />
	<link rel="alternate" hreflang="x-default" href={`${origin}${alternates.xDefault}`} />
	<meta property="og:site_name" content={SITE.name} />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={description} />
	<meta property="og:type" content={type} />
	<meta property="og:url" content={canonical} />
	<meta property="og:locale" content={ogLocale} />
	<meta property="og:locale:alternate" content={ogAlternate} />
	{#if socialImage}
		<meta property="og:image" content={socialImage} />
	{/if}
</svelte:head>
