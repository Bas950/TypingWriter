import addCursorStyles from "../functions/addCursorStyles";
import removeWrappers from "../functions/removeWrappers";
import setWrappers from "../functions/setWrappers";
import {
  Awaitable,
  DebugEvent,
  DeleterFinished,
  DeleterProgress,
  DeleterStart,
  Event,
  ExitEvent,
  TypingWriterEvents,
  WaitEvent,
  WriterFinished,
  WriterProgress,
  WriterStart,
} from "../types/events";
import { DEFAULT_OPTIONS, DeleterRange, ElementOrSelector, ExpectedTypingWriterOptions, Options } from "../types/options";
import Deleter from "./Deleter";
import Writer from "./Writer";

export default class TypingWriter {
	options: ExpectedTypingWriterOptions;
	selectors: Element[] = [];
	writers: Writer[] = [];
	deleters: Deleter[] = [];
	isRunning = false;
	exited = false;
	private paused = false;
	private onEvents: {
		[event: string]: ((event: TypingWriterEvents) => Awaitable<void>)[];
	} = {};
	private onceEvents: {
		[event: string]: ((event: TypingWriterEvents) => Awaitable<void>)[];
	} = {};
	constructor(selectors: ElementOrSelector, options?: Options) {
		this.options = { ...DEFAULT_OPTIONS, ...options };

		if (typeof selectors === "string")
			this.selectors = [...document.querySelectorAll(selectors)];
		else if (selectors instanceof Element) this.selectors = [selectors];
		else this.selectors = [...selectors];

		if (this.options.cursor) {
			if (this.options.cursorStyles) addCursorStyles();
			for (let i = 0; i < this.selectors.length; i++)
				this.selectors[i] = setWrappers(this.selectors[i], this.options);
		}

		if (this.options.autoStart) this.write();
	}

	async write(text?: string): Promise<this> {
		if (this.exited)
			throw new Error("Write was run while TypingWriter process was exited...");
		if (this.isRunning) {
			this.emit("tw.DEBUG", {
				location: "WRITE",
				message: "Write was run while already running..."
			});
			return this;
		}
		this.isRunning = true;
		const promisePool = [];
		for (const selector of this.selectors) {
			const writer = new Writer(selector, {
				append: this.options.append,
				interval: this.options.typingInterval,
				text
			});
			this.writers.push(writer);
			writer.once("START", (event) => {
				this.emit("tw.WRITE_START", event);
			});
			writer.on("PROGRESS", (event) => {
				this.emit("tw.WRITE_PROGRESS", event);
			});
			writer.once("FINISHED", (event) => {
				this.writers = this.writers.filter((w) => w !== writer);
				this.emit("tw.WRITE_END", event);
			});
			promisePool.push(writer.write());
		}
		await Promise.all(promisePool);
		this.isRunning = false;
		return this;
	}

	async delete(range: DeleterRange = "ALL", offset?: number): Promise<this> {
		if (this.exited)
			throw new Error(
				"Delete was run while TypingWriter process was exited..."
			);
		if (this.isRunning) {
			this.emit("tw.DEBUG", {
				location: "DELETE",
				message: "Delete was run while already running..."
			});
			return this;
		}

		this.isRunning = true;
		const promisePool = [];
		for (const selector of this.selectors) {
			const deleter = new Deleter(selector, {
				interval: this.options.deleteInterval,
				warpperClassName: this.options.wrapperClassName,
				range,
				offset
			});
			this.deleters.push(deleter);
			deleter.once("START", (event) => {
				this.emit("tw.DELETE_START", event);
			});
			deleter.on("PROGRESS", (event) => {
				this.emit("tw.DELETE_PROGRESS", event);
			});
			deleter.once("FINISHED", (event) => {
				this.deleters = this.deleters.filter((d) => d !== deleter);
				this.emit("tw.DELETE_END", event);
			});
			promisePool.push(deleter.delete());
		}
		console.log(promisePool);
		await Promise.all(promisePool);
		this.isRunning = false;
		return this;
	}

	pause(cancel = false, setFinalText = false) {
		if (this.exited)
			throw new Error("Pause was run while TypingWriter process was exited...");
		if (this.paused) {
			this.emit("tw.DEBUG", {
				location: "PAUSE",
				message: "Pause was run while process was already paused..."
			});
			return this;
		}

		this.paused = true;

		if (this.isRunning) {
			if (cancel) {
				for (const writer of this.writers) writer.cancel(setFinalText);
				for (const deleter of this.deleters) deleter.cancel(setFinalText);
			} else {
				for (const writer of this.writers) writer.pause();
				for (const deleter of this.deleters) deleter.pause();
			}
		}
		return this;
	}

	continue() {
		if (this.exited)
			throw new Error(
				"Continue was run while TypingWriter process was exited..."
			);
		if (!this.paused) {
			this.emit("tw.DEBUG", {
				location: "CONTINUE",
				message: "Continue was run while process was already running..."
			});
			return this;
		}

		for (const writer of this.writers) writer.continue();
		for (const deleter of this.deleters) deleter.continue();
		this.paused = false;
		return this;
	}

