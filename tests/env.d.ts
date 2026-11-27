/// <reference types="@cloudflare/vitest-plugin/types" />

import type { D1Database, R2Bucket } from '@cloudflare/workers-types';

declare module 'cloudflare:test' {
	interface ProvidedEnv {
		DB: D1Database;
		MEDIA: R2Bucket;
		SCHEMA_SQL: string;
		PREVIEW_SECRET: string;
	}
}

export {};
