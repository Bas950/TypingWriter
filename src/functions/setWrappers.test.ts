import { DEFAULT_OPTIONS } from "../types/options";
import { resetDOM } from "./resetDOM.test";
import setWrappers from "./setWrappers";

describe("setWrappers", () => {
	test("Set wrappers and get main wrapper return", () => {
		resetDOM();
		document.body.innerHTML = '<div id="target">TypingWriter</div>';

		const wrapper = setWrappers(
			document.querySelector("#target")!,
			DEFAULT_OPTIONS
		);

		expect(document.querySelector("#target")!.children.length).toStrictEqual(2);
		expect(wrapper).toStrictEqual(
			document.querySelector(`.${DEFAULT_OPTIONS.wrapperClassName}`)
		);
		expect(
			document.querySelector(`.${DEFAULT_OPTIONS.cursorClassName}`)
		).toBeDefined();
		expect(wrapper.textContent).toStrictEqual("TypingWriter");
	});

	test("Get target returned because input element cannot have wrappers", () => {
		resetDOM();
		document.body.innerHTML =
			'<input type="text" id="target" value="TypingWriter" />';

		const wrapper = setWrappers(
			document.querySelector("#target")!,
			DEFAULT_OPTIONS
		);

		expect(wrapper).toStrictEqual(document.querySelector("#target"));
		expect(document.querySelector("#target")!.children.length).toStrictEqual(0);
		expect(
			document.querySelector(`.${DEFAULT_OPTIONS.wrapperClassName}`)
		).toBeNull();
		expect(
			document.querySelector(`.${DEFAULT_OPTIONS.cursorClassName}`)
		).toBeNull();
	});
});
