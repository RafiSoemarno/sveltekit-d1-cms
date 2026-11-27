<script lang="ts">
	import { useT, getLocale } from '$lib/i18n/locale.svelte';

	let {
		paragraph,
		name,
		company,
		location,
		profileImage,
		linkedinHandle,
		linkedinUrl
	}: {
		paragraph: { en: string; id: string };
		name: string;
		company: string;
		location: { en: string; id: string };
		profileImage?: string;
		linkedinHandle?: string;
		linkedinUrl?: string;
	} = $props();

	const locale = getLocale();
	const t = useT();
</script>

<article class="grid grid-cols-1 items-center gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
	<div class="relative min-h-80 sm:min-h-92">
		<div class="h-74 w-[92%] rounded-xl bg-brand-blue sm:h-84 lg:w-[86%]" aria-hidden="true"></div>

		<div
			class="absolute right-0 bottom-0 flex h-74 w-[92%] items-center rounded-xl bg-[#E4F5FF] px-8 shadow-[0_14px_30px_rgba(15,23,42,0.14)] sm:h-84 sm:px-10 lg:w-[90%]"
		>
			<p class="text-lg leading-relaxed whitespace-pre-line text-brand-black/90 italic sm:text-xl">
				&ldquo;{paragraph[locale.value]}&rdquo;
			</p>
		</div>
	</div>

	<div class="pr-0 lg:pr-10">
		<div class="flex items-center gap-5">
			{#if profileImage}
				<img
					src={profileImage}
					alt={`${name} profile`}
					class="h-20 w-20 rounded-full object-cover"
					loading="lazy"
				/>
			{/if}
			<h3 class="text-3xl leading-none font-extrabold text-brand-black sm:text-4xl">{name}</h3>
		</div>

		<p class="mt-4 text-base leading-snug text-brand-black/90 sm:text-lg">
			<span class="font-medium text-brand-orange">{company}</span>, {location[locale.value]}
		</p>

		{#if linkedinHandle && linkedinUrl}
			<button
				type="button"
				onclick={() => window.open(linkedinUrl, '_blank', 'noopener,noreferrer')}
				class="mt-4 inline-flex items-center gap-2 text-sm font-medium text-brand-blue transition hover:underline sm:text-base"
				aria-label={`${t('aria.open-linkedin')} ${name}`}
			>
				<img src="/icons/linkedin.png" alt="" class="h-5 w-5 object-contain" aria-hidden="true" />
				{linkedinHandle}
			</button>
		{/if}
	</div>
</article>
