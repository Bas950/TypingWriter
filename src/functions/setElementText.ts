export default function setText(target: Element, text: string) {
	if (["INPUT", "TEXTAREA"].includes(target.nodeName))
		(target as HTMLInputElement).value = text;
	else target.textContent = text;
}
