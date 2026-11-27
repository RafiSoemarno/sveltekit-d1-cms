<script lang="ts">
	import { onMount } from 'svelte';
	import { afterNavigate, goto } from '$app/navigation';
	import { page } from '$app/state';
	import favicon from '$lib/assets/logo.svg';
	import { translate, type UiKey } from '$lib/i18n/ui';
	import { setLocaleContext } from '$lib/i18n/locale.svelte';
	import { localePath, stripLocale, type Locale } from '$lib/i18n/locale';
	import { setSettingsContext } from '$lib/site-settings.svelte';
	import { SITE } from '$lib/brand';
	import { resetConsent } from '$lib/consent.svelte';
	import { initAnalytics, revokeConsent, sendPageView, trackConversion } from '$lib/analytics';
	import { ADS_ENABLED } from '$lib/constants';
	import ContactButton from '$lib/components/ContactButton.svelte';
	import ConsentBanner from '$lib/components/ConsentBanner.svelte';
	import PreviewBar from '$lib/components/PreviewBar.svelte';
	import type { LayoutData } from './$types';

	let { data, children }: { data: LayoutData; children: import('svelte').Snippet } = $props();

	// svelte-ignore state_referenced_locally
	const locale = $state<{ value: Locale }>({ value: data.locale });
	// svelte-ignore state_referenced_locally
	const settings = $state(structuredClone(data.settings));
	setLocaleContext(locale);
	setSettingsContext(settings);

	let mobileMenuOpen = $state(false);

	$effect(() => {
		locale.value = data.locale;
		Object.assign(settings, data.settings);
		if (typeof document !== 'undefined') document.documentElement.lang = data.locale;
	});

	const t = (key: UiKey) => translate(key, locale.value);

	onMount(() => {
		initAnalytics();
	});

	afterNavigate(() => {
		sendPageView();
	});

	function handleNavClick(event: MouseEvent, hash: string) {
		event.preventDefault();
		mobileMenuOpen = false;

		const home = localePath('/', locale.value);
		if (page.url.pathname !== home) {
			window.location.href = `${home}${hash}`;
			return;
		}

		if (window.location.hash === hash) {
			document.querySelector(hash)?.scrollIntoView();
			return;
		}

		window.location.hash = hash;
	}

	function switchLocale(next: Locale) {
		const target = localePath(stripLocale(page.url.pathname), next);
		goto(`${target}${page.url.search}${page.url.hash}`, { invalidateAll: true });
	}

	const telHref = $derived(`tel:${settings.contact.phone.replace(/[^+\d]/g, '')}`);
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

