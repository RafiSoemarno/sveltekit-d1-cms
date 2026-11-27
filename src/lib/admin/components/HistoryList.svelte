<script lang="ts">
	import { formatDateTime } from '$lib/admin/format';

	type Revision = {
		revisionId: string;
		action: 'save' | 'publish' | 'unpublish' | 'restore' | 'delete';
		status: 'draft' | 'published';
		note: string | null;
		createdAt: string;
	};

	let { revisions }: { revisions: Revision[] } = $props();

	const labels: Record<Revision['action'], string> = {
		save: 'Saved draft',
		publish: 'Published',
		unpublish: 'Unpublished',
		restore: 'Restored',
		delete: 'Deleted'
	};
</script>

{#if revisions.length === 0}
	<p class="text-sm text-gray-500">No revisions yet. Saving a draft creates the first snapshot.</p>
{:else}
	<ol class="divide-y divide-gray-100">
		{#each revisions as revision (revision.revisionId)}
			<li class="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
				<div class="flex flex-col">
					<span class="text-sm font-semibold text-brand-black">
						{labels[revision.action]}
						<span class="ml-1 text-xs font-normal text-gray-400"
							>({revision.status === 'published' ? 'published snapshot' : 'draft snapshot'})</span
						>
					</span>
					<span class="text-xs text-gray-500">
						{formatDateTime(revision.createdAt)}{revision.note ? ` — ${revision.note}` : ''}
					</span>
				</div>
				<form method="POST" action="?/restore">
					<input type="hidden" name="revisionId" value={revision.revisionId} />
					<button
						type="submit"
						class="rounded-full border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50"
					>
						Restore as draft
					</button>
				</form>
			</li>
		{/each}
	</ol>
{/if}
