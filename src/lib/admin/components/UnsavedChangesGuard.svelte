<script lang="ts">
	import { beforeNavigate } from '$app/navigation';
	import { onMount } from 'svelte';

	let { dirty }: { dirty: boolean } = $props();

	let allowUnload = false;

	beforeNavigate((navigation) => {
		if (!dirty || allowUnload) return;
		if (!window.confirm('You have unsaved changes. Leave this page?')) {
			navigation.cancel();
		}
	});

	onMount(() => {
		const onSubmit = () => {
			allowUnload = true;
			setTimeout(() => {
				allowUnload = false;
			}, 1000);
		};
		const handler = (event: BeforeUnloadEvent) => {
			if (!dirty || allowUnload) return;
			event.preventDefault();
			event.returnValue = '';
		};
		document.addEventListener('submit', onSubmit, true);
		window.addEventListener('beforeunload', handler);
		return () => {
			document.removeEventListener('submit', onSubmit, true);
			window.removeEventListener('beforeunload', handler);
		};
	});
</script>
