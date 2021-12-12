import { TypingWriterWindow } from "../types/window";

const CURSOR_STYLE = `.typingwriter__cursor{-webkit-animation:Typingwriter-cursor 1s infinite;animation:Typingwriter-cursor 1s infinite;margin-left:1px}@-webkit-keyframes Typingwriter-cursor{0%{opacity:0}50%{opacity:1}100%{opacity:0}}@keyframes Typingwriter-cursor{0%{opacity:0}50%{opacity:1}100%{opacity:0}}`;

export default function addCursorStyles() {
	if (window && !(window as TypingWriterWindow).TypingWriter.stylesAdded) {
		const styleBlock = document.createElement("style");
		styleBlock.appendChild(document.createTextNode(CURSOR_STYLE));
		document.head.appendChild(styleBlock);
		(window as TypingWriterWindow).TypingWriter.stylesAdded = true;
	}
}
