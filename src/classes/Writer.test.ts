import { resetDOM } from "../functions/resetDOM.test";
import Writer from "./Writer";

describe("Writer", () => {
	test("Write from element content", () => {
		jest.useFakeTimers();
		resetDOM();
		document.body.innerHTML = '<div id="target">TypingWriter</div>';

		new Writer(document.querySelector("#target")!, {
			append: false,
			interval: 1000
		}).write();

		const progress = [
			"T",
			"Ty",
			"Typ",
			"Typi",
			"Typin",
			"Typing",
			"TypingW",
			"TypingWr",
			"TypingWri",
			"TypingWrit",
			"TypingWrite",
			"TypingWriter"
		];

		for (const p of progress) {
			expect(document.querySelector("#target")!.textContent).toStrictEqual(p);
			jest.advanceTimersByTime(1000);
		}
	});

	test("Write from inputted text", () => {
		jest.useFakeTimers();
		resetDOM();
		document.body.innerHTML = '<div id="target"></div>';

		new Writer(document.querySelector("#target")!, {
			append: false,
			interval: 1000,
			text: "TypingWriter"
		}).write();

		const progress = [
			"T",
			"Ty",
			"Typ",
			"Typi",
			"Typin",
			"Typing",
			"TypingW",
			"TypingWr",
			"TypingWri",
			"TypingWrit",
			"TypingWrite",
			"TypingWriter"
		];

		for (const p of progress) {
			expect(document.querySelector("#target")!.textContent).toStrictEqual(p);
			jest.advanceTimersByTime(1000);
		}
	});

	test("Write from inputted text but append it to element content", () => {
		jest.useFakeTimers();
		resetDOM();
		document.body.innerHTML = '<div id="target">Written </div>';

		new Writer(document.querySelector("#target")!, {
			append: true,
			interval: 1000,
			text: "TypingWriter"
		}).write();

		const progress = [
			"Written T",
			"Written Ty",
			"Written Typ",
			"Written Typi",
			"Written Typin",
			"Written Typing",
			"Written TypingW",
			"Written TypingWr",
			"Written TypingWri",
			"Written TypingWrit",
			"Written TypingWrite",
			"Written TypingWriter"
		];

		for (const p of progress) {
			expect(document.querySelector("#target")!.textContent).toStrictEqual(p);
			jest.advanceTimersByTime(1000);
		}
	});
});
