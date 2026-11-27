import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

type MediaEntry = {
	key: string;
	contentType: string;
};

const CONTENT_TYPES: Record<string, string> = {
	avif: 'image/avif',
	gif: 'image/gif',
	jpeg: 'image/jpeg',
	jpg: 'image/jpeg',
	json: 'application/json',
	mp4: 'video/mp4',
	pdf: 'application/pdf',
	png: 'image/png',
	svg: 'image/svg+xml',
	webm: 'video/webm',
	webp: 'image/webp'
};

const args = process.argv.slice(2);

function option(name: string): string | undefined {
	const index = args.indexOf(name);
	if (index === -1) return undefined;

	const value = args[index + 1];
	if (!value || value.startsWith('--')) throw new Error(`Missing value for ${name}`);

	return value;
}

const config = option('--config');
const remoteBucket = option('--remote-bucket');
const localBucket = option('--local-bucket') ?? 'media-local';

if (!remoteBucket) {
	throw new Error(
		'Usage: npm run media:pull:local -- --remote-bucket <bucket> [--config <file>] [--local-bucket <bucket>]'
	);
}

const wrangler = process.platform === 'win32' ? 'wrangler.cmd' : 'wrangler';
const configArgs = config ? ['--config', config] : [];
const tempDir = mkdtempSync(join(tmpdir(), 'media-pull-'));

function run(command: string[], capture = false): string {
	const result = spawnSync(wrangler, command, { encoding: 'utf8' });

	if (result.status !== 0) {
		if (result.stderr) process.stderr.write(result.stderr);
		throw new Error(`Failed to run: wrangler ${command.join(' ')}`);
	}

	return capture ? result.stdout : '';
}

// Media is content-addressed and referenced from D1 content documents and site
// settings, so the database is the source of truth for what to pull. This keeps
// the repository free of a manifest that would otherwise drift.
function referencedMedia(): MediaEntry[] {
	const rows = run(
		[
			'd1',
			'execute',
			'DB',
			'--remote',
			'--json',
			'--command',
			'SELECT data FROM content_items UNION ALL SELECT data FROM site_settings',
			...configArgs
		],
		true
	);

	const keys = new Set<string>();
	for (const match of rows.matchAll(/\/media\/([A-Za-z0-9]+\/[A-Za-z0-9._%-]+)/g)) {
		keys.add(match[1]);
	}

	if (keys.size === 0) {
		throw new Error('No /media/ references found in the remote database.');
	}

	return [...keys].sort().map((key) => {
		const extension = key.split('.').pop()?.toLowerCase() ?? '';
		return { key, contentType: CONTENT_TYPES[extension] ?? 'application/octet-stream' };
	});
}

try {
	const media = referencedMedia();

	for (const [index, entry] of media.entries()) {
		const tempFile = join(tempDir, entry.key.replace(/[/%]/g, '-'));

		run([
			'r2',
			'object',
			'get',
			`${remoteBucket}/${entry.key}`,
			'--remote',
			'--file',
			tempFile,
			...configArgs
		]);

		run([
			'r2',
			'object',
			'put',
			`${localBucket}/${entry.key}`,
			'--local',
			'--file',
			tempFile,
			`--content-type=${entry.contentType}`
		]);

		console.log(`[${index + 1}/${media.length}] ${entry.key}`);
	}

	console.log(
		`Pulled ${media.length} referenced media objects from ${remoteBucket} into local bucket ${localBucket}.`
	);
} finally {
	rmSync(tempDir, { recursive: true, force: true });
}
