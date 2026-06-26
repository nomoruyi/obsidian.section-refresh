import { describe, it, expect } from "vitest";
import {
	addMarker,
	headingLevel,
	isResetHeading,
	relocateHeading,
	removeMarker,
	resetCheckboxLine,
	resetCheckboxes,
	resolveRange,
} from "../src/core";

describe("headingLevel", () => {
	it("returns the level for ATX headings", () => {
		expect(headingLevel("# Daily")).toBe(1);
		expect(headingLevel("### Start-Up")).toBe(3);
		expect(headingLevel("###### Six")).toBe(6);
	});

	it("returns null for non-headings", () => {
		expect(headingLevel("Daily")).toBeNull();
		expect(headingLevel("- [ ] task")).toBeNull();
		expect(headingLevel("#NoSpace")).toBeNull();
		expect(headingLevel("####### too many")).toBeNull();
	});
});

describe("isResetHeading", () => {
	it("is true for a heading carrying the marker", () => {
		expect(isResetHeading("# Daily %%reset%%", "reset")).toBe(true);
		expect(isResetHeading("### Start-Up %% reset %%", "reset")).toBe(true);
	});

	it("is false for a heading without the marker", () => {
		expect(isResetHeading("# Daily", "reset")).toBe(false);
	});

	it("is false when the marker is on a non-heading line", () => {
		expect(isResetHeading("- [ ] %%reset%%", "reset")).toBe(false);
	});

	it("respects a custom token", () => {
		expect(isResetHeading("# X %%clear%%", "clear")).toBe(true);
		expect(isResetHeading("# X %%clear%%", "reset")).toBe(false);
	});
});

describe("resolveRange", () => {
	const lines = [
		"# Daily %%reset%%", // 0
		"### Start-Up", // 1
		"- [x] a", // 2
		"### Burn-down", // 3
		"- [x] b", // 4
		"# Development", // 5
		"- [x] c", // 6
	];

	it("includes subsections until the next same-or-higher heading", () => {
		expect(resolveRange(lines, 0)).toEqual({ heading: 0, start: 1, end: 5 });
	});

	it("runs to end of file when no following heading", () => {
		expect(resolveRange(lines, 5)).toEqual({ heading: 5, start: 6, end: 7 });
	});

	it("resolves a subheading's own range", () => {
		expect(resolveRange(lines, 1)).toEqual({ heading: 1, start: 2, end: 3 });
	});

	it("throws when the index is not a heading", () => {
		expect(() => resolveRange(lines, 2)).toThrow();
	});
});

describe("resetCheckboxLine", () => {
	it("resets done and other non-blank markers to empty", () => {
		expect(resetCheckboxLine("- [x] a")).toBe("- [ ] a");
		expect(resetCheckboxLine("- [X] a")).toBe("- [ ] a");
		expect(resetCheckboxLine("  * [-] a")).toBe("  * [ ] a");
		expect(resetCheckboxLine("1. [/] a")).toBe("1. [ ] a");
	});

	it("leaves unchecked boxes and non-task lines untouched", () => {
		expect(resetCheckboxLine("- [ ] a")).toBe("- [ ] a");
		expect(resetCheckboxLine("plain text")).toBe("plain text");
		expect(resetCheckboxLine("- item")).toBe("- item");
	});
});

describe("resetCheckboxes", () => {
	it("resets only lines inside the range", () => {
		const lines = ["# H %%reset%%", "- [x] a", "- [x] b", "# Next", "- [x] c"];
		const out = resetCheckboxes(lines, { heading: 0, start: 1, end: 3 });
		expect(out).toEqual([
			"# H %%reset%%",
			"- [ ] a",
			"- [ ] b",
			"# Next",
			"- [x] c",
		]);
	});

	it("does not mutate the input array", () => {
		const lines = ["- [x] a"];
		resetCheckboxes(lines, { heading: -1, start: 0, end: 1 });
		expect(lines).toEqual(["- [x] a"]);
	});
});

describe("addMarker", () => {
	it("appends the marker to a heading", () => {
		expect(addMarker("# Daily", "reset")).toBe("# Daily %%reset%%");
	});

	it("is idempotent on an already-marked heading", () => {
		expect(addMarker("# Daily %%reset%%", "reset")).toBe("# Daily %%reset%%");
	});

	it("ignores non-heading lines", () => {
		expect(addMarker("- [ ] a", "reset")).toBe("- [ ] a");
	});

	it("trims trailing whitespace before appending", () => {
		expect(addMarker("# Daily   ", "reset")).toBe("# Daily %%reset%%");
	});
});

describe("removeMarker", () => {
	it("strips the marker and the space before it", () => {
		expect(removeMarker("# Daily %%reset%%", "reset")).toBe("# Daily");
	});

	it("is a no-op when the marker is absent", () => {
		expect(removeMarker("# Daily", "reset")).toBe("# Daily");
	});
});

describe("relocateHeading", () => {
	const lines = ["# A %%reset%%", "x", "# B %%reset%%"];

	it("returns the hint when it still points at a reset heading", () => {
		expect(relocateHeading(lines, 2, "reset")).toBe(2);
	});

	it("finds the nearest reset heading when the hint is stale", () => {
		expect(relocateHeading(lines, 1, "reset")).toBe(0);
	});

	it("returns null when there is no reset heading", () => {
		expect(relocateHeading(["# A", "b"], 0, "reset")).toBeNull();
	});
});
