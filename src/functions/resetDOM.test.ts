import AsyncTypingWriter from "../classes/AsyncTypingWriter";
import TypingWriter from "../classes/TypingWriter";
import { TypingWriterWindow } from "../types/window";

test("resetDOM", () => {
	expect("resetDOM").toBeTruthy();
});

export function resetDOM() {
	(window as TypingWriterWindow).TypingWriter = {
		TypingWriter: TypingWriter,
		AsyncTypingWriter: AsyncTypingWriter,
		stylesAdded: false
	};
	document.head.innerHTML = "";
	document.body.innerHTML = "";
}
