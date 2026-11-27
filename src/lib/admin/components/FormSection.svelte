<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		title,
		description,
		open = true,
		children
	}: {
		title: string;
		description?: string;
		open?: boolean;
		children: Snippet;
	} = $props();
</script>

<details class="rounded-xl border border-gray-200 bg-white" {open}>
	<summary class="cursor-pointer list-none px-5 py-4">
		<span class="text-base font-semibold text-brand-black">{title}</span>
		{#if description}
			<span class="mt-1 block text-sm text-gray-500">{description}</span>
		{/if}
	</summary>
	<div class="border-t border-gray-100 px-5 py-5">
		{@render children()}
	</div>
</details>
