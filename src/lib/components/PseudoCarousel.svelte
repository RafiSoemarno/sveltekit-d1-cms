<script lang="ts">
	import { onMount } from 'svelte';
	import { useT, getLocale } from '$lib/i18n/locale.svelte';
	import ContactButton from '$lib/components/ContactButton.svelte';
	import type { CarouselSlide } from '$lib/types';

	let { slides, autoplayMs = 5000 }: { slides: CarouselSlide[]; autoplayMs?: number } = $props();

	const locale = getLocale();
	const t = useT();

	let currentIndex = $state(0);
	let previousIndex = $state(-1);

	let autoplayId: ReturnType<typeof setInterval> | undefined;
	let swipeStartX = 0;
	let swipeStartY = 0;

	function prefersReducedMotion() {
		return (
			typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches
		);
	}

	function showSlide(index: number) {
		if (!slides.length) return;
		const nextIndex = (index + slides.length) % slides.length;
		if (nextIndex === currentIndex) return;

		previousIndex = currentIndex;
		currentIndex = nextIndex;
	}

	function nextSlide() {
		showSlide(currentIndex + 1);
	}

	function previousSlide() {
		showSlide(currentIndex - 1);
	}

	function stopAutoplay() {
		if (autoplayId) {
			clearInterval(autoplayId);
			autoplayId = undefined;
		}
	}

	function startAutoplay() {
		stopAutoplay();
		if (slides.length <= 1 || autoplayMs <= 0 || prefersReducedMotion()) return;
		autoplayId = setInterval(nextSlide, autoplayMs);
	}

	function handlePointerDown(event: PointerEvent) {
		swipeStartX = event.clientX;
		swipeStartY = event.clientY;
	}

	function handlePointerUp(event: PointerEvent) {
		const deltaX = event.clientX - swipeStartX;
		const deltaY = event.clientY - swipeStartY;

		if (Math.abs(deltaX) < 48 || Math.abs(deltaX) <= Math.abs(deltaY)) return;

		if (deltaX < 0) {
			nextSlide();
		} else {
			previousSlide();
		}

		startAutoplay();
	}

	// Incoming slides rise from below while the outgoing slide exits upward, so
	// the two halves of the crossfade read as one directional motion.
	function slideTransform(index: number) {
		if (index === currentIndex) return 'translateY(0) scale(1)';
		if (index === previousIndex) return 'translateY(-1rem) scale(0.98)';
		return 'translateY(1rem) scale(0.98)';
	}

	onMount(() => {
		startAutoplay();
		return stopAutoplay;
	});
</script>

{#if slides.length}
	<div
		class="grid w-full gap-6 sm:gap-8"
		role="group"
		aria-label={t('aria.carousel-group')}
		onpointerdown={handlePointerDown}
		onpointerup={handlePointerUp}
		onpointercancel={startAutoplay}
		onpointerleave={startAutoplay}
		onmouseenter={stopAutoplay}
		onmouseleave={startAutoplay}
	>
		<!-- Every slide shares one grid cell, so the track sizes to the tallest
		     slide and the layout no longer shifts between slides. -->
		<div class="grid lg:min-h-136">
			{#each slides as slide, index (index)}
				{@const isActive = index === currentIndex}
				<div
					class="col-start-1 row-start-1 grid grid-rows-[minmax(20rem,auto)_20rem] gap-6 transition-[opacity,transform] duration-500 ease-out motion-reduce:transition-none sm:grid-rows-[minmax(22rem,auto)_26rem] sm:gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:grid-rows-1 lg:items-stretch lg:gap-10"
					class:pointer-events-none={!isActive}
					style:opacity={isActive ? 1 : 0}
					style:transform={slideTransform(index)}
					inert={!isActive}
				>
					<div class="content-col flex flex-col justify-center gap-8 py-2 sm:py-4 lg:py-8">
						<div class="space-y-4">
							<h2
								class="text-3xl font-bold tracking-tight text-brand-black sm:text-4xl lg:text-5xl"
							>
								{slide.title[locale.value]}
							</h2>
							<p class="text-3xl font-bold tracking-tight text-brand-blue sm:text-4xl lg:text-5xl">
								{slide.tagline[locale.value]}
							</p>
							<p class="max-w-lg text-base leading-8 text-black/70 sm:text-lg">
								{slide.description[locale.value]}
							</p>
						</div>

						<div class="flex flex-wrap items-center gap-4">
							<ContactButton text={t('cta.contact-now')} message={t('waMsg.general')} />
						</div>
					</div>

					<div class="image-col relative flex h-full min-h-64 items-center justify-center">
						<div
							class="absolute aspect-square h-[78%] rounded-4xl bg-brand-orange sm:rounded-[3rem]"
							aria-hidden="true"
						></div>
						<img
							src={slide.image}
							alt={slide.title[locale.value]}
							class="relative z-10 h-[72%] max-w-full -translate-x-4 object-contain drop-shadow-2xl sm:-translate-x-6"
							draggable="false"
						/>
					</div>
				</div>
			{/each}
		</div>

		<div class="flex items-center justify-center gap-2" aria-label={t('aria.carousel-indicators')}>
			{#each slides as slide, index (index)}
				<button
					type="button"
					class={`h-3 w-3 rounded-full transition-all ${index === currentIndex ? 'scale-110 bg-brand-blue' : 'bg-black/15 hover:bg-black/30'}`}
					aria-label={`${t('aria.go-to')} ${slide.title[locale.value]}`}
					aria-pressed={index === currentIndex}
					onclick={() => {
						showSlide(index);
						startAutoplay();
					}}
				></button>
			{/each}
		</div>
	</div>
{/if}
