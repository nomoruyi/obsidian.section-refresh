const HEADING_RE = /^(#{1,6})\s/;
const CHECKBOX_RE = /^(\s*(?:[-*+]|\d+\.)\s+\[)[^ \]](\])/;

export interface SectionRange {
	/** 0-based index of the heading line. */
	heading: number;
	/** 0-based index of the first body line (inclusive). */
	start: number;
	/** 0-based index one past the last body line (exclusive). */
	end: number;
}

export function headingLevel(line: string): number | null {
	const m = HEADING_RE.exec(line);
	return m ? m[1].length : null;
}

export function markerRegex(token: string): RegExp {
	const escaped = token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
	return new RegExp(`%%\\s*${escaped}\\s*%%`);
}

export function isResetHeading(line: string, token: string): boolean {
	return headingLevel(line) !== null && markerRegex(token).test(line);
}

export function resolveRange(lines: string[], headingIdx: number): SectionRange {
	const level = headingLevel(lines[headingIdx]);
	if (level === null) {
		throw new Error(`Line ${headingIdx} is not a heading`);
	}
	let end = lines.length;
	for (let i = headingIdx + 1; i < lines.length; i++) {
		const l = headingLevel(lines[i]);
		if (l !== null && l <= level) {
			end = i;
			break;
		}
	}
	return { heading: headingIdx, start: headingIdx + 1, end };
}

export function resetCheckboxLine(line: string): string {
	return line.replace(CHECKBOX_RE, "$1 $2");
}

export function resetCheckboxes(lines: string[], range: SectionRange): string[] {
	const out = lines.slice();
	for (let i = range.start; i < range.end; i++) {
		out[i] = resetCheckboxLine(out[i]);
	}
	return out;
}

export function addMarker(line: string, token: string): string {
	if (headingLevel(line) === null || isResetHeading(line, token)) {
		return line;
	}
	return `${line.replace(/\s+$/, "")} %%${token}%%`;
}

export function removeMarker(line: string, token: string): string {
	const pattern = new RegExp(`\\s*${markerRegex(token).source}`);
	return line.replace(pattern, "").replace(/\s+$/, "");
}

export function relocateHeading(
	lines: string[],
	hint: number,
	token: string,
): number | null {
	if (hint >= 0 && hint < lines.length && isResetHeading(lines[hint], token)) {
		return hint;
	}
	let best: number | null = null;
	let bestDist = Infinity;
	for (let i = 0; i < lines.length; i++) {
		if (isResetHeading(lines[i], token)) {
			const dist = Math.abs(i - hint);
			if (dist < bestDist) {
				bestDist = dist;
				best = i;
			}
		}
	}
	return best;
}
