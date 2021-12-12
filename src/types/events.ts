import { DeleterOptions, ExpectedWriterOptions } from "./options";

export type Event =
	| "tw.DEBUG"
	| "tw.PAUSE"
	| "tw.CONTINUE"
	| "tw.EXIT"
	| "tw.QUEUE_START"
	| "tw.QUEUE_END"
	| "tw.WRITE_START"
	| "tw.WRITE_PROGRESS"
	| "tw.WRITE_END"
	| "tw.WAIT_START"
	| "tw.WAIT_END"
	| "tw.DELETE_START"
	| "tw.DELETE_PROGRESS"
	| "tw.DELETE_END";

export type WriterEvent = "START" | "PROGRESS" | "FINISHED";

export type Awaitable<T> = T | PromiseLike<T>;

export interface DeleterStart {
	target: Element;
	options: DeleterOptions;
}

export interface DeleterProgress {
	target: Element;
	options: DeleterOptions;
	progress: string;
	character: string;
}

export interface DeleterFinished {
	target: Element;
	options: DeleterOptions;
	cancelled: boolean;
}

export interface WriterStart {
	target: Element;
	options: ExpectedWriterOptions;
}

export interface WriterProgress {
	target: Element;
	options: ExpectedWriterOptions;
	progress: string;
	character: string;
}

export interface WriterFinished {
	target: Element;
	options: ExpectedWriterOptions;
	cancelled: boolean;
}

export interface WaitEvent {
	ms: number;
}

export interface ExitEvent {
	setFinalText: boolean;
}

export interface DebugEvent {
	location: DebugLocation;
	message: string;
}

export interface QueueStart {
	queuedEvents: number;
	queue: QueueItem[];
}

export interface QueueEnd {
	finishedEvents: number;
}

export interface QueueItem {
	event: QueueEvent;
	args: any[];
}

export type QueueEvent =
	| "WRITE"
	| "PAUSE"
	| "CONTINUE"
	| "WAIT"
	| "DELETE"
	| "EXIT";

export type DebugLocation = "WRITE" | "DELETE" | "PAUSE" | "CONTINUE" | "WAIT";

export type TypingWriterEvents =
	| DebugEvent
	| ExitEvent
	| WaitEvent
	| WriterStart
	| WriterProgress
	| WriterFinished
	| DeleterStart
	| DeleterProgress
	| DeleterFinished
	| QueueStart
	| QueueEnd;
