<script lang="ts">
	import { fade } from 'svelte/transition';
	import { onMount } from 'svelte';
	import PseudoCarousel from '$lib/components/PseudoCarousel.svelte';
	import ServiceCard from '$lib/components/ServiceCard.svelte';
	import StatCard from '$lib/components/StatCard.svelte';
	import Testimony from '$lib/components/Testimony.svelte';
	import HighlightedText from '$lib/components/HighlightedText.svelte';
	import ContactButton from '$lib/components/ContactButton.svelte';
	import Button from '$lib/components/Button.svelte';
	import Seo from '$lib/components/Seo.svelte';
	import { getSettings } from '$lib/site-settings.svelte';
	import { useT, getLocale } from '$lib/i18n/locale.svelte';
	import { localePath } from '$lib/i18n/locale';
	import type { Solution } from '$lib/types';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const locale = getLocale();
	const t = useT();
	const settings = getSettings();

	const solutions = $derived(data.solutions);
	const testimonies = $derived(data.testimonies);
	const partnerRows = $derived(
		[1, 2]
			.map((row) => data.partners.filter((partner) => partner.row === row))
			.filter((row) => row.length > 0)
	);

	let activeSolutionIndex = $state(0);
	let activeTestimonyIndex = $state(0);

	const activeSolution = $derived(
		solutions.length > 0
			? solutions[Math.max(0, Math.min(activeSolutionIndex, solutions.length - 1))]
			: undefined
	);

	const activeTestimony = $derived(
		testimonies.length > 0
			? testimonies[Math.max(0, Math.min(activeTestimonyIndex, testimonies.length - 1))]
			: undefined
	);

	let autoplayId: ReturnType<typeof setInterval> | undefined;

	function stopAutoplay() {
		if (autoplayId) {
			clearInterval(autoplayId);
			autoplayId = undefined;
		}
	}

	function startAutoplay() {
		stopAutoplay();
		if (testimonies.length <= 1) return;
		autoplayId = setInterval(() => {
			activeTestimonyIndex = (activeTestimonyIndex + 1) % testimonies.length;
		}, 5000);
	}

	function setTestimony(index: number) {
		activeTestimonyIndex = index;
		startAutoplay();
	}

	onMount(() => {
		startAutoplay();
		return () => stopAutoplay();
	});
</script>