{#if data.preview}
	<PreviewBar />
{/if}

<header class="fixed inset-x-0 z-50 {data.preview ? 'top-16 sm:top-20' : 'top-4 sm:top-8'}">
	<nav
		class="mx-auto flex w-[calc(100%-2rem)] max-w-7xl items-center justify-between rounded-full bg-white px-4 py-3 drop-shadow-md sm:px-6 sm:py-4"
	>
		<a href={localePath('/', locale.value)} class="flex items-center gap-2 sm:gap-3">
			<img src="/logo.svg" alt={`${SITE.name} logo`} class="h-8 w-auto sm:h-10" />
			<span class="hidden text-xl font-bold text-brand-black italic sm:inline lg:text-2xl"
				>{SITE.name}</span
			>
		</a>

		<!-- Desktop nav -->
		<ul class="hidden items-center gap-2 md:flex">
			<li>
				<a
					href={localePath('/', locale.value)}
					onclick={(event) => handleNavClick(event, '#home')}
					class="rounded-full px-4 py-2 text-base font-normal text-brand-black transition-colors hover:text-brand-orange {(page
						.url.hash || '#home') === '#home'
						? 'text-brand-orange'
						: ''}"
				>
					{t('nav.home')}
				</a>
			</li>
			{#if data.availability.services}
				<li>
					<a
						href={localePath('/', locale.value)}
						onclick={(event) => handleNavClick(event, '#solutions')}
						class="rounded-full px-4 py-2 text-base font-normal text-brand-black transition-colors hover:text-brand-orange {page
							.url.hash === '#solutions'
							? 'text-brand-orange'
							: ''}"
					>
						{t('nav.services')}
					</a>
				</li>
			{/if}
			<li>
				<a
					href={localePath('/products', locale.value)}
					class="rounded-full px-4 py-2 text-base font-normal text-brand-black transition-colors hover:text-brand-orange {page.url.pathname.startsWith(
						localePath('/products', locale.value)
					)
						? 'text-brand-orange'
						: ''}"
					data-sveltekit-preload-data="hover"
				>
					{t('nav.products')}
				</a>
			</li>
			<li class="mx-4 flex items-center gap-1">
				<button
					type="button"
					onclick={() => switchLocale('en')}
					class="rounded-sm p-0.5 transition hover:ring-1 hover:ring-gray-300 {locale.value === 'en'
						? 'border-[3px] border-brand-orange'
						: 'border-[3px] border-transparent'}"
					aria-label={t('nav.lang-en')}
				>
					<img src="/icons/en-flag.png" alt="" class="h-6 w-auto drop-shadow-md" />
				</button>
				<button
					type="button"
					onclick={() => switchLocale('id')}
					class="rounded-sm p-0.5 transition hover:ring-1 hover:ring-gray-300 {locale.value === 'id'
						? 'border-[3px] border-brand-orange'
						: 'border-[3px] border-transparent'}"
					aria-label={t('nav.lang-id')}
				>
					<img src="/icons/id-flag.png" alt="" class="h-6 w-auto drop-shadow-md" />
				</button>
			</li>
			<li>
				<ContactButton text={t('nav.contact-us')} size="sm" />
			</li>
		</ul>

		<!-- Mobile hamburger + toggle -->
		<div class="flex items-center gap-2 md:hidden">
			<div class="flex items-center gap-1">
				<button
					type="button"
					onclick={() => switchLocale('en')}
					class="rounded-sm p-0.5 transition hover:ring-1 hover:ring-gray-300 {locale.value === 'en'
						? 'border-[3px] border-brand-orange'
						: 'border-[3px] border-transparent'}"
					aria-label={t('nav.lang-en')}
				>
					<img src="/icons/en-flag.png" alt="" class="h-5 w-auto drop-shadow-md" />
				</button>
				<button
					type="button"
					onclick={() => switchLocale('id')}
					class="rounded-sm p-0.5 transition hover:ring-1 hover:ring-gray-300 {locale.value === 'id'
						? 'border-[3px] border-brand-orange'
						: 'border-[3px] border-transparent'}"
					aria-label={t('nav.lang-id')}
				>
					<img src="/icons/id-flag.png" alt="" class="h-5 w-auto drop-shadow-md" />
				</button>
			</div>
			<button
				class="flex items-center justify-center rounded-full p-2 text-brand-black transition-colors hover:bg-gray-100"
				onclick={() => (mobileMenuOpen = !mobileMenuOpen)}
				aria-label={t('nav.menu-toggle')}
				aria-expanded={mobileMenuOpen}
			>
				{#if mobileMenuOpen}
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-6 w-6"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						aria-hidden="true"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M6 18L18 6M6 6l12 12"
						/>
					</svg>
				{:else}
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-6 w-6"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						aria-hidden="true"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M4 6h16M4 12h16M4 18h16"
						/>
					</svg>
				{/if}
			</button>
		</div>
	</nav>

	<!-- Mobile dropdown menu -->
	{#if mobileMenuOpen}
		<div
			class="mx-auto mt-2 w-[calc(100%-2rem)] max-w-7xl rounded-2xl bg-white px-4 py-3 drop-shadow-md md:hidden"
		>
			<ul class="flex flex-col gap-1">
				<li>
					<a
						href={localePath('/', locale.value)}
						onclick={(event) => handleNavClick(event, '#home')}
						class="block rounded-full px-4 py-2 text-base font-normal text-brand-black transition-colors hover:text-brand-orange {(page
							.url.hash || '#home') === '#home'
							? 'text-brand-orange'
							: ''}"
					>
						{t('nav.home')}
					</a>
				</li>
				{#if data.availability.services}
					<li>
						<a
							href={localePath('/', locale.value)}
							onclick={(event) => handleNavClick(event, '#solutions')}
							class="block rounded-full px-4 py-2 text-base font-normal text-brand-black transition-colors hover:text-brand-orange {page
								.url.hash === '#solutions'
								? 'text-brand-orange'
								: ''}"
						>
							{t('nav.services')}
						</a>
					</li>
				{/if}
				<li>
					<a
						href={localePath('/products', locale.value)}
						class="block rounded-full px-4 py-2 text-base font-normal text-brand-black transition-colors hover:text-brand-orange {page.url.pathname.startsWith(
							localePath('/products', locale.value)
						)
							? 'text-brand-orange'
							: ''}"
						data-sveltekit-preload-data="hover"
					>
						{t('nav.products')}
					</a>
				</li>
				<li>
					<ContactButton text={t('nav.contact-us')} size="sm" class="w-full" />
				</li>
			</ul>
		</div>
	{/if}
</header>

<main
	class="flex min-h-screen flex-col items-center bg-linear-to-r from-[#FCFEFF] to-[#E7F7FF] {data.preview
		? 'pt-44'
		: 'pt-28'} *:mx-auto *:w-[calc(100%-2rem)] *:max-w-7xl"
>
	{@render children()}
</main>

<footer
	id="contact-us"
	class="w-full scroll-mt-32 bg-[#006599] px-4 pt-12 pb-10 text-white sm:pt-16 sm:pb-14"
