// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			preview: boolean;
			adminEmail?: string;
			locale: 'en' | 'id';
		}
		interface PageData {
			preview?: boolean;
		}
		interface PageState {
			selected?: {
				product: import('$lib/types').ProductWithSlug;
				slug: string;
			};
		}
		interface Platform {
			env: {
				DB: import('@cloudflare/workers-types').D1Database;
				MEDIA: import('@cloudflare/workers-types').R2Bucket;
				PREVIEW_SECRET?: string;
				DEV_AUTH_EMAIL?: string;
			};
		}
	}
}

export {};
