<script lang="ts">
	let {
		name,
		description,
		icon
	}: {
		name: string;
		description: string;
		icon?: string;
	} = $props();
</script>

<article class="flex h-full w-full flex-col rounded-2xl bg-[#E4F5FF] px-8 py-7 text-brand-black">
	<div class="flex flex-col gap-6">
		<div class="flex items-center gap-4">
			<span
				class="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-brand-blue text-brand-white"
			>
				{#if icon}
					<img src={icon} alt="" class="h-8 w-8 object-contain" />
				{:else}
					<svg
						class="h-8 w-8"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
					>
						<path d="M6 19V7" />
						<path d="M12 19V5" />
						<path d="M18 19V10" />
						<path d="M4 19h16" />
						<path d="M5 8h2" />
						<path d="M11 10h2" />
						<path d="M17 13h2" />
					</svg>
				{/if}
			</span>
			<h3 class="text-xl leading-tight font-bold text-brand-blue">{name}</h3>
		</div>

		<p class="text-md leading-relaxed text-black/85">{description}</p>
	</div>
</article>
