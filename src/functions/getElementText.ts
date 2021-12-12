export default function getElementText(target: Element): string;
export default function getElementText(
	target: Element,
	isTextContent: true
): [string, boolean];
export default function getElementText(
	target: Element,
	isTextContent?: boolean
): string | [string, boolean] {
	if (isTextContent)
		return [
			(target as HTMLInputElement).value ?? target.textContent ?? "",
			!(target as HTMLInputElement).value
		];
	else return (target as HTMLInputElement).value ?? target.textContent ?? "";
}
