<script lang="ts">
	let {
		title,
		body,
		actionHref,
		actionLabel
	}: {
		title: string;
		body: string;
		actionHref?: string;
		actionLabel?: string;
	} = $props();
</script>

<div
	class="flex flex-col items-center gap-3 rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center"
>
	<div
		class="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-xl text-gray-400"
	>
		+
	</div>
	<h2 class="text-lg font-semibold text-brand-black">{title}</h2>
	<p class="max-w-md text-sm text-gray-500">{body}</p>
	{#if actionHref && actionLabel}
		<a
			href={actionHref}
			class="mt-2 rounded-full bg-brand-orange px-5 py-2 text-sm font-semibold text-white transition hover:brightness-105"
		>
			{actionLabel}
		</a>
	{/if}
</div>
