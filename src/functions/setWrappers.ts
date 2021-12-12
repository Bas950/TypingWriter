import { ExpectedTypingWriterOptions } from "../types/options";
import getElementText from "./getElementText";

export default function setWrappers(
	target: Element,
	options: ExpectedTypingWriterOptions
): Element {
	const [text, isTextContent] = getElementText(target, true);
	if (!isTextContent) return target;
	const wrapper = document.createElement("span"),
		cursor = document.createElement("span");

	wrapper.className = options.wrapperClassName;
	cursor.className = options.cursorClassName;

	wrapper.innerHTML = text;
	target.innerHTML = "";
	cursor.innerHTML = options.cursor as string;

	target.appendChild(wrapper);
	target.appendChild(cursor);
	return wrapper;
}
