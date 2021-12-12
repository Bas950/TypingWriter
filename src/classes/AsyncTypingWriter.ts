import TypingWriter from "..";
import {
  Awaitable,
  DebugEvent,
  DeleterFinished,
  DeleterProgress,
  DeleterStart,
  Event,
  ExitEvent,
  QueueEnd,
  QueueItem,
  QueueStart,
  TypingWriterEvents,
  WaitEvent,
  WriterFinished,
  WriterProgress,
  WriterStart,
} from "../types/events";
import { AsyncOptions, DeleterRange, ElementOrSelector } from "../types/options";

export default class AsyncTypingWriter {
	queue: QueueItem[] = [];
	private onEvents: {
		[event: string]: ((event: TypingWriterEvents) => Awaitable<void>)[];
	} = {};
	private onceEvents: {
		[event: string]: ((event: TypingWriterEvents) => Awaitable<void>)[];
	} = {};
	private TypingWriter: TypingWriter;
	private queueIndex = 0;
	private queueRunning = false;
	private queueLooping = false;
	private ranEvents = 0;
	constructor(selectors: ElementOrSelector, options?: AsyncOptions) {
		this.TypingWriter = new TypingWriter(selectors, options);

		const { on } = this.TypingWriter;
		on("tw.DEBUG", (e) => this.emit("tw.DEBUG", e));
		on("tw.PAUSE", (e) => this.emit("tw.PAUSE", e));
		on("tw.CONTINUE", (e) => this.emit("tw.CONTINUE", e));
		on("tw.EXIT", (e) => this.emit("tw.EXIT", e));
		on("tw.WAIT_START", (e) => this.emit("tw.WAIT_START", e));
		on("tw.WAIT_END", (e) => this.emit("tw.WAIT_END", e));
		on("tw.WRITE_START", (e) => this.emit("tw.WRITE_START", e));
		on("tw.WRITE_PROGRESS", (e) => this.emit("tw.WRITE_PROGRESS", e));
		on("tw.WRITE_END", (e) => this.emit("tw.WRITE_END", e));
		on("tw.DELETE_START", (e) => this.emit("tw.DELETE_START", e));
		on("tw.DELETE_PROGRESS", (e) => this.emit("tw.DELETE_PROGRESS", e));
		on("tw.DELETE_END", (e) => this.emit("tw.DELETE_END", e));

		this.queueLooping = !!options?.loop;

		if (options?.autoStart) {
			if (options.loop) {
				this.queue.push({
					event: "WRITE",
					args: [undefined]
				});
			}
			this.queueRunning = true;
			this.queueIndex = 1;
			this.emit("tw.QUEUE_START", {
				queuedEvents: 1,
				queue: [
					{
						event: "WRITE",
						args: [undefined]
					}
				]
			});
			this.TypingWriter.once("tw.WRITE_END", () => {
				this.loop();
			});
		} else {
			this.loop();
		}
	}

	write(text?: string): this {
		this.queue.push({
			event: "WRITE",
			args: [text]
		});
		return this;
	}

	pause(cancel = false, setFinalText = false) {
		this.queue.push({
			event: "PAUSE",
			args: [cancel, setFinalText]
		});
		return this;
	}

	continue() {
		this.queue.push({
			event: "CONTINUE",
			args: []
		});
		return this;
	}

	wait(ms: number): this {
		this.queue.push({
			event: "WAIT",
			args: [ms]
		});
		return this;
	}

	delete(range: DeleterRange = "ALL", offset?: number): this {
		this.queue.push({
			event: "DELETE",
			args: [range, offset]
		});
		return this;
	}

	exit(setFinalText = false) {
		this.queue.push({
			event: "EXIT",
			args: [setFinalText]
		});
		return this;
	}

	private async loop(): Promise<void> {
		if (!this.queueRunning && !this.queue.length) {
			setTimeout(() => {
				this.loop();
			}, 100);
			return;
		} else if (!this.queueRunning) {
			this.emit("tw.QUEUE_START", {
				queuedEvents: this.queue.length,
				queue: [...this.queue]
			});
			this.queueRunning = true;
			this.queueIndex = 0;
		}

		if (!this.queue[this.queueIndex]) {
			this.emit("tw.QUEUE_END", {
				finishedEvents: this.ranEvents
			});
			this.queueRunning = false;
			setTimeout(() => {
				this.loop();
			}, 100);
			return;
		}

		const { event, args } = this.queue[this.queueIndex];
		switch (event) {
			case "WRITE": {
				await this.TypingWriter.write(args[0]);
				break;
			}
			case "DELETE": {
				await this.TypingWriter.delete(args[0], args[1]);
				break;
			}
			case "PAUSE": {
				this.TypingWriter.pause(args[0], args[1]);
				break;
			}
			case "CONTINUE": {
				this.TypingWriter.continue();
				break;
			}
			case "WAIT": {
				await this.TypingWriter.wait(args[0]);
				break;
			}
			case "EXIT": {
				this.TypingWriter.exit(args[0]);
				break;
			}
		}

		if (!this.queueLooping) this.queue.shift();
		else this.queueIndex++;
		this.ranEvents++;
		this.loop();
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
	private emit(event: "tw.QUEUE_START", log: QueueStart): void;
	private emit(event: "tw.QUEUE_END", log: QueueEnd): void;
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
