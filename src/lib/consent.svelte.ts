export type ConsentState = 'granted' | 'denied' | 'pending';

const LS_KEY = 'brand-consent';

function detectConsent(): ConsentState {
	if (typeof localStorage !== 'undefined') {
		const stored = localStorage.getItem(LS_KEY);
		if (stored === 'granted' || stored === 'denied') return stored;
	}
	return 'pending';
}

let _state = $state<ConsentState>(detectConsent());

export const consent = {
	get state(): ConsentState {
		return _state;
	},
	set state(next: ConsentState) {
		_state = next;
		if (next === 'pending') return;
		if (typeof localStorage !== 'undefined') {
			localStorage.setItem(LS_KEY, next);
		}
	}
};

export function resetConsent() {
	_state = 'pending';
	if (typeof localStorage !== 'undefined') {
		localStorage.removeItem(LS_KEY);
	}
}
