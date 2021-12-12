import AsyncTypingWriter from "./classes/AsyncTypingWriter";
import TypingWriter from "./classes/TypingWriter";
import { ElementOrSelector, Interval, Options } from "./types/options";
import { TypingWriterWindow } from "./types/window";

export default TypingWriter;
export { AsyncTypingWriter, ElementOrSelector, Interval, Options };

if (typeof window !== "undefined")
	(window as TypingWriterWindow).TypingWriter = {
		TypingWriter: TypingWriter,
		AsyncTypingWriter: AsyncTypingWriter,
		stylesAdded: false
	};

//TODO move cursor to the left if text is RTL
/* const test = new TypingWriter("d"); */
