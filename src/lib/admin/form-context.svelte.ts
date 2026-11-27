import { getContext, setContext } from 'svelte';

// Form documents are JSON objects. A single request-scoped state object is shared
// by the editor and its field components so nested edits update one source of truth.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AdminFormState = Record<string, any>;

const FORM_KEY = Symbol('brand-admin-form');

export function setAdminForm(state: AdminFormState): void {
	setContext(FORM_KEY, state);
}

export function getAdminForm(): AdminFormState {
	const state = getContext<AdminFormState | undefined>(FORM_KEY);
	if (!state) throw new Error('Admin form context is missing');
	return state;
}
