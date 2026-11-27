import { env } from 'cloudflare:test';

// D1's exec() runs SQL line by line, so apply one statement at a time instead.
const statements = env.SCHEMA_SQL.replace(/^\s*--.*$/gm, '')
	.split(';')
	.map((statement: string) => statement.trim())
	.filter(Boolean);

for (const statement of statements) {
	await env.DB.prepare(statement).run();
}