	async wait(ms: number): Promise<this> {
		if (this.exited) return this;
		if (this.paused) {
			this.emit("tw.DEBUG", {
				location: "WAIT",
				message: "Wait was run while process was paused..."
			});
			return this;
		}

		this.emit("tw.WAIT_START", {
			ms
		});
		await new Promise<void>((resolve) => setTimeout(resolve, ms));
		this.emit("tw.WAIT_END", {
			ms
		});

		return this;
	}

	exit(setFinalText = false) {
		if (this.exited) return this;

		this.emit("tw.EXIT", {
			setFinalText
		});

		for (const writer of this.writers) writer.cancel(setFinalText);
		for (const deleter of this.deleters) deleter.cancel(setFinalText);

		for (let i = 0; i < this.selectors.length; i++)
			this.selectors[i] = removeWrappers(this.selectors[i], this.options);

		this.exited = true;
		return this;
	}

	private emit(event: "tw.DEBUG", log: DebugEvent): void;
	private emit(event: "tw.PAUSE", log: ExitEvent): void;
	private emit(event: "tw.CONTINUE", log: ExitEvent): void;
	private emit(event: "tw.EXIT", log: ExitEvent): void;
	private emit(event: "tw.WAIT_START", log: WaitEvent): void;
	private emit(event: "tw.WAIT_END", log: WaitEvent): void;
	private emit(event: "tw.WRITE_START", log: WriterStart): void;
	private emit(event: "tw.WRITE_PROGRESS", log: WriterProgress): void;
	private emit(event: "tw.WRITE_END", log: WriterFinished): void;
	private emit(event: "tw.DELETE_START", log: DeleterStart): void;
	private emit(event: "tw.DELETE_PROGRESS", log: DeleterProgress): void;
	private emit(event: "tw.DELETE_END", log: DeleterFinished): void;
	private emit(event: Event, log: TypingWriterEvents) {
		if (this.onEvents[event])
			for (const callback of this.onEvents[event]) callback(log);

		if (this.onceEvents[event]) {
			for (const callback of this.onceEvents[event]) callback(log);
			delete this.onceEvents[event];
		}
	}

	//@ts-expect-error
	on(event: "tw.DEBUG", callback: (event: DebugEvent) => Awaitable<void>): this;
	on(event: "tw.PAUSE", callback: (event: ExitEvent) => Awaitable<void>): this;
	on(
		event: "tw.CONTINUE",
		callback: (event: ExitEvent) => Awaitable<void>
	): this;
	on(event: "tw.EXIT", callback: (event: ExitEvent) => Awaitable<void>): this;
	on(
		event: "tw.WAIT_START",
		callback: (event: WaitEvent) => Awaitable<void>
	): this;
	on(
		event: "tw.WAIT_END",
		callback: (event: WaitEvent) => Awaitable<void>
	): this;
	on(
		event: "tw.WRITE_START",
		callback: (event: WriterStart) => Awaitable<void>
	): this;
	on(
		event: "tw.WRITE_PROGRESS",
		callback: (event: WriterProgress) => Awaitable<void>
	): this;
	on(
		event: "tw.WRITE_END",
		callback: (event: WriterFinished) => Awaitable<void>
	): this;
	on(
		event: "tw.DELETE_START",
		callback: (event: DeleterStart) => Awaitable<void>
	): this;
	on(
		event: "tw.DELETE_PROGRESS",
		callback: (event: DeleterProgress) => Awaitable<void>
	): this;
	on(
		event: "tw.DELETE_END",
		callback: (event: DeleterFinished) => Awaitable<void>
	): this;
	on(
		event: Event,
		callback: (event: TypingWriterEvents) => Awaitable<void>
	): this {
		if (this.onEvents[event]) this.onEvents[event].push(callback);
		else this.onEvents[event] = [callback];
		return this;
	}

	//@ts-expect-error
	once(
		event: "tw.DEBUG",
		callback: (event: DebugEvent) => Awaitable<void>
	): this;
	once(
		event: "tw.PAUSE",
		callback: (event: ExitEvent) => Awaitable<void>
	): this;
	once(
		event: "tw.CONTINUE",
		callback: (event: ExitEvent) => Awaitable<void>
	): this;
	once(event: "tw.EXIT", callback: (event: ExitEvent) => Awaitable<void>): this;
	once(
		event: "tw.WAIT_START",
		callback: (event: WaitEvent) => Awaitable<void>
	): this;
	once(
		event: "tw.WAIT_END",
		callback: (event: WaitEvent) => Awaitable<void>
	): this;
	once(
		event: "tw.WRITE_START",
		callback: (event: WriterStart) => Awaitable<void>
	): this;
	once(
		event: "tw.WRITE_PROGRESS",
		callback: (event: WriterProgress) => Awaitable<void>
	): this;
	once(
		event: "tw.WRITE_END",
		callback: (event: WriterFinished) => Awaitable<void>
	): this;
	once(
		event: "tw.DELETE_START",
		callback: (event: DeleterStart) => Awaitable<void>
	): this;
	once(
		event: "tw.DELETE_PROGRESS",
		callback: (event: DeleterProgress) => Awaitable<void>
	): this;
	once(
		event: "tw.DELETE_END",
		callback: (event: DeleterFinished) => Awaitable<void>
	): this;
	once(
		event: Event,
		callback: (event: TypingWriterEvents) => Awaitable<void>
	): this {
		if (this.onceEvents[event]) this.onceEvents[event].push(callback);
		else this.onceEvents[event] = [callback];
		return this;
	}
}
