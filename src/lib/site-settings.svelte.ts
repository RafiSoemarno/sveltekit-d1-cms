import { getContext, setContext } from 'svelte';
import { DEFAULT_SETTINGS } from '$lib/settings';
import type { SiteSettings } from '$lib/types';

const SETTINGS_KEY = Symbol('brand-settings');

export function setSettingsContext(settings: SiteSettings): void {
	setContext(SETTINGS_KEY, settings);
}

export function getSettings(): SiteSettings {
	return getContext<SiteSettings | undefined>(SETTINGS_KEY) ?? DEFAULT_SETTINGS;
}
