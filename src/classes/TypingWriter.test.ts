import TypingWriter from "..";
import { resetDOM } from "../functions/resetDOM.test";
import { DEFAULT_OPTIONS } from "../types/options";
import { TypingWriterWindow } from "../types/window";

describe("TypingWriter", () => {
	describe("init (new TypingWriter())", () => {
		test("Cursor and wrappers", () => {
			resetDOM();
			document.body.innerHTML =
				'<div class="target">TypingWriter1</div>' +
				'<div class="target">TypingWriter2</div>';

			const writer = new TypingWriter(".target");

			expect(
				document
					.querySelector("style")
					?.textContent?.includes(`.${DEFAULT_OPTIONS.cursorClassName}`)
			).toBeTruthy();
			expect(
				(window as TypingWriterWindow).TypingWriter.stylesAdded
			).toBeTruthy();
			expect(writer.selectors.length).toStrictEqual(2);
			expect(
				writer.selectors
					.map((c) => c.className)
					.includes(DEFAULT_OPTIONS.wrapperClassName)
			).toBeTruthy();
		});

		test("Custom cursor", () => {
			resetDOM();
			document.body.innerHTML = '<div id="target">TypingWriter</div>';

			const cursor = "•";
			new TypingWriter("#target", {
				cursor
			});

			expect(
				document.querySelector(`#target .${DEFAULT_OPTIONS.cursorClassName}`)
					?.textContent
			).toStrictEqual(cursor);
		});

		test("No cursor style", () => {
			resetDOM();
			document.body.innerHTML = '<div id="target">TypingWriter</div>';

			new TypingWriter("#target", {
				cursorStyles: false
			});

			expect(document.querySelector("style")).toBeNull();
			expect(
				(window as TypingWriterWindow).TypingWriter.stylesAdded
			).toBeFalsy();
		});

		test("Auto start", () => {
			resetDOM();
			document.body.innerHTML = '<div id="target">TypingWriter</div>';

			const writer = new TypingWriter("#target", {
				autoStart: true
			});

			expect(writer.isRunning).toBeTruthy();
		});
	});

	describe("write()", () => {
		test("Write from element content", () => {
			jest.useFakeTimers();
			resetDOM();
			document.body.innerHTML = '<div id="target">TypingWriter</div>';

			new TypingWriter("#target", {
				cursor: false,
				typingInterval: 1000
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

			new TypingWriter("#target", {
				cursor: false,
				typingInterval: 1000
			}).write("TypingWriter");

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

			new TypingWriter("#target", {
				cursor: false,
				append: true,
				typingInterval: 1000
			}).write("TypingWriter");

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

		test("Write multiple elements", () => {
			jest.useFakeTimers();
			resetDOM();

			document.body.innerHTML =
				'<div id="target1" class="target">TypingWriter</div>' +
				'<input type="text" id="target2" value="타이핑라이터" class="target" />';

			new TypingWriter(".target", {
				cursor: false,
				typingInterval: 1000
			}).write();

			const progress = [
				["T", "ㅌ"],
				["Ty", "타"],
				["Typ", "탕"],
				["Typi", "타이"],
				["Typin", "타잎"],
				["Typing", "타이피"],
				["TypingW", "타이핑"],
				["TypingWr", "타이핑ㄹ"],
				["TypingWri", "타이핑라"],
				["TypingWrit", "타이핑랑"],
				["TypingWrite", "타이핑라이"],
				["TypingWriter", "타이핑라잍"],
				["TypingWriter", "타이핑라이터"]
			];

			for (const p of progress) {
				expect(document.querySelector("#target1")!.textContent).toStrictEqual(
					p[0]
				);
				expect(
					document.querySelector<HTMLInputElement>("#target2")!.value
				).toStrictEqual(p[1]);
				jest.advanceTimersByTime(1000);
			}
		});
	});

	describe("delete()", () => {
		test("delete all text", () => {});

		test("delete text range", () => {});

		test("delete all text after offsetting", () => {});

		test("delete text range after offsetting", () => {});

		test("delete text from multiple elements", () => {});
	});

	describe("pause()", () => {
		test("pause writer", () => {
			jest.useFakeTimers();
			resetDOM();

			document.body.innerHTML = '<div id="target">TypingWriter</div>';

			const writer = new TypingWriter("#target", {
					cursor: false,
					typingInterval: 1000
				}),
				progress = [
					"T",
					"Ty",
					"Typ",
					"Typi",
					"Typin",
					"Typing",
					"Typing",
					"Typing",
					"Typing",
					"Typing",
					"Typing",
					"Typing"
				];

			writer.write();

			for (let i = 0; i < progress.length; i++) {
				const p = progress[i];
				expect(document.querySelector("#target")!.textContent).toStrictEqual(p);
				if (i === 5) writer.pause();
				jest.advanceTimersByTime(1000);
			}

			expect(writer.isRunning).toBeTruthy();
		});

		test("pause writer and fully cancel", async () => {
			jest.useFakeTimers();
			resetDOM();

			document.body.innerHTML = '<div id="target">TypingWriter</div>';

			const writer = new TypingWriter("#target", {
					cursor: false,
					typingInterval: 1000
				}),
				awaiter = writer.write(),
				progress = ["T", "Ty", "Typ", "Typi", "Typin", "Typing"];

			for (let i = 0; i < progress.length; i++) {
				const p = progress[i];
				expect(document.querySelector("#target")!.textContent).toStrictEqual(p);
				if (i === 5) writer.pause(true);
				jest.advanceTimersByTime(1000);
			}

			await awaiter;
			expect(writer.isRunning).toBeFalsy();
		});

		test("pause writer, cancel and set the final text", async () => {
			jest.useFakeTimers();
			resetDOM();

			document.body.innerHTML = '<div id="target">TypingWriter</div>';

			const writer = new TypingWriter("#target", {
					cursor: false,
					typingInterval: 1000
				}),
				awaiter = writer.write(),
				progress = ["T", "Ty", "Typ", "Typi", "Typin", "Typing"];

			for (let i = 0; i < progress.length; i++) {
				const p = progress[i];
				expect(document.querySelector("#target")!.textContent).toStrictEqual(p);
				if (i === 5) writer.pause(true, true);
				jest.advanceTimersByTime(1000);
			}

			await awaiter;
			expect(writer.isRunning).toBeFalsy();
			expect(document.querySelector("#target")!.textContent).toStrictEqual(
				"TypingWriter"
			);
		});

		test("pause deleter", () => {});

		test("pause deleter and fully cancel", async () => {});

		test("pause deleter, cancel and set the final text", async () => {});
	});

	describe("continue()", () => {
		test("continue a paused writer", async () => {
			jest.useFakeTimers();
			resetDOM();

			document.body.innerHTML = '<div id="target">TypingWriter</div>';

			const writer = new TypingWriter("#target", {
					cursor: false,
					typingInterval: 1000
				}),
				awaiter = writer.write(),
				progress = [
					"T",
					"Ty",
					"Typ",
					"Typi",
					"Typin",
					"Typing",
					"Typing",
					"Typing",
					"Typing",
					"Typing",
					"Typing",
					"TypingW",
					"TypingWr",
					"TypingWri",
					"TypingWrit",
					"TypingWrite",
					"TypingWriter"
				];

			for (let i = 0; i < progress.length; i++) {
				const p = progress[i];
				expect(document.querySelector("#target")!.textContent).toStrictEqual(p);
				if (i === 5) writer.pause();
				if (i === 10) writer.continue();

				jest.advanceTimersByTime(1000);
			}

			await awaiter;
			expect(writer.isRunning).toBeFalsy();
		});

		test("continue a paused writer which was paused before too", async () => {
			jest.useFakeTimers();
			resetDOM();

			document.body.innerHTML =
				'<div id="target">TypingWriter 타이핑라이터</div>';

			const writer = new TypingWriter("#target", {
					cursor: false,
					typingInterval: 1000
				}),
				awaiter = writer.write(),
				progress = [
					"T",
					"Ty",
					"Typ",
					"Typi",
					"Typin",
					"Typing",
					"Typing",
					"Typing",
					"Typing",
					"Typing",
					"Typing",
					"TypingW",
					"TypingWr",
					"TypingWri",
					"TypingWrit",
					"TypingWrite",
					"TypingWriter",
					"TypingWriter ",
					"TypingWriter ",
					"TypingWriter ",
					"TypingWriter ",
					"TypingWriter ",
					"TypingWriter ",
					"TypingWriter ㅌ",
					"TypingWriter 타",
					"TypingWriter 탕",
					"TypingWriter 타이",
					"TypingWriter 타잎",
					"TypingWriter 타이피",
					"TypingWriter 타이핑",
					"TypingWriter 타이핑ㄹ",
					"TypingWriter 타이핑라",
					"TypingWriter 타이핑랑",
					"TypingWriter 타이핑라이",
					"TypingWriter 타이핑라잍",
					"TypingWriter 타이핑라이터"
				];

			for (let i = 0; i < progress.length; i++) {
				const p = progress[i];
				expect(document.querySelector("#target")!.textContent).toStrictEqual(p);
				if (i === 5 || i === 17) writer.pause();
				if (i === 10 || i === 22) writer.continue();

				jest.advanceTimersByTime(1000);
			}

			await awaiter;
			expect(writer.isRunning).toBeFalsy();
		});

		test("continue a paused deleter", async () => {});

		test("continue a paused deleter which was paused before too", async () => {});
	});

	describe("wait()", () => {
		test("wait 3000ms", async () => {
			jest.useFakeTimers();
			resetDOM();

			document.body.innerHTML = '<div id="target">TypingWriter</div>';

			const writer = new TypingWriter("#target"),
				awaiter = writer.wait(3000);

			for (let i = 0; i < 3; i++) {
				expect(writer.isRunning).toBeFalsy();
				jest.advanceTimersByTime(1000);
			}

			await awaiter;
			expect(writer.isRunning).toBeFalsy();
		});
	});

	describe("exit()", () => {
		test("exit the writer", async () => {
			jest.useFakeTimers();
			resetDOM();

			document.body.innerHTML = '<div id="target">TypingWriter</div>';

			const writer = new TypingWriter("#target", {
					cursor: false,
					typingInterval: 1000
				}),
				awaiter = writer.write(),
				progress = ["T", "Ty", "Typ", "Typi", "Typin", "Typing"];

			for (let i = 0; i < progress.length; i++) {
				const p = progress[i];
				expect(document.querySelector("#target")!.textContent).toStrictEqual(p);
				if (i === 5) writer.exit();
				jest.advanceTimersByTime(1000);
			}

			await awaiter;
			expect(writer.isRunning).toBeFalsy();
			expect(writer.exited).toBeTruthy();
		});

		test("exit the writer and set final text", async () => {
			jest.useFakeTimers();
			resetDOM();

			document.body.innerHTML = '<div id="target">TypingWriter</div>';

			const writer = new TypingWriter("#target", {
					cursor: false,
					typingInterval: 1000
				}),
				awaiter = writer.write(),
				progress = [
					"T",
					"Ty",
					"Typ",
					"Typi",
					"Typin",
					"Typing",
					"TypingWriter"
				];

			for (let i = 0; i < progress.length; i++) {
				const p = progress[i];
				expect(document.querySelector("#target")!.textContent).toStrictEqual(p);
				if (i === 5) writer.exit(true);
				jest.advanceTimersByTime(1000);
			}

			await awaiter;
			expect(writer.isRunning).toBeFalsy();
			expect(writer.exited).toBeTruthy();
		});
	});

	describe("on()", () => {
		test("tw.WRITE_START", () => {});

		test("tw.WRITE_PROGRESS", () => {});

		test("tw.WRITE_END", () => {});

		test("tw.DELETE_START", () => {});

		test("tw.DELETE_PROGRESS", () => {});

		test("tw.DELETE_END", () => {});

		test("tw.PAUSE", () => {});

		test("tw.CONTINUE", () => {});

		test("tw.WAIT_START", () => {});

		test("tw.WAIT_END", () => {});

		test("tw.EXIT", () => {});

		test("tw.DEBUG", () => {});
	});

	describe("once()", () => {
		test("tw.WRITE_START", () => {});

		test("tw.WRITE_PROGRESS", () => {});

		test("tw.WRITE_END", () => {});

		test("tw.DELETE_START", () => {});

		test("tw.DELETE_PROGRESS", () => {});

		test("tw.DELETE_END", () => {});

		test("tw.PAUSE", () => {});

		test("tw.CONTINUE", () => {});

		test("tw.WAIT_START", () => {});

		test("tw.WAIT_END", () => {});

		test("tw.EXIT", () => {});

		test("tw.DEBUG", () => {});
	});
});
