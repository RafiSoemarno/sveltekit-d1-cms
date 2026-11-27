import { defineConfig } from 'vitest/config';
import { cloudflareTest } from '@cloudflare/vitest-plugin';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const schema = readFileSync(new URL('./db/schema.sql', import.meta.url), 'utf8');

export default defineConfig({
	plugins: [
		cloudflareTest({
			main: './tests/worker.ts',
			miniflare: {
				d1Databases: ['DB'],
				r2Buckets: ['MEDIA'],
				bindings: {
					SCHEMA_SQL: schema,
					PREVIEW_SECRET: 'test-preview-secret'
				}
			}
		})
	],
	resolve: {
		alias: {
			$lib: fileURLToPath(new URL('./src/lib', import.meta.url))
		}
	},
	test: {
		setupFiles: ['./tests/apply-schema.ts'],
		include: ['tests/**/*.test.ts']
	}
});
