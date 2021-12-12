import { ExpectedTypingWriterOptions } from "../types/options";

export default function removeWrappers(
	target: Element,
	options: ExpectedTypingWriterOptions
): Element {
	if (!target.classList.contains(options.wrapperClassName)) return target;
	const newTarget = target.parentElement!;
	newTarget.innerHTML = target.innerHTML;
	return newTarget;
}