>
	<div
		class="mx-auto grid max-w-7xl grid-cols-1 gap-8 text-sm sm:grid-cols-2 lg:grid-cols-4 lg:gap-12"
	>
		<div class="flex flex-col gap-4">
			<div class="flex items-center gap-2">
				<img src="/logo.svg" alt={`${SITE.name} logo`} class="h-10 w-auto" />
				<span class="text-lg font-bold italic">{SITE.name}</span>
			</div>
			<div class="flex flex-col gap-2">
				<div class="flex items-center gap-2">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						fill="currentColor"
						class="h-4 w-4 shrink-0"
					>
						<path
							fill-rule="evenodd"
							d="M1.5 4.5a3 3 0 013-3h1.372c.86 0 1.61.586 1.819 1.42l.882 3.53a1.875 1.875 0 01-.694 1.954l-1.293.97c-.135.101-.164.249-.126.532.092.696.338 1.356.71 1.929.184.289.398.561.637.81l.724.714c.195.19.45.295.71.295a.9.9 0 00.6-.243l1.3-1.02a1.875 1.875 0 011.955-.694l3.53.882a1.875 1.875 0 011.42 1.819V19.5a3 3 0 01-3 3h-1.372c-.86 0-1.61-.586-1.819-1.42l-.882-3.53a1.875 1.875 0 01.694-1.954l1.293-.97c.135-.101.164-.249.126-.532a6.11 6.11 0 00-.71-1.929 6.38 6.38 0 00-.637-.81l-.724-.714a.9.9 0 00-.6-.243.9.9 0 00-.6.243l-1.3 1.02a1.875 1.875 0 01-1.955.694l-3.53-.882a1.875 1.875 0 01-1.42-1.819V4.5z"
							clip-rule="evenodd"
						/>
					</svg>
					<a href={telHref} class="hover:underline" onclick={() => trackConversion()}
						>{settings.contact.phone}</a
					>
				</div>
				<div class="flex items-center gap-2">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						fill="currentColor"
						class="h-4 w-4 shrink-0"
					>
						<path
							d="M1.5 8.67v8.58a3 3 0 003 3h15a3 3 0 003-3V8.67l-8.928 5.493a3 3 0 01-3.144 0L1.5 8.67z"
						/>
						<path
							d="M22.5 6.908V6.75a3 3 0 00-3-3h-15a3 3 0 00-3 3v.158l9.714 5.978a1.5 1.5 0 001.572 0L22.5 6.908z"
						/>
					</svg>
					<a
						href={`mailto:${settings.contact.email}`}
						class="hover:underline"
						onclick={() => trackConversion()}>{settings.contact.email}</a
					>
				</div>
				<div class="flex items-start gap-2">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						fill="currentColor"
						class="mt-0.5 h-4 w-4 shrink-0"
					>
						<path
							fill-rule="evenodd"
							d="M12 2a7.5 7.5 0 00-7.5 7.5c0 3.033 2.003 6.168 5.316 9.39a2.25 2.25 0 003.368 0c3.313-3.222 5.316-6.357 5.316-9.39A7.5 7.5 0 0012 2zm0 10.5a3 3 0 110-6 3 3 0 010 6z"
							clip-rule="evenodd"
						/>
					</svg>
					<span>{settings.contact.address}</span>
				</div>
			</div>
		</div>

		<div class="flex flex-col gap-4">
			<h3 class="text-base font-bold">{t('footer.explore')}</h3>
			<ul class="flex flex-col gap-1">
				<li>
					<a href={localePath('/', locale.value)} class="hover:underline">{t('nav.home')}</a>
				</li>
				<li>
					<a href={localePath('/products', locale.value)} class="hover:underline"
						>{t('nav.products')}</a
					>
				</li>
				<li>
					<a href={`${localePath('/', locale.value)}#solutions`} class="hover:underline"
						>{t('nav.services')}</a
					>
				</li>
				<li>
					<a href={localePath('/privacy-policy', locale.value)} class="hover:underline"
						>{t('footer.privacy-policy')}</a
					>
				</li>
			</ul>
			{#if ADS_ENABLED}
				<button
					type="button"
					onclick={() => {
						resetConsent();
						revokeConsent();
					}}
					class="mt-1 text-left font-bold hover:underline"
				>
					{t('footer.cookie-settings')}
				</button>
			{/if}
		</div>

		<div class="flex flex-col gap-4">
			<h3 class="text-base font-bold">{t('footer.any-inquiries')}</h3>
			<ContactButton text={t('cta.contact-us')} size="md" />
		</div>
	</div>

	<div class="mx-auto mt-12 max-w-7xl border-t border-white/20 pt-6 text-center text-sm">
		&copy; 2026 {SITE.name}. All Rights Reserved.
	</div>
</footer>

{#if ADS_ENABLED}
	<ConsentBanner />
{/if}
