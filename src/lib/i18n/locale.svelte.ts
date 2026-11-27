import { getContext, setContext } from 'svelte';
import { translate, type UiKey } from './ui';
import type { Locale } from './locale';

export type LocaleState = { value: Locale };

const LOCALE_KEY = Symbol('brand-locale');

export function setLocaleContext(state: LocaleState): void {
	setContext(LOCALE_KEY, state);
}

export function getLocale(): LocaleState {
	const state = getContext<LocaleState | undefined>(LOCALE_KEY);
	if (!state) throw new Error('Locale context is missing');
	return state;
}

export function useT(): (key: UiKey) => string {
	const locale = getLocale();
	return (key: UiKey) => translate(key, locale.value);
}
