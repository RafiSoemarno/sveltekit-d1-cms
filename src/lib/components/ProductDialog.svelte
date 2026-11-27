<script lang="ts">
	import ProductDetail from '$lib/components/ProductDetail.svelte';
	import { categoryLabel, brandLabel } from '$lib/catalog';
	import { useT, getLocale } from '$lib/i18n/locale.svelte';
	import type { ProductWithSlug } from '$lib/types';

	let {
		product,
		open,
		onclose
	}: {
		product: ProductWithSlug | null;
		open: boolean;
		onclose: () => void;
	} = $props();

	const t = useT();
	const locale = getLocale();

	let dialogEl = $state<HTMLDialogElement>();
	let lastFocused = $state<HTMLElement | null>(null);
	let suppressingClose = $state(false);

	$effect(() => {
		const dialog = dialogEl;
		if (!dialog) return;

		if (open && !dialog.open) {
			lastFocused = document.activeElement as HTMLElement | null;
			dialog.showModal();
		} else if (!open && dialog.open) {
			suppressingClose = true;
			dialog.close();
		}
	});

	$effect(() => {
		if (!open) return;
		const previous = document.body.style.overflow;
		document.body.style.overflow = 'hidden';
		return () => {
			document.body.style.overflow = previous;
		};
	});

	function handleClose() {
		if (suppressingClose) {
			suppressingClose = false;
			return;
		}
		lastFocused?.focus();
		onclose();
	}

	function handleBackdropClick(event: MouseEvent) {
		const dialog = dialogEl;
		if (!dialog) return;
		const rect = dialog.getBoundingClientRect();
		const inside =
			event.clientX >= rect.left &&
			event.clientX <= rect.right &&
			event.clientY >= rect.top &&
			event.clientY <= rect.bottom;
		if (!inside) handleClose();
	}
</script>

<dialog
	bind:this={dialogEl}
	class="m-auto max-h-[90vh] w-[calc(100%-2rem)] max-w-5xl rounded-2xl bg-white p-0 shadow-2xl backdrop:bg-black/60"
	aria-labelledby="product-dialog-title"
	onclose={handleClose}
	onclick={handleBackdropClick}
>
	{#if product}
		<div class="relative flex max-h-[90vh] flex-col">
			<header class="flex shrink-0 items-center gap-4 bg-brand-white px-4 py-3 sm:px-6">
				<button
					type="button"
					onclick={handleClose}
					aria-label={t('dialog.close')}
					class="inline-flex shrink-0 items-center gap-1 rounded bg-brand-blue px-3 py-1.5 text-xs font-medium text-white transition hover:bg-brand-blue/90"
				>
					<svg
						class="h-3.5 w-3.5"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						stroke-width="2"
						aria-hidden="true"
					>
						<path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
					</svg>
					{t('dialog.back')}
				</button>
				<nav
					class="min-w-0 truncate text-xs text-gray-400"
					aria-label={t('detail.breadcrumb-products')}
				>
					<span>{t('detail.breadcrumb-products')}</span>
					<span class="mx-1">/</span>
					<span>{categoryLabel(product.category)[locale.value]}</span>
					<span class="mx-1">/</span>
					<span>{brandLabel(product.brand)[locale.value]}</span>
					<span class="mx-1">/</span>
					<span>{product.name}</span>
				</nav>
			</header>
			<div class="min-h-0 flex-1 overflow-y-auto px-5 py-7 sm:px-10 sm:py-9">
				<ProductDetail {product} layout="dialog" titleId="product-dialog-title" />
			</div>
		</div>
	{/if}
</dialog>
