import { DEFAULT_OPTIONS } from "../types/options";
import { TypingWriterWindow } from "../types/window";
import addCursorStyles from "./addCursorStyles";
import { resetDOM } from "./resetDOM.test";

describe("addCursorStyles", () => {
	test("Add styles to the DOM", () => {
		resetDOM();

		addCursorStyles();

		expect(
			document
				.querySelector("style")
				?.textContent?.includes(`.${DEFAULT_OPTIONS.cursorClassName}`)
		).toBeTruthy();
		expect(
			(window as TypingWriterWindow).TypingWriter.stylesAdded
		).toBeTruthy();
	});
});
