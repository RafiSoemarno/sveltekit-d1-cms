<script lang="ts">
	let {
		value,
		label,
		icon
	}: {
		value: string | number;
		label: string;
		icon?: string;
	} = $props();
</script>

<div
	class="relative flex w-full min-w-0 flex-col rounded-xl bg-brand-orange px-6 py-5 text-brand-white shadow-md shadow-black/10"
>
	<div class="flex flex-col">
		<span class="text-6xl leading-none font-bold tracking-tight">{value}</span>
		<span class="mt-3 max-w-[15ch] text-xl leading-tight font-semibold text-white/95">{label}</span>
	</div>

	{#if icon}
		<img
			src={icon}
			alt=""
			class="pointer-events-none absolute right-0 bottom-0 h-28 w-28 object-contain"
			aria-hidden="true"
		/>
	{:else}
		<svg
			class="pointer-events-none absolute right-2 bottom-1 h-14 w-14 text-white/35"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="1.8"
			aria-hidden="true"
		>
			<rect x="6" y="8" width="12" height="10" rx="2" />
			<path d="M9 8V6a3 3 0 0 1 6 0v2" />
			<circle cx="12" cy="13" r="1.4" fill="currentColor" stroke="none" />
		</svg>
	{/if}
</div>
