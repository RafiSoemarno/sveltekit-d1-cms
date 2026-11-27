-- Optional local seed. Copy to `db/seed.local.sql` (gitignored), then run
-- `npm run db:seed:local`.
--
-- Every value here is fictional demo content. Production content lives in D1
-- and is edited through /admin; keep real content out of the repository.

INSERT OR IGNORE INTO site_settings (id, data) VALUES (
	'site',
	'{"contact":{"phone":"000 0000000","whatsapp":"620000000000","email":"hello@example.com","address":"1 Example Street, Example City"},"seo":{"title":{"en":"Acme","id":"Acme"},"description":{"en":"A demo content site built with SvelteKit, Cloudflare D1, and R2.","id":"Situs konten demo yang dibangun dengan SvelteKit, Cloudflare D1, dan R2."},"image":""}}'
);

INSERT OR REPLACE INTO content_items (collection, id, status, sort_order, data, published_at) VALUES
	('slides', 'welcome', 'published', 0, '{"image":"/demo/slide.svg","title":{"en":"Welcome to Acme","id":"Selamat datang di Acme"},"tagline":{"en":"A content-managed demo","id":"Demo yang dikelola konten"},"description":{"en":"Edit this slide from the admin, or replace it with your own content.","id":"Edit slide ini dari admin, atau ganti dengan konten Anda sendiri."}}', datetime('now')),
	('slides', 'stack', 'published', 1, '{"image":"/demo/slide.svg","title":{"en":"SvelteKit, D1, and R2","id":"SvelteKit, D1, dan R2"},"tagline":{"en":"Server-rendered and portable","id":"Dirender di server dan portabel"},"description":{"en":"Content is stored in D1 and media is streamed from R2.","id":"Konten disimpan di D1 dan media dialirkan dari R2."}}', datetime('now')),

	('products', 'starter-kit', 'published', 0, '{"name":"Acme Starter Kit","brand":"acme","category":"hardware","image":"/demo/product.svg","shortDescription":{"en":"A fictional product used to demonstrate the catalog.","id":"Produk fiktif untuk mendemonstrasikan katalog."},"longDescription":{"en":"This entry shows the product shape: descriptions, features, brochures, gallery, and per-product SEO. Replace it from the admin.","id":"Entri ini menunjukkan bentuk produk: deskripsi, fitur, brosur, galeri, dan SEO per produk. Ganti dari admin."},"features":[{"en":"Editable from the admin","id":"Dapat diedit dari admin"},{"en":"Bilingual fields","id":"Bidang dua bahasa"}]}', datetime('now')),
	('products', 'toolkit', 'published', 1, '{"name":"Globex Toolkit","brand":"globex","category":"software","image":"/demo/product.svg","shortDescription":{"en":"A second fictional product.","id":"Produk fiktif kedua."},"longDescription":{"en":"Products are ordered by category and name, and each one gets a permanent slug after publishing.","id":"Produk diurutkan berdasarkan kategori dan nama, dan masing-masing mendapatkan slug permanen setelah dipublikasikan."},"features":[{"en":"Category and brand filters","id":"Filter kategori dan merek"}]}', datetime('now')),

	('solutions', 'teams', 'published', 0, '{"image":"/demo/slide.svg","title":{"en":"For growing teams","id":"Untuk tim yang berkembang"},"description":{"en":"A solutions entry with an image, title, and description.","id":"Entri solusi dengan gambar, judul, dan deskripsi."},"icon":"/demo/icon.svg"}', datetime('now')),
	('solutions', 'scale', 'published', 1, '{"image":"/demo/slide.svg","title":{"en":"For established teams","id":"Untuk tim mapan"},"description":{"en":"Order and edit solutions from the homepage collection.","id":"Urutkan dan edit solusi dari koleksi beranda."},"icon":"/demo/icon.svg"}', datetime('now')),

	('services', 'implementation', 'published', 0, '{"name":{"en":"Implementation","id":"Implementasi"},"description":{"en":"A fictional service entry.","id":"Entri layanan fiktif."},"icon":"/demo/icon.svg"}', datetime('now')),
	('services', 'support', 'published', 1, '{"name":{"en":"Support","id":"Dukungan"},"description":{"en":"Services are content-managed like every other collection.","id":"Layanan dikelola sebagai konten seperti koleksi lainnya."},"icon":"/demo/icon.svg"}', datetime('now')),

	('stats', 'projects', 'published', 0, '{"value":"12","label":{"en":"Projects","id":"Proyek"},"icon":"/demo/icon.svg"}', datetime('now')),
	('stats', 'languages', 'published', 1, '{"value":"2","label":{"en":"Languages","id":"Bahasa"},"icon":"/demo/icon.svg"}', datetime('now')),

	('testimonies', 'example', 'published', 0, '{"paragraph":{"en":"A fictional testimonial. Replace it with a real one, or delete it to hide the section.","id":"Testimoni fiktif. Ganti dengan yang asli, atau hapus untuk menyembunyikan bagian ini."},"name":"Alex Example","company":"Example Co.","location":{"en":"Remote","id":"Jarak jauh"}}', datetime('now')),

	('partners', 'partner-one', 'published', 0, '{"name":"Partner One","logo":"/demo/partner.svg","row":1}', datetime('now')),
	('partners', 'partner-two', 'published', 1, '{"name":"Partner Two","logo":"/demo/partner.svg","row":1}', datetime('now'));
