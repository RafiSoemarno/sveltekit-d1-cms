<script lang="ts">
	import { uploadFile } from '$lib/admin/media-client';

	let { onuploaded }: { onuploaded?: () => void } = $props();

	let dragging = $state(false);
	let uploading = $state(false);
	let error = $state('');
	let input = $state<HTMLInputElement>();

	async function upload(files: FileList | File[] | null | undefined) {
		if (!files || files.length === 0) return;
		error = '';
		uploading = true;
		try {
			for (const file of Array.from(files)) {
				await uploadFile(file);
			}
			onuploaded?.();
		} catch (uploadError) {
			error = uploadError instanceof Error ? uploadError.message : 'Upload failed.';
		} finally {
			uploading = false;
			if (input) input.value = '';
		}
	}

	function handleDrop(event: DragEvent) {
		event.preventDefault();
		dragging = false;
		void upload(event.dataTransfer?.files);
	}
</script>

<div class="flex flex-col gap-2">
	<div
		class="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-8 text-center transition {dragging
			? 'border-brand-orange bg-orange-50'
			: 'border-gray-300 bg-white'}"
		role="button"
		tabindex="0"
		onclick={() => input?.click()}
		onkeydown={(event) => {
			if (event.key === 'Enter' || event.key === ' ') input?.click();
		}}
		ondragover={(event) => {
			event.preventDefault();
			dragging = true;
		}}
		ondragleave={() => (dragging = false)}
		ondrop={handleDrop}
	>
		<p class="text-sm font-semibold text-brand-black">
			{uploading ? 'Uploading…' : 'Drop files here or click to upload'}
		</p>
		<p class="text-xs text-gray-500">
			Images are resized to 1600 px and converted to WebP. PDFs up to 20 MB.
		</p>
		<input
			bind:this={input}
			type="file"
			multiple
			accept="image/png,image/jpeg,image/webp,application/pdf"
			class="hidden"
			onchange={(event) => upload(event.currentTarget.files)}
		/>
	</div>
	{#if error}
		<p class="text-xs font-medium text-red-600">{error}</p>
	{/if}
</div>
