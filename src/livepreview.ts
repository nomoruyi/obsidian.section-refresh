import { App, MarkdownView } from "obsidian";
import { Extension, RangeSetBuilder } from "@codemirror/state";
import {
	Decoration,
	DecorationSet,
	EditorView,
	ViewPlugin,
	ViewUpdate,
	WidgetType,
} from "@codemirror/view";
import { isResetHeading, markerRegex } from "./core";
import { resetSection } from "./reset-service";
import { createRefreshButton } from "./button";

class RefreshWidget extends WidgetType {
	constructor(
		private readonly app: App,
		private readonly line: number,
		private readonly token: string,
	) {
		super();
	}

	eq(other: RefreshWidget): boolean {
		return other.line === this.line && other.token === this.token;
	}

	toDOM(): HTMLElement {
		return createRefreshButton(() => {
			const view = this.app.workspace.getActiveViewOfType(MarkdownView);
			const file = view?.file;
			if (file) void resetSection(this.app, file, this.line, this.token);
		});
	}

	ignoreEvent(): boolean {
		return true;
	}
}

export function livePreviewExtension(
	app: App,
	getToken: () => string,
): Extension {
	return ViewPlugin.fromClass(
		class {
			decorations: DecorationSet;

			constructor(view: EditorView) {
				this.decorations = this.build(view);
			}

			update(u: ViewUpdate) {
				if (u.docChanged || u.viewportChanged || u.selectionSet) {
					this.decorations = this.build(u.view);
				}
			}

			build(view: EditorView): DecorationSet {
				const token = getToken();
				const sel = view.state.selection.main;
				const builder = new RangeSetBuilder<Decoration>();
				for (const { from, to } of view.visibleRanges) {
					let pos = from;
					while (pos <= to) {
						const line = view.state.doc.lineAt(pos);
						if (isResetHeading(line.text, token)) {
							const cursorOnLine = sel.from <= line.to && sel.to >= line.from;
							if (!cursorOnLine) {
								const match = markerRegex(token).exec(line.text);
								if (match) {
									const hasLeadingSpace = match.index > 0 &&
										line.text[match.index - 1] === " ";
									const markerFrom =
										line.from + match.index - (hasLeadingSpace ? 1 : 0);
									builder.add(
										markerFrom,
										line.from + match.index + match[0].length,
										Decoration.replace({}),
									);
								}
							}
							builder.add(
								line.to,
								line.to,
								Decoration.widget({
									widget: new RefreshWidget(app, line.number - 1, token),
									side: 1,
								}),
							);
						}
						pos = line.to + 1;
					}
				}
				return builder.finish();
			}
		},
		{ decorations: (v) => v.decorations },
	);
}
