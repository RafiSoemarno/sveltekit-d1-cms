<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = {
		text?: string;
		href?: string;
		type?: 'button' | 'submit' | 'reset';
		onclick?: (event: MouseEvent) => void;
		size?: 'sm' | 'md' | 'lg';
		variant?: 'green' | 'orange' | 'outline' | 'ghost';
		target?: string;
		rel?: string;
		class?: string;
		children?: Snippet;
	};

	let {
		text,
		href,
		type = 'button',
		onclick,
		size = 'md',
		variant = 'green',
		target,
		rel,
		class: className = '',
		children
	}: Props = $props();

	const base =
		'inline-flex items-center justify-center gap-2 rounded-full font-semibold shadow-lg shadow-black/20 transition whitespace-nowrap';

	const sizes: Record<'sm' | 'md' | 'lg', string> = {
		sm: 'px-4 py-2 text-sm',
		md: 'px-6 py-3 text-base',
		lg: 'px-8 py-3 text-lg'
	};

	const variants: Record<'green' | 'orange' | 'outline' | 'ghost', string> = {
		green: 'bg-[#25D366] text-white hover:bg-[#22c35f]',
		orange: 'bg-brand-orange text-brand-white hover:bg-brand-orange/90',
		outline: 'border border-brand-blue text-brand-blue hover:bg-brand-blue hover:text-white',
		ghost: 'text-brand-black shadow-none hover:text-brand-orange'
	};
</script>

{#if href}
	<a {href} {target} {rel} {onclick} class="{base} {sizes[size]} {variants[variant]} {className}">
		{@render children?.()}
		{#if text}
			{text}
		{/if}
	</a>
{:else}
	<button {type} {onclick} class="{base} {sizes[size]} {variants[variant]} {className}">
		{@render children?.()}
		{#if text}
			{text}
		{/if}
	</button>
{/if}
