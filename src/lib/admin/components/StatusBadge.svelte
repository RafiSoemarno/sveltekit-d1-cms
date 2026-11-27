<script lang="ts">
	import type { ContentStatus } from '$lib/types';

	let { status }: { status: ContentStatus | 'deleted' } = $props();

	const label = $derived(
		status === 'published'
			? 'Published'
			: status === 'draft'
				? 'Draft'
				: status === 'published-draft'
					? 'Published + draft changes'
					: 'Deleted'
	);
	const classes = $derived(
		status === 'published'
			? 'bg-green-50 text-green-700 ring-green-200'
			: status === 'draft'
				? 'bg-amber-50 text-amber-700 ring-amber-200'
				: status === 'published-draft'
					? 'bg-blue-50 text-blue-700 ring-blue-200'
					: 'bg-red-50 text-red-700 ring-red-200'
	);
</script>

<span class="inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset {classes}"
	>{label}</span
>
