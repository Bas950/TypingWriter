export type ElementOrSelector =
	| string
	| Element
	| Element[]
	| NodeListOf<Element>;

export type Interval = "humanized" | number | [number, number];

export interface ExpectedTypingWriterOptions {
	cursor: string | false;
	typingInterval: Interval;
	deleteInterval: Interval;
	autoStart: boolean;
	append: boolean;
	cursorStyles: boolean;
	cursorClassName: string;
	wrapperClassName: string;
}

export type Options = Partial<ExpectedTypingWriterOptions>;

export interface AsyncOptions extends Options {
	loop?: boolean;
}

export const DEFAULT_OPTIONS: ExpectedTypingWriterOptions = {
	cursor: "|",
	typingInterval: "humanized",
	deleteInterval: "humanized",
	autoStart: false,
	append: false,
	cursorStyles: true,
	cursorClassName: "typingwriter__cursor",
	wrapperClassName: "typingwriter__wrapper"
};

export interface ExpectedWriterOptions {
	text: string;
	append: boolean;
	interval: Interval;
}

export interface WriterOptions {
	text?: string;
	append: boolean;
	interval: Interval;
}

export type DeleterRange = "ALL" | number;

export interface DeleterOptions {
	interval: Interval;
	range: DeleterRange;
	warpperClassName: string;
	offset?: number;
}
