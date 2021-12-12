import { resetDOM } from "./resetDOM.test";
import setElementText from "./setElementText";

describe("setElementText", () => {
	test("Set text to the element text property", () => {
		resetDOM();
		document.body.innerHTML = '<div id="target"></div>';

		setElementText(document.querySelector("#target")!, "TypingWriter");
		expect(document.querySelector("#target")!.textContent).toStrictEqual(
			"TypingWriter"
		);
	});

	test("Set text to the element value property", () => {
		resetDOM();
		document.body.innerHTML = '<input type="text" id="target" value="" />';

		setElementText(document.querySelector("#target")!, "TypingWriter");
		expect(
			document.querySelector<HTMLInputElement>("#target")!.value
		).toStrictEqual("TypingWriter");
	});
});