{#if data.slides.length > 0}
	<section
		id="home"
		class="flex min-h-[calc(50vh-7rem)] scroll-mt-32 items-center justify-center self-center py-10 sm:py-16"
	>
		<PseudoCarousel slides={data.slides} autoplayMs={5500} />
	</section>
{/if}

<Seo
	title={settings.seo.title[locale.value]}
	description={settings.seo.description[locale.value]}
	image={settings.seo.image || '/story-image.png'}
	path="/"
/>

{#if data.partners.length > 0}
	<section class="mx-0! w-full! max-w-none! bg-brand-blue py-10 text-white sm:py-14">
		<div class="mx-auto w-[calc(100%-2rem)] max-w-7xl">
			<h2 class="text-center text-xl leading-tight font-normal sm:text-3xl">
				{t('section.partners.banner-pre')}<strong>90+</strong>{t('section.partners.banner-post')}
			</h2>

			<div class="mt-8 space-y-6 sm:mt-10 sm:space-y-8">
				{#each partnerRows as row, rowIndex (rowIndex)}
					<div
						class="sm:grid sm:items-center sm:gap-6"
						style={`grid-template-columns: repeat(${Math.max(row.length, 1)}, minmax(0, 1fr));`}
					>
						<div class="overflow-hidden sm:hidden">
							<div class="flex animate-marquee flex-nowrap items-center">
								{#each [...row, ...row] as partner, i (i)}
									<div class="flex min-w-28 shrink-0 items-center justify-center px-3">
										<img
											src={partner.logo}
											alt={partner.name}
											class="h-10 w-auto max-w-36 object-contain"
											loading="lazy"
										/>
									</div>
								{/each}
							</div>
						</div>
						<div class="hidden sm:contents">
							{#each row as partner (partner.name + partner.logo)}
								<div class="flex items-center justify-center">
									<img
										src={partner.logo}
										alt={partner.name}
										class="h-10 w-auto max-w-36 object-contain sm:h-12"
										loading="lazy"
									/>
								</div>
							{/each}
						</div>
					</div>
				{/each}
			</div>
		</div>
	</section>
{/if}

<section id="about-us" class="mx-auto max-w-7xl scroll-mt-32 px-4 py-20 sm:px-8">
	<h2 class="text-center text-4xl font-bold text-brand-black sm:text-5xl">
		<HighlightedText text={t('section.about.h2')} />
	</h2>

	<div class="relative mt-12 overflow-hidden rounded-3xl bg-brand-blue p-10">
		<div class="flex flex-col gap-10 sm:px-10">
			{#if data.stats.length > 0}
				<div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
					{#each data.stats as stat (stat.label.en)}
						<StatCard value={stat.value} label={stat.label[locale.value]} icon={stat.icon} />
					{/each}
				</div>
			{/if}

			<div class="flex flex-col gap-8 lg:flex-row lg:justify-between">
				<p
					class="my-auto max-w-xl flex-3 self-start border-l-[6px] border-brand-orange pl-4 text-xl leading-snug font-medium text-brand-white/95 sm:text-2xl"
				>
					{t('section.about.body')}
				</p>
			</div>

			<div class="flex justify-center">
				<ContactButton text={t('cta.contact-us')} message={t('waMsg.general')} />
			</div>
		</div>

		<img
			src="/icons/medal.png"
			alt=""
			class="pointer-events-none absolute right-1 bottom-2 h-32 w-32 sm:h-40 sm:w-40"
			aria-hidden="true"
		/>
	</div>
</section>

{#if data.services.length > 0}
	<section class="mx-0! min-h-screen w-full! max-w-none! py-12 sm:py-16">
		<div class="mx-auto w-[calc(100%-2rem)] max-w-7xl">
			<h2 class="text-center text-4xl font-bold text-brand-black sm:text-5xl">
				<HighlightedText text={t('section.solutions.h2')} />
			</h2>
			<p
				id="solutions"
				class="mx-auto mt-4 max-w-3xl scroll-mt-32 text-center text-base text-black/80 sm:text-xl"
			>
				{t('section.solutions.body')}
			</p>

			<div class="mx-20 mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
				{#each data.services as service (service.name.en)}
					<ServiceCard
						name={service.name[locale.value]}
						description={service.description[locale.value]}
						icon={service.icon}
					/>
				{/each}
			</div>

			<div class="mt-10 flex justify-center">
				<ContactButton text={t('cta.schedule')} message={t('waMsg.schedule')} />
			</div>
		</div>
	</section>
{/if}

{#if data.solutions.length > 0}
	<section class="mx-0! w-full! max-w-none! bg-brand-blue py-12 text-brand-white sm:py-16">
		<div class="mx-auto w-[calc(100%-2rem)] max-w-7xl">
			<h2 class="text-center text-4xl font-bold sm:text-5xl">
				<HighlightedText text={t('section.products.h2')} />
			</h2>
			<p class="mx-auto mt-4 max-w-5xl scroll-mt-32 text-center text-base text-white/80 sm:text-xl">
				{t('section.products.body')}
			</p>

			<div class="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_1.3fr] lg:gap-12">
				<div class="flex flex-col gap-4">
					{#snippet solutionSnippet(solution: Solution, index: number)}
						<button
							type="button"
							onclick={() => (activeSolutionIndex = index)}
							class="flex w-full items-center gap-4 rounded-2xl border border-[#0d8ccc] px-6 py-5 text-left text-white transition-all duration-200 hover:border-[#57c1ef] {activeSolutionIndex ===
							index
								? 'bg-brand-orange text-brand-white shadow-lg shadow-black/20'
								: 'bg-transparent'}"
							aria-pressed={activeSolutionIndex === index}
						>
							<img
								src={solution.icon}
								alt=""
								class="h-7 w-7 shrink-0 object-contain"
								aria-hidden="true"
							/>
							<span class="text-xl font-semibold">{solution.title[locale.value]}</span>
						</button>
					{/snippet}

					{#each solutions as solution, index (solution.title.en)}
						{@render solutionSnippet(solution, index)}
					{/each}
				</div>

				<div class="flex flex-col gap-6">
					{#if activeSolution}
						<img
							src={activeSolution.image}
							alt={activeSolution.title[locale.value]}
							class="mx-auto h-72 w-full max-w-md object-contain"
							loading="lazy"
						/>
					{/if}

					<p class="max-w-2xl text-2xl leading-relaxed text-white/85">
						{activeSolution?.description[locale.value]}
					</p>

					<Button
						href={localePath('/products', locale.value)}
						variant="orange"
						size="lg"
						text={t('cta.see-catalog')}
					/>
				</div>
			</div>
		</div>
	</section>
{/if}

{#if data.testimonies.length > 0}
	<section id="testimony" class="mx-0! w-full! max-w-none! scroll-mt-32 py-12 sm:py-16">
		<div class="mx-auto w-[calc(100%-2rem)] max-w-7xl">
			<h2 class="text-center text-5xl font-bold text-brand-black sm:text-6xl">
				<HighlightedText text={t('section.testimony.h2')} />
			</h2>
			<p class="mx-auto mt-4 max-w-3xl text-center text-base leading-snug text-black/85 sm:text-lg">
				{t('section.testimony.body')}
			</p>

			<div
				class="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_auto] lg:items-center lg:gap-8"
				role="group"
				aria-label={t('aria.testimony-group')}
				onmouseenter={stopAutoplay}
				onmouseleave={startAutoplay}
			>
				{#if activeTestimony}
					<div
						class="grid min-h-88 grid-cols-1 grid-rows-1 items-start overflow-hidden rounded-2xl px-2 py-3 sm:px-3"
					>
						{#key activeTestimonyIndex}
							<div
								class="col-start-1 row-start-1"
								in:fade={{ duration: 300, delay: 450 }}
								out:fade={{ duration: 300 }}
							>
								<Testimony
									paragraph={activeTestimony.paragraph}
									name={activeTestimony.name}
									company={activeTestimony.company}
									location={activeTestimony.location}
									profileImage={activeTestimony.profileImage}
									linkedinHandle={activeTestimony.linkedinHandle}
									linkedinUrl={activeTestimony.linkedinUrl}
								/>
							</div>
						{/key}
					</div>
				{/if}

				{#if testimonies.length > 1}
					<div class="flex items-center justify-center">
						<div class="flex flex-row items-center gap-2 lg:flex-col">
							{#each testimonies as testimony, index (`${testimony.name}-${index}`)}
								<button
									type="button"
									onclick={() => setTestimony(index)}
									class="h-3.5 w-3.5 rounded-full transition {activeTestimonyIndex === index
										? 'bg-brand-orange'
										: 'bg-black/15 hover:bg-black/30'}"
									aria-label={`${t('aria.show-testimony')} ${testimony.name}`}
									aria-pressed={activeTestimonyIndex === index}
								></button>
							{/each}
						</div>
					</div>
				{/if}
			</div>
		</div>
	</section>
{/if}

<section id="our-story" class="mx-0! w-full! max-w-none! scroll-mt-32 py-12 sm:py-16">
	<div
		class="mx-auto grid w-[calc(100%-2rem)] max-w-7xl grid-cols-1 items-center gap-8 lg:grid-cols-2 lg:gap-12"
	>
		<div>
			<h2 class="text-5xl leading-tight font-bold text-brand-black sm:text-6xl">
				<HighlightedText text={t('section.story.h2')} />
			</h2>
			<p class="mt-10 max-w-xl text-xl leading-relaxed text-black/85 sm:leading-[1.45]">
				{t('section.story.body-1')}
			</p>
			<p class="mt-8 max-w-xl text-xl leading-relaxed text-black/85 sm:leading-[1.45]">
				{t('section.story.body-2')}
			</p>
		</div>

		<img
			src="/story-image.png"
			alt={t('alt.story-visual')}
			class="aspect-[3/2] w-full rounded-xl object-cover"
			loading="lazy"
		/>
	</div>
</section>
