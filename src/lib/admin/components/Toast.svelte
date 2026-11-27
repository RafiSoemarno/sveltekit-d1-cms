<script lang="ts">
	let { message, tone = 'success' }: { message?: string; tone?: 'success' | 'error' } = $props();
</script>

{#if message}
	<div
		class="fixed right-4 bottom-4 z-[80] max-w-sm rounded-xl px-4 py-3 text-sm font-medium shadow-lg {tone ===
		'success'
			? 'bg-green-600 text-white'
			: 'bg-red-600 text-white'}"
		role="status"
	>
		{message}
	</div>
{/if}
