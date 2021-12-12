import { DEFAULT_OPTIONS } from "../types/options";
import removeWrappers from "./removeWrappers";
import { resetDOM } from "./resetDOM.test";

describe("setWrappers", () => {
	test("Remove wrappers and get main target return", () => {
		resetDOM();
		document.body.innerHTML =
			'<div id="target"><span class="typingwriter__wrapper">TypingWriter</span><span class="typingwriter__cursor">|</span></div>';
		const target = removeWrappers(
			document.querySelector(`.${DEFAULT_OPTIONS.wrapperClassName}`)!,
			DEFAULT_OPTIONS
		);

		expect(target.children.length).toStrictEqual(0);
		expect(
			document.querySelector(`.${DEFAULT_OPTIONS.wrapperClassName}`)
		).toBeNull();
		expect(
			document.querySelector(`.${DEFAULT_OPTIONS.cursorClassName}`)
		).toBeNull();
		expect(target.textContent).toStrictEqual("TypingWriter");
	});

	test("Get target returned because input element cannot have wrappers", () => {
		resetDOM();
		document.body.innerHTML =
			'<input type="text" id="target" value="TypingWriter" />';

		const target = removeWrappers(
			document.querySelector("#target")!,
			DEFAULT_OPTIONS
		);

		expect(target).toStrictEqual(document.querySelector("#target"));
		expect(document.querySelector("#target")!.children.length).toStrictEqual(0);
		expect(
			document.querySelector(`.${DEFAULT_OPTIONS.wrapperClassName}`)
		).toBeNull();
		expect(
			document.querySelector(`.${DEFAULT_OPTIONS.cursorClassName}`)
		).toBeNull();
	});
});
