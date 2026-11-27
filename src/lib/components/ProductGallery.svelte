<script lang="ts">
	let { images, name }: { images: string[]; name: string } = $props();

	let active = $state(0);
	const list = $derived(images.filter(Boolean));
	const current = $derived(list[Math.min(active, Math.max(list.length - 1, 0))] ?? '');
</script>

<div class="flex flex-col gap-3">
	<div
		class="flex min-h-64 items-center justify-center rounded-2xl bg-[#eef5fa] p-6 sm:min-h-96 sm:p-10"
	>
		{#if current}
			<img
				src={current}
				alt={list.length > 1 ? `${name} — image ${active + 1}` : name}
				class="max-h-96 w-full max-w-md object-contain"
			/>
		{/if}
	</div>

	{#if list.length > 1}
		<div class="flex gap-2 overflow-x-auto pb-1" aria-label={`${name} images`}>
			{#each list as image, index (image)}
				<button
					type="button"
					onclick={() => (active = index)}
					class="h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 bg-[#eef5fa] p-1 transition {index ===
					active
						? 'border-brand-orange'
						: 'border-transparent hover:border-brand-blue/40'}"
					aria-label={`Show image ${index + 1} of ${name}`}
					aria-pressed={index === active}
				>
					<img src={image} alt="" class="h-full w-full object-contain" loading="lazy" />
				</button>
			{/each}
		</div>
	{/if}
</div>
