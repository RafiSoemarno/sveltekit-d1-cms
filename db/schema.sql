-- Schema for a local development database.
--
-- Production schema is managed privately. This file is the public, data-free
-- snapshot used by `npm run db:reset:local` and the test suite.
--
-- Keep it in sync with production when the schema changes; do not add content
-- rows here. Seed local content with `db/seed.local.sql` instead.

CREATE TABLE IF NOT EXISTS content_items (
	collection   TEXT NOT NULL,
	id           TEXT NOT NULL,
	status       TEXT NOT NULL DEFAULT 'draft'
	             CHECK (status IN ('draft', 'published')),
	sort_order   INTEGER NOT NULL DEFAULT 0,
	data         TEXT NOT NULL,
	created_at   TEXT NOT NULL DEFAULT (datetime('now')),
	updated_at   TEXT NOT NULL DEFAULT (datetime('now')),
	published_at TEXT,
	PRIMARY KEY (collection, id)
);

CREATE INDEX IF NOT EXISTS content_items_public
	ON content_items(collection, status, sort_order);

CREATE TABLE IF NOT EXISTS content_drafts (
	collection TEXT NOT NULL,
	id         TEXT NOT NULL,
	data       TEXT NOT NULL,
	created_at TEXT NOT NULL DEFAULT (datetime('now')),
	updated_at TEXT NOT NULL DEFAULT (datetime('now')),
	PRIMARY KEY (collection, id)
);

CREATE TABLE IF NOT EXISTS content_revisions (
	revision_id TEXT PRIMARY KEY,
	collection  TEXT NOT NULL,
	item_id     TEXT NOT NULL,
	data        TEXT NOT NULL,
	status      TEXT NOT NULL CHECK (status IN ('draft', 'published')),
	action      TEXT NOT NULL CHECK (action IN ('save', 'publish', 'unpublish', 'restore', 'delete')),
	note        TEXT,
	created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS content_revisions_item
	ON content_revisions(collection, item_id, created_at DESC);

CREATE INDEX IF NOT EXISTS content_revisions_action
	ON content_revisions(collection, action, created_at DESC);

CREATE TABLE IF NOT EXISTS site_settings (
	id         TEXT PRIMARY KEY,
	data       TEXT NOT NULL,
	updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
