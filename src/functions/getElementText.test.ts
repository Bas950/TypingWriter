import getElementText from "./getElementText";
import { resetDOM } from "./resetDOM.test";

describe("getElementText", () => {
	describe("getElementText(target: Element): string", () => {
		test("Get text from element", () => {
			resetDOM();
			document.body.innerHTML = '<div id="target">TypingWriter</div>';

			expect(getElementText(document.querySelector("#target")!)).toStrictEqual(
				"TypingWriter"
			);
		});

		test("Get text from input element", () => {
			resetDOM();
			document.body.innerHTML =
				'<input type="text" id="target" value="TypingWriter" />';

			expect(getElementText(document.querySelector("#target")!)).toStrictEqual(
				"TypingWriter"
			);
		});
	});

	describe("getElementText(target: Element, isTextContent: true): [string, boolean]", () => {
		test("Get text and if it was textContent or not from element", () => {
			resetDOM();
			document.body.innerHTML = '<div id="target">TypingWriter</div>';

			const [text, isTextContent] = getElementText(
				document.querySelector("#target")!,
				true
			);

			expect(text).toStrictEqual("TypingWriter");
			expect(isTextContent).toStrictEqual(true);
		});

		test("Get text and if it was textContent or not from input element", () => {
			resetDOM();
			document.body.innerHTML =
				'<input type="text" id="target" value="TypingWriter" />';

			const [text, isTextContent] = getElementText(
				document.querySelector("#target")!,
				true
			);

			expect(text).toStrictEqual("TypingWriter");
			expect(isTextContent).toStrictEqual(false);
		});
	});
});
