export type HighlightSegment = {
	plain: string;
	highlight: boolean;
	start: number;
	end: number;
};

export function parseHighlights(text: string): HighlightSegment[] {
	const segments: HighlightSegment[] = [];
	let pos = 0;
	for (const part of text.split(/(\[\[.*?\]\])/g).filter(Boolean)) {
		const highlight = part.startsWith('[[') && part.endsWith(']]');
		const plain = highlight ? part.slice(2, -2) : part;
		segments.push({ plain, highlight, start: pos, end: pos + plain.length });
		pos += plain.length;
	}
	return segments;
}
