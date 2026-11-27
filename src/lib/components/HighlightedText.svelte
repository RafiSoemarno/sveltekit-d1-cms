<script lang="ts">
	import { parseHighlights } from '$lib/i18n/highlight';

	let {
		text,
		highlightClass = 'text-brand-orange'
	}: {
		text: string;
		highlightClass?: string;
	} = $props();

	const segments = $derived(parseHighlights(text));
</script>

{#each segments as seg, i (i)}
	{#if seg.highlight}
		<span class={highlightClass}>{seg.plain}</span>
	{:else}
		{seg.plain}
	{/if}
{/each}
