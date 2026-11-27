export type Localized = { en: string; id: string };

export type CarouselSlide = {
	image: string;
	title: Localized;
	tagline: Localized;
	description: Localized;
};

export type Solution = {
	image: string;
	title: Localized;
	description: Localized;
	icon: string;
};

export type Service = {
	name: Localized;
	description: Localized;
	icon: string;
};

export type Stat = {
	value: string;
	label: Localized;
	icon: string;
};

export type Testimony = {
	paragraph: Localized;
	name: string;
	company: string;
	location: Localized;
	profileImage?: string;
	linkedinHandle?: string;
	linkedinUrl?: string;
};

export type Partner = {
	name: string;
	logo: string;
	row: 1 | 2;
};

export type ProductBrochure = {
	url: string;
	label?: string;
};

export type ProductSeo = {
	title?: Localized;
	description?: Localized;
};

export type Product = {
	name: string;
	brand: string;
	category: string;
	image: string;
	gallery?: string[];
	shortDescription: Localized;
	longDescription: Localized;
	features: Localized[];
	brochures?: ProductBrochure[];
	seo?: ProductSeo;
};

export type ProductWithSlug = Product & { slug: string };

export type SiteSettings = {
	contact: {
		phone: string;
		whatsapp: string;
		email: string;
		address: string;
	};
	seo: {
		title: Localized;
		description: Localized;
		image: string;
	};
};

export type ContentStatus = 'published' | 'draft' | 'published-draft';

export type MediaAsset = {
	key: string;
	url: string;
	filename: string;
	size: number;
	uploadedAt: string;
	contentType: string;
	width?: number;
	height?: number;
};

export type AdminItem = {
	collection: CollectionName;
	id: string;
	data: Record<string, unknown>;
	status: ContentStatus;
	updatedAt: string;
	publishedAt: string | null;
	createdAt: string;
};

export type CollectionName =
	| 'slides'
	| 'products'
	| 'solutions'
	| 'services'
	| 'stats'
	| 'testimonies'
	| 'partners';

export type HomepageSection = Exclude<CollectionName, 'products'>;
