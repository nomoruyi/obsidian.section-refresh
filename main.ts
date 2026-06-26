import { Editor, MarkdownFileInfo, MarkdownView, Menu, Plugin } from "obsidian";
import {
	DEFAULT_SETTINGS,
	SectionRefreshSettings,
	SectionRefreshSettingTab,
} from "./src/settings";
import { livePreviewExtension } from "./src/livepreview";
import { readingModeProcessor } from "./src/reading";
import { resetSection } from "./src/reset-service";
import { addMarker, headingLevel, isResetHeading, removeMarker } from "./src/core";

export default class SectionRefreshPlugin extends Plugin {
	settings: SectionRefreshSettings = DEFAULT_SETTINGS;

	async onload() {
		await this.loadSettings();
		const getToken = () => this.settings.markerToken;

		this.registerEditorExtension(livePreviewExtension(this.app, getToken));
		this.registerMarkdownPostProcessor(readingModeProcessor(this.app, getToken));
		this.addSettingTab(new SectionRefreshSettingTab(this.app, this));

		this.addCommand({
			id: "reset-section-under-cursor",
			name: "Reset section under cursor",
			editorCallback: (editor: Editor, ctx: MarkdownView | MarkdownFileInfo) => {
				const file = ctx.file;
				if (!file) return;
				const headingLine = this.findHeadingAtCursor(editor);
				if (headingLine === null) return;
				void resetSection(this.app, file, headingLine, getToken());
			},
		});

		this.addCommand({
			id: "toggle-reset-marker",
			name: "Toggle reset marker on heading under cursor",
			editorCallback: (editor: Editor) => {
				const cursor = editor.getCursor();
				const line = editor.getLine(cursor.line);
				if (headingLevel(line) === null) return;
				const token = getToken();
				const updated = isResetHeading(line, token)
					? removeMarker(line, token)
					: addMarker(line, token);
				editor.setLine(cursor.line, updated);
			},
		});

		this.registerEvent(
			this.app.workspace.on("editor-menu", (menu: Menu, editor: Editor) => {
				const cursor = editor.getCursor();
				const line = editor.getLine(cursor.line);
				if (headingLevel(line) === null) return;
				const token = getToken();
				const marked = isResetHeading(line, token);
				menu.addItem((item) =>
					item
						.setTitle(
							marked ? "Remove reset button" : "Add reset button to heading",
						)
						.setIcon("rotate-ccw")
						.onClick(() => {
							const updated = marked
								? removeMarker(line, token)
								: addMarker(line, token);
							editor.setLine(cursor.line, updated);
						}),
				);
			}),
		);
	}

	onunload() {}

	private findHeadingAtCursor(editor: Editor): number | null {
		for (let i = editor.getCursor().line; i >= 0; i--) {
			if (headingLevel(editor.getLine(i)) !== null) return i;
		}
		return null;
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
