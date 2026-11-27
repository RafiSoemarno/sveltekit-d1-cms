<script lang="ts">
	import Button from './Button.svelte';
	import { waUrl } from '$lib/constants';
	import { trackConversion } from '$lib/analytics';
	import { getSettings } from '$lib/site-settings.svelte';

	let {
		text,
		message,
		size = 'lg',
		class: className = ''
	}: {
		text: string;
		message?: string;
		size?: 'sm' | 'md' | 'lg';
		class?: string;
	} = $props();

	const settings = getSettings();
	const iconSize = $derived(size === 'sm' ? 'h-4 w-4' : 'h-5 w-5');
	const href = $derived(
		settings.contact.whatsapp ? waUrl(settings.contact.whatsapp, message) : undefined
	);
</script>

{#if href}
	<Button
		{text}
		{href}
		target="_blank"
		rel="noreferrer"
		variant="green"
		{size}
		class={className}
		onclick={() => trackConversion()}
	>
		<img src="/icons/whatsapp.png" alt="" class="{iconSize} shrink-0 brightness-0 invert" />
	</Button>
{/if}
