<script lang="ts">
	import { formatDateTime } from '$lib/admin/format';

	let {
		statusLabel,
		updatedAt,
		note = $bindable(''),
		published,
		hasDraft,
		isNew,
		previewPath,
		canPublish = true
	}: {
		statusLabel: string;
		updatedAt?: string | null;
		note: string;
		published: boolean;
		hasDraft: boolean;
		isNew: boolean;
		previewPath: string;
		canPublish?: boolean;
	} = $props();

	let previewing = $state(false);
	let previewError = $state('');

	async function openPreview() {
		if (isNew) return;
		previewError = '';
		previewing = true;
		try {
			const body = new FormData();
			body.set('redirectTo', previewPath);
			const response = await fetch('/api/admin/preview', {
				method: 'POST',
				body,
				redirect: 'manual'
			});
			if (!response.ok) throw new Error('Could not start preview mode.');
			const separator = previewPath.includes('?') ? '&' : '?';
			window.open(`${previewPath}${separator}preview=${Date.now()}`, '_blank', 'noopener');
		} catch (error) {
			previewError = error instanceof Error ? error.message : 'Could not start preview mode.';
		} finally {
			previewing = false;
		}
	}

	function confirmUnpublish(event: MouseEvent) {
		if (
			!window.confirm(
				'Unpublish this item? It will disappear from the live site immediately and remain as a draft.'
			)
		) {
			event.preventDefault();
		}
	}

	function confirmDelete(event: MouseEvent) {
		if (
			!window.confirm(
				'Permanently delete this item? A published item disappears from the live site immediately. A snapshot is kept under Deleted so you can restore it as a draft.'
			)
		) {
			event.preventDefault();
		}
	}
</script>

<div
	class="sticky bottom-0 z-20 -mx-6 mt-8 border-t border-gray-200 bg-white/95 px-6 py-4 backdrop-blur"
>
	{#if previewError}
		<p class="mb-2 text-xs font-medium text-red-600">{previewError}</p>
	{/if}
	<div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
		<div class="flex flex-col gap-1">
			<span class="text-sm font-semibold text-brand-black">{statusLabel}</span>
			<span class="text-xs text-gray-500">
				{updatedAt ? `Last saved ${formatDateTime(updatedAt)}` : 'Not saved yet'}
				{#if hasDraft && published}· Live content is unchanged until you publish{/if}
			</span>
		</div>

		<div class="flex flex-col gap-2 sm:flex-row sm:items-center">
			<input
				bind:value={note}
				maxlength="200"
				placeholder="Add a note (optional)"
				class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-brand-black outline-none focus:border-brand-orange sm:w-56"
			/>
			<div class="flex flex-wrap items-center gap-2">
				<button
					type="submit"
					formaction="?/save"
					class="rounded-full border border-gray-300 px-4 py-2 text-sm font-semibold text-brand-black transition hover:bg-gray-50"
				>
					Save draft
				</button>
				<button
					type="button"
					onclick={openPreview}
					disabled={isNew || previewing}
					title={isNew ? 'Save the draft before previewing.' : undefined}
					class="rounded-full border border-brand-blue px-4 py-2 text-sm font-semibold text-brand-blue transition hover:bg-brand-blue hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
				>
					{previewing ? 'Opening…' : 'Preview'}
				</button>
				<button
					type="submit"
					formaction="?/publish"
					disabled={isNew || !canPublish}
					title={isNew ? 'Save the draft first, then publish.' : undefined}
					class="rounded-full bg-brand-orange px-4 py-2 text-sm font-semibold text-white transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-40"
				>
					Publish
				</button>
				{#if !isNew}
					<details class="relative">
						<summary
							class="cursor-pointer list-none rounded-full border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50"
						>
							More
						</summary>
						<div
							class="absolute right-0 bottom-12 z-30 flex w-48 flex-col gap-1 rounded-xl border border-gray-200 bg-white p-2 shadow-lg"
						>
							{#if published}
								<button
									type="submit"
									formaction="?/unpublish"
									onclick={confirmUnpublish}
									class="rounded-lg px-3 py-2 text-left text-sm font-semibold text-amber-700 hover:bg-amber-50"
								>
									Unpublish
								</button>
							{/if}
							<button
								type="submit"
								formaction="?/delete"
								onclick={confirmDelete}
								class="rounded-lg px-3 py-2 text-left text-sm font-semibold text-red-600 hover:bg-red-50"
							>
								Delete
							</button>
						</div>
					</details>
				{/if}
			</div>
		</div>
	</div>
</div>
