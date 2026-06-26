import { setIcon } from "obsidian";

export function createRefreshButton(onClick: () => void): HTMLElement {
	const btn = createSpan({ cls: "section-refresh-button" });
	setIcon(btn, "rotate-ccw");
	btn.setAttribute("aria-label", "Reset checkboxes in this section");
	btn.addEventListener("click", (e) => {
		e.preventDefault();
		e.stopPropagation();
		onClick();
	});
	return btn;
}
