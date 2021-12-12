import AsyncTypingWriter from "../classes/AsyncTypingWriter";
import TypingWriter from "../classes/TypingWriter";

export interface WindowInterface extends Window {
	TypingWriter: {
		TypingWriter: typeof TypingWriter;
		AsyncTypingWriter: typeof AsyncTypingWriter;
		stylesAdded: boolean;
	};
}

export type TypingWriterWindow = WindowInterface & typeof globalThis;
