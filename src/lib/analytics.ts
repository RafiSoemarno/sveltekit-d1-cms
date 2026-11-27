import { browser } from '$app/environment';
import { ADS_TAG_ID, ADS_CONVERSION_SEND_TO, ADS_ENABLED } from './constants';
import { consent } from './consent.svelte';

declare global {
	interface Window {
		dataLayer?: unknown[];
		gtag?: (...args: unknown[]) => void;
	}
}

function consentSignals(state: 'granted' | 'denied') {
	return {
		ad_storage: state,
		ad_user_data: state,
		ad_personalization: state,
		analytics_storage: state
	};
}

const DENIED = consentSignals('denied');

let googleTagLoaded = false;

function stubGtag() {
	if (Array.isArray(window.dataLayer) && typeof window.gtag === 'function') return;
	window.dataLayer = window.dataLayer || [];
	window.gtag = (...args: unknown[]) => {
		window.dataLayer?.push(args);
	};
}

function loadGoogleTag() {
	if (!browser || googleTagLoaded) return;
	stubGtag();
	window.gtag?.('js', new Date());
	window.gtag?.('consent', 'default', {
		...DENIED,
		ads_data_redaction: true,
		url_passthrough: true
	});
	window.gtag?.('config', ADS_TAG_ID, { send_page_view: false });
	const script = document.createElement('script');
	script.async = true;
	script.src = `https://www.googletagmanager.com/gtag/js?id=${ADS_TAG_ID}`;
	script.onload = () => {
		if (consent.state === 'granted') window.gtag?.('consent', 'update', consentSignals('granted'));
	};
	document.head.appendChild(script);
	googleTagLoaded = true;
}

export function initAnalytics() {
	if (!browser || !ADS_ENABLED) return;
	if (consent.state === 'granted') {
		if (googleTagLoaded) {
			window.gtag?.('consent', 'update', consentSignals('granted'));
		} else {
			loadGoogleTag();
		}
	} else if (consent.state === 'denied') {
		window.gtag?.('consent', 'update', DENIED);
	}
}

export function revokeConsent() {
	if (!browser) return;
	stubGtag();
	window.gtag?.('consent', 'update', DENIED);
}

export function sendPageView() {
	if (!browser || !ADS_ENABLED || consent.state !== 'granted') return;
	if (!googleTagLoaded) loadGoogleTag();
	window.gtag?.('config', ADS_TAG_ID, { page_path: window.location.pathname });
}

export function trackConversion() {
	if (!browser || !ADS_ENABLED || consent.state !== 'granted') return;
	stubGtag();
	window.gtag?.('event', 'conversion', { send_to: ADS_CONVERSION_SEND_TO });
}
