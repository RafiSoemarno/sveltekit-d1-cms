<script lang="ts">
	import { onMount } from 'svelte';
	import { useT, getLocale } from '$lib/i18n/locale.svelte';
	import { localePath } from '$lib/i18n/locale';
	import { consent } from '$lib/consent.svelte';
	import { initAnalytics, revokeConsent } from '$lib/analytics';

	const locale = getLocale();
	const t = useT();

	let mounted = $state(false);

	onMount(() => {
		mounted = true;
	});
</script>

{#if mounted && consent.state === 'pending'}
	<div class="fixed inset-x-0 bottom-0 z-[60] p-4 sm:p-6">
		<div
			class="mx-auto flex max-w-3xl flex-col gap-4 rounded-2xl bg-white p-5 shadow-xl ring-1 ring-black/10 sm:flex-row sm:items-center sm:justify-between"
		>
			<p class="text-sm leading-relaxed text-brand-black/80">
				{t('consent.body')}
			</p>
			<div class="flex shrink-0 flex-wrap items-center gap-3">
				<a
					href={localePath('/privacy-policy', locale.value)}
					class="text-sm font-semibold text-brand-orange hover:underline">{t('consent.privacy')}</a
				>
				<button
					type="button"
					onclick={() => {
						consent.state = 'denied';
						revokeConsent();
					}}
					class="rounded-full border border-gray-300 px-4 py-2 text-sm font-semibold text-brand-black transition hover:bg-gray-100"
				>
					{t('consent.reject')}
				</button>
				<button
					type="button"
					onclick={() => {
						consent.state = 'granted';
						initAnalytics();
					}}
					class="rounded-full bg-brand-orange px-4 py-2 text-sm font-semibold text-brand-white transition hover:bg-brand-orange/90"
				>
					{t('consent.accept')}
				</button>
			</div>
		</div>
	</div>
{/if}
