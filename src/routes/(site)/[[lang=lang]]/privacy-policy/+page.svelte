<script lang="ts">
	import { useT } from '$lib/i18n/locale.svelte';
	import { SITE } from '$lib/brand';
	import { getSettings } from '$lib/site-settings.svelte';
	import Seo from '$lib/components/Seo.svelte';

	const t = useT();
	const settings = getSettings();
</script>

<Seo
	title={`${t('page.privacy.title')} — ${SITE.name}`}
	description={t('page.privacy.description')}
	image={settings.seo.image || '/story-image.png'}
	path="/privacy-policy"
/>

<section class="py-10 sm:py-16">
	<h1 class="text-4xl font-bold text-brand-black sm:text-5xl">{t('policy.title')}</h1>
	<p class="mt-2 text-sm text-gray-500">
		{t('policy.effective-date')}
	</p>

	<div class="mt-8 space-y-8 leading-relaxed text-black/80">
		<section>
			<h2 class="text-2xl font-bold text-brand-black">{t('policy.s1-h')}</h2>
			<p class="mt-3">{t('policy.s1-b')}</p>
		</section>

		<section>
			<h2 class="text-2xl font-bold text-brand-black">{t('policy.s2-h')}</h2>
			<p class="mt-3">{t('policy.s2-b')}</p>
		</section>

		<section>
			<h2 class="text-2xl font-bold text-brand-black">{t('policy.s3-h')}</h2>
			<p class="mt-3">
				{t('policy.s3-b-pre')}
				<a
					href="https://policies.google.com/privacy"
					target="_blank"
					rel="noreferrer"
					class="text-brand-orange hover:underline">{t('policy.s3-pp')}</a
				>
				{t('policy.s3-and')}
				<a
					href="https://business.safety.google/adsprocessorterms/"
					target="_blank"
					rel="noreferrer"
					class="text-brand-orange hover:underline">{t('policy.s3-adt')}</a
				>
				{t('policy.s3-b-post')}
			</p>
		</section>

		<section>
			<h2 class="text-2xl font-bold text-brand-black">{t('policy.s4-h')}</h2>
			<p class="mt-3">{t('policy.s4-b')}</p>
		</section>

		<section>
			<h2 class="text-2xl font-bold text-brand-black">{t('policy.s5-h')}</h2>
			<p class="mt-3">{t('policy.s5-b')}</p>
		</section>

		<section>
			<h2 class="text-2xl font-bold text-brand-black">{t('policy.s6-h')}</h2>
			<p class="mt-3">
				{t('policy.s6-b-pre')}
				<a
					href="https://adssettings.google.com"
					target="_blank"
					rel="noreferrer"
					class="text-brand-orange hover:underline">{t('policy.s6-gads')}</a
				>
				{t('policy.s6-or')}
				<a
					href="https://optout.aboutads.info"
					target="_blank"
					rel="noreferrer"
					class="text-brand-orange hover:underline">{t('policy.s6-yac')}</a
				>.
			</p>
		</section>

		<section>
			<h2 class="text-2xl font-bold text-brand-black">{t('policy.s7-h')}</h2>
			<p class="mt-3">
				{t('policy.s7-b')}
				<a href={`mailto:${settings.contact.email}`} class="text-brand-orange hover:underline"
					>{settings.contact.email}</a
				>
				{t('policy.s7-or')}
				{settings.contact.address}.
			</p>
		</section>
	</div>
</section>
