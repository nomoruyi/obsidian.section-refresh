import { App, MarkdownPostProcessorContext, TFile } from "obsidian";
import { isResetHeading } from "./core";
import { resetSection } from "./reset-service";
import { createRefreshButton } from "./button";

export function readingModeProcessor(app: App, getToken: () => string) {
	return (el: HTMLElement, ctx: MarkdownPostProcessorContext): void => {
		const headings = el.findAll("h1, h2, h3, h4, h5, h6");
		const token = getToken();
		for (const h of headings) {
			const section = ctx.getSectionInfo(h);
			if (!section) continue;
			const rawLine = section.text.split("\n")[section.lineStart];
			if (!isResetHeading(rawLine, token)) continue;
			const file = app.vault.getAbstractFileByPath(ctx.sourcePath);
			if (!(file instanceof TFile)) continue;
			const lineNo = section.lineStart;
			h.appendChild(
				createRefreshButton(() => {
					void resetSection(app, file, lineNo, token);
				}),
			);
		}
	};
}
