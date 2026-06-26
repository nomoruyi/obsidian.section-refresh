import { App, PluginSettingTab, Setting } from "obsidian";
import type SectionRefreshPlugin from "../main";

export interface SectionRefreshSettings {
	markerToken: string;
}

export const DEFAULT_SETTINGS: SectionRefreshSettings = {
	markerToken: "reset",
};

export class SectionRefreshSettingTab extends PluginSettingTab {
	constructor(
		app: App,
		private readonly plugin: SectionRefreshPlugin,
	) {
		super(app, plugin);
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		new Setting(containerEl)
			.setName("Marker token")
			.setDesc(
				"Headings containing %%<token>%% get a reset button. Default: reset",
			)
			.addText((text) =>
				text
					.setPlaceholder("reset")
					.setValue(this.plugin.settings.markerToken)
					.onChange(async (value) => {
						this.plugin.settings.markerToken = value.trim() || "reset";
						await this.plugin.saveSettings();
					}),
			);
	}
}
