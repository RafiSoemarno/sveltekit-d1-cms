import type { Locale } from './locale';

export const ui = {
	'nav.home': { en: 'Home', id: 'Beranda' },
	'nav.services': { en: 'Services', id: 'Layanan' },
	'nav.products': { en: 'Products', id: 'Produk' },
	'nav.contact-us': { en: 'Contact Us', id: 'Hubungi Kami' },
	'nav.toggle': { en: 'Toggle language', id: 'Ganti bahasa' },
	'nav.lang-en': { en: 'English', id: 'English' },
	'nav.lang-id': { en: 'Bahasa Indonesia', id: 'Bahasa Indonesia' },
	'nav.menu-toggle': { en: 'Toggle navigation menu', id: 'Beralih menu navigasi' },

	'cta.contact-now': { en: 'Contact Us Now!', id: 'Hubungi Kami Sekarang!' },
	'cta.contact-us': { en: 'Contact Us', id: 'Hubungi Kami' },
	'cta.schedule': { en: 'Schedule a Demo', id: 'Jadwalkan Demo' },
	'cta.see-catalog': { en: 'See Complete Catalog', id: 'Lihat Katalog Lengkap' },
	'cta.learn-more': { en: 'Learn More', id: 'Selengkapnya' },
	'cta.inquire-wa': { en: 'Inquire via WhatsApp', id: 'Tanya via WhatsApp' },
	'cta.reset-filters': { en: 'Reset Filters', id: 'Setel Ulang Filter' },
	'cta.back-to-products': { en: 'Back to Products', id: 'Kembali ke Produk' },
	'cta.back-to-home': { en: 'Back to Home', id: 'Kembali ke Beranda' },
	'cta.for-inquiries': { en: 'For any inquiries', id: 'Untuk pertanyaan' },

	'waMsg.interested': { en: "I'm interested in ", id: 'Saya tertarik pada ' },
	'waMsg.schedule': {
		en: "I'd like to schedule a demo.",
		id: 'Saya ingin menjadwalkan demo.'
	},
	'waMsg.general': {
		en: "Hi, I'd like to know more about your products.",
		id: 'Halo, saya ingin tahu lebih lanjut tentang produk Anda.'
	},

	'filter.brand': { en: 'Brand', id: 'Merek' },
	'filter.all': { en: 'All', id: 'Semua' },
	'search.placeholder': { en: 'Search products...', id: 'Cari produk...' },
	'empty.no-match': {
		en: 'No products match your filters.',
		id: 'Tidak ada produk yang cocok dengan filter.'
	},

	'section.about.h2': { en: 'Built for [[Growth]]', id: 'Dibuat untuk [[Pertumbuhan]]' },
	'section.about.body': {
		en: 'We help teams present their products and services with a fast, content-managed site that stays easy to maintain.',
		id: 'Kami membantu tim menampilkan produk dan layanan mereka melalui situs yang cepat dan dikelola konten, sehingga mudah dirawat.'
	},

	'section.solutions.h2': { en: 'Our [[Services]]', id: '[[Layanan]] Kami' },
	'section.solutions.body': {
		en: 'A flexible services section, ordered and edited entirely from the admin.',
		id: 'Bagian layanan yang fleksibel, diurutkan dan diedit sepenuhnya dari admin.'
	},
	'section.products.h2': { en: 'Our [[Products]]', id: '[[Produk]] Kami' },
	'section.products.body': {
		en: 'Explore the catalog. Products support categories, brands, galleries, brochures, and per-product SEO.',
		id: 'Jelajahi katalog. Produk mendukung kategori, merek, galeri, brosur, dan SEO per produk.'
	},
	'section.story.h2': { en: 'Our [[Story]]', id: '[[Cerita]] Kami' },
	'section.story.body-1': {
		en: 'This section is a placeholder for your story. Replace it with your own copy, or remove it if your site does not need one.',
		id: 'Bagian ini adalah placeholder untuk cerita Anda. Ganti dengan teks Anda sendiri, atau hapus jika situs Anda tidak memerlukannya.'
	},
	'section.story.body-2': {
		en: 'Every string on this page lives in the translation file, so the same layout supports multiple languages without duplicated markup.',
		id: 'Setiap teks di halaman ini berada di berkas terjemahan, sehingga tata letak yang sama mendukung beberapa bahasa tanpa markup ganda.'
	},
	'section.testimony.h2': { en: 'Their [[Thoughts]]', id: '[[Kata]] Mereka' },
	'section.testimony.body': {
		en: 'Testimonials are content-managed and render only when at least one entry exists.',
		id: 'Testimoni dikelola sebagai konten dan hanya ditampilkan jika ada setidaknya satu entri.'
	},

	'section.partners.banner-pre': { en: 'Trusted by ', id: 'Dipercaya oleh ' },
	'section.partners.banner-post': {
		en: ' teams and organizations.',
		id: ' tim dan organisasi.'
	},

	'alt.story-visual': { en: 'Story visual', id: 'Visual cerita' },
	'aria.carousel-group': { en: 'Featured highlights carousel', id: 'Carousel sorotan utama' },
	'aria.carousel-indicators': { en: 'Carousel indicators', id: 'Indikator carousel' },
	'aria.go-to': { en: 'Go to', id: 'Ke' },
	'aria.show-testimony': { en: 'Show testimony from', id: 'Tampilkan testimoni dari' },
	'aria.testimony-group': {
		en: 'Client testimonials carousel',
		id: 'Carousel testimoni klien'
	},
	'aria.open-linkedin': { en: 'LinkedIn', id: 'LinkedIn' },

	'detail.features-heading': { en: 'Product Features:', id: 'Fitur Produk:' },
	'detail.tab-overview': { en: 'Overview', id: 'Ringkasan' },
	'detail.tab-download': { en: 'Downloads', id: 'Unduhan' },
	'detail.breadcrumb-products': { en: 'Products', id: 'Produk' },
	'dialog.close': { en: 'Close', id: 'Tutup' },
	'dialog.back': { en: 'Back', id: 'Kembali' },

	'error.404-title': { en: 'Page not found', id: 'Halaman tidak ditemukan' },
	'error.product-not-found': { en: 'Product not found', id: 'Produk tidak ditemukan' },

	'footer.explore': { en: 'Explore', id: 'Jelajahi' },
	'footer.any-inquiries': { en: 'Any Inquiries?', id: 'Ada Pertanyaan?' },
	'footer.privacy-policy': { en: 'Privacy Policy', id: 'Kebijakan Privasi' },
	'footer.cookie-settings': { en: 'Cookie Settings', id: 'Pengaturan Cookie' },

	'consent.body': {
		en: 'This site uses cookies from Google Ads to measure advertising and improve marketing. Data is only collected if you accept.',
		id: 'Situs ini menggunakan cookie dari Google Ads untuk mengukur iklan dan meningkatkan pemasaran. Data hanya dikumpulkan jika Anda menyetujui.'
	},
	'consent.accept': { en: 'Accept', id: 'Terima' },
	'consent.reject': { en: 'Reject', id: 'Tolak' },
	'consent.privacy': { en: 'Privacy Policy', id: 'Kebijakan Privasi' },

	'policy.title': { en: 'Privacy Policy', id: 'Kebijakan Privasi' },
	'policy.effective-date': { en: 'Effective date: [DATE]', id: 'Tanggal berlaku: [TANGGAL]' },
	'policy.s1-h': { en: '1. Information We Collect', id: '1. Informasi yang Kami Kumpulkan' },
	'policy.s1-b': {
		en: 'When you browse this website, the Google Ads tag collects basic browsing data (pages visited, device and browser type, and whether you arrived from an advertisement). We do not collect names, email addresses, or other personal data unless you contact us directly via WhatsApp, email, or phone and choose to share it.',
		id: 'Saat Anda menjelajahi situs web ini, tag Google Ads mengumpulkan data penelusuran dasar (halaman yang dikunjungi, jenis perangkat dan peramban, serta apakah Anda datang dari iklan). Kami tidak mengumpulkan nama, alamat email, atau data pribadi lainnya kecuali Anda menghubungi kami secara langsung melalui WhatsApp, email, atau telepon dan memilih untuk membagikannya.'
	},
	'policy.s2-h': {
		en: '2. How We Use Your Information',
		id: '2. Cara Kami Menggunakan Informasi Anda'
	},
	'policy.s2-b': {
		en: 'We use browsing data to measure the effectiveness of our advertising and to improve our website and marketing. Information you share with us directly is used to respond to your inquiries and provide product information and quotes.',
		id: 'Kami menggunakan data penelusuran untuk mengukur efektivitas iklan kami dan untuk meningkatkan situs web serta pemasaran kami. Informasi yang Anda bagikan kepada kami secara langsung digunakan untuk menanggapi pertanyaan Anda dan memberikan informasi produk serta penawaran.'
	},
	'policy.s3-h': { en: '3. Information Sharing', id: '3. Berbagi Informasi' },
	'policy.s3-b-pre': {
		en: 'Google LLC acts as a data processor for the browsing data described above. See ',
		id: 'Google LLC bertindak sebagai pemroses data untuk data penelusuran yang dijelaskan di atas. Lihat '
	},
	'policy.s3-pp': { en: 'Google\u2019s Privacy Policy', id: 'Kebijakan Privasi Google' },
	'policy.s3-and': { en: ' and ', id: ' dan ' },
	'policy.s3-adt': { en: 'Advertising Data Terms', id: 'Ketentuan Data Iklan Google' },
	'policy.s3-b-post': {
		en: '. We do not sell your personal information.',
		id: '. Kami tidak menjual informasi pribadi Anda.'
	},
	'policy.s4-h': { en: '4. Data Security', id: '4. Keamanan Data' },
	'policy.s4-b': {
		en: 'This website is served over HTTPS. Personal data you submit by phone, email, or WhatsApp is protected with reasonable organizational and technical measures.',
		id: 'Situs web ini disajikan melalui HTTPS. Data pribadi yang Anda kirimkan melalui telepon, email, atau WhatsApp dilindungi dengan langkah-langkah organisasi dan teknis yang wajar.'
	},
	'policy.s5-h': { en: '5. Cookies', id: '5. Cookie' },
	'policy.s5-b': {
		en: 'The Google Ads tag sets a cookie (such as _gcl_au) to measure conversions and build remarketing audiences. Cookies are only used after you accept the consent banner. Your consent choice is stored in your browser\u2019s local storage and can be changed at any time by clearing it or contacting us. This website uses no other cookies.',
		id: 'Tag Google Ads menetapkan cookie (seperti _gcl_au) untuk mengukur konversi dan membangun audiens pemasaran ulang. Cookie hanya digunakan setelah Anda menerima banner persetujuan. Pilihan persetujuan Anda disimpan di penyimpanan lokal peramban Anda dan dapat diubah kapan saja dengan menghapusnya atau menghubungi kami. Situs web ini tidak menggunakan cookie lain.'
	},
	'policy.s6-h': { en: '6. Personalized Advertising', id: '6. Iklan yang Dipersonalisasi' },
	'policy.s6-b-pre': {
		en: 'When you consent, Google may use your browsing data to show you personalized ads on Google properties and partner sites. You can opt out at ',
		id: 'Saat Anda menyetujui, Google dapat menggunakan data penelusuran Anda untuk menampilkan iklan yang dipersonalisasi di properti Google dan situs mitra. Anda dapat menolak di '
	},
	'policy.s6-gads': { en: 'Google Ads Settings', id: 'Setelan Iklan Google' },
	'policy.s6-or': { en: ' or through the ', id: ' atau melalui ' },
	'policy.s6-yac': { en: 'YourAdChoices program', id: 'program YourAdChoices' },
	'policy.s7-h': { en: '7. Contact', id: '7. Kontak' },
	'policy.s7-b': {
		en: 'For questions about this policy, contact us at',
		id: 'Untuk pertanyaan tentang kebijakan ini, hubungi kami di'
	},
	'policy.s7-or': { en: 'or', id: 'atau' },

	'page.products.title': { en: 'Products', id: 'Produk' },
	'page.products.description': {
		en: 'Browse the product catalog.',
		id: 'Jelajahi katalog produk.'
	},
	'page.privacy.title': { en: 'Privacy Policy', id: 'Kebijakan Privasi' },
	'page.privacy.description': {
		en: 'How this site collects, uses, and protects your information.',
		id: 'Bagaimana situs ini mengumpulkan, menggunakan, dan melindungi informasi Anda.'
	}
} as const;

export type UiKey = keyof typeof ui;

export function translate(key: UiKey, locale: Locale): string {
	return ui[key][locale];
}
