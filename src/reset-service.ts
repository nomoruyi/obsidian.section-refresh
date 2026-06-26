import { App, MarkdownView, TFile } from "obsidian";
import { relocateHeading, resetCheckboxLine, resolveRange } from "./core";

export async function resetSection(
	app: App,
	file: TFile,
	headingLine: number,
	token: string,
): Promise<void> {
	const view = app.workspace.getActiveViewOfType(MarkdownView);
	const useEditor =
		!!view && view.file?.path === file.path && view.getMode() === "source";

	if (useEditor && view) {
		const editor = view.editor;
		const lines = editor.getValue().split("\n");
		const idx = relocateHeading(lines, headingLine, token);
		if (idx === null) return;
		const range = resolveRange(lines, idx);

		const changes = [];
		for (let i = range.start; i < range.end; i++) {
			const reset = resetCheckboxLine(lines[i]);
			if (reset !== lines[i]) {
				changes.push({
					from: { line: i, ch: 0 },
					to: { line: i, ch: lines[i].length },
					text: reset,
				});
			}
		}
		// One transaction = one atomic undo step.
		if (changes.length > 0) editor.transaction({ changes });
		return;
	}

	await app.vault.process(file, (data) => {
		const lines = data.split("\n");
		const idx = relocateHeading(lines, headingLine, token);
		if (idx === null) return data;
		const range = resolveRange(lines, idx);
		const out = lines.slice();
		for (let i = range.start; i < range.end; i++) {
			out[i] = resetCheckboxLine(out[i]);
		}
		return out.join("\n");
	});
}
