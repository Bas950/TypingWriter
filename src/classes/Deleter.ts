import EventEmitter from "events";

import getElementText from "../functions/getElementText";
import setElementText from "../functions/setElementText";
import { Awaitable, DeleterFinished, DeleterProgress, DeleterStart, WriterEvent } from "../types/events";
import { DeleterOptions } from "../types/options";

export default interface Deleter {
	on(event: "START", callback: (event: DeleterStart) => Awaitable<void>): this;
	on(
		event: "PROGRESS",
		callback: (event: DeleterProgress) => Awaitable<void>
	): this;
	on(
		event: "FINISHED",
		callback: (event: DeleterFinished) => Awaitable<void>
	): this;
	on(
		event: WriterEvent,
		callback: (
			event: DeleterStart | DeleterProgress | DeleterFinished
		) => Awaitable<void>
	): this;
	once(
		event: "START",
		callback: (event: DeleterStart) => Awaitable<void>
	): this;
	once(
		event: "PROGRESS",
		callback: (event: DeleterProgress) => Awaitable<void>
	): this;
	once(
		event: "FINISHED",
		callback: (event: DeleterFinished) => Awaitable<void>
	): this;
	once(
		event: WriterEvent,
		callback: (
			event: DeleterStart | DeleterProgress | DeleterFinished
		) => Awaitable<void>
	): this;
	emit(event: "START", ...args: DeleterStart[]): boolean;
	emit(event: "PROGRESS", ...args: DeleterProgress[]): boolean;
	emit(event: "FINISHED", ...args: DeleterFinished[]): boolean;
	emit(
		event: WriterEvent,
		...args: (DeleterStart | DeleterProgress | DeleterFinished)[]
	): boolean;
}
export default class Deleter extends EventEmitter {
	finalText: string;
	currentIndex = 0;
	finalIndex: number;
	enabled = true;
	setFinalText = false;
	deleteResolver: (() => void) | null = null;
	paused = false;
	private deleterWrapper: HTMLSpanElement | undefined = undefined;
	private moveCursor = false;
	constructor(public target: Element, public options: DeleterOptions) {
		super();
		const [text, isTextContent] = getElementText(this.target, true);
		this.finalIndex =
			options.range === "ALL"
				? options.offset
					? text.length - options.offset
					: text.length
				: options.range;
		this.finalText =
			options.range === "ALL"
				? options.offset
					? text.substring(0, text.length - options.offset)
					: ""
				: options.offset
				? text.replace(
						text.substring(
							text.length - options.offset - options.range,
							text.length - options.offset
						),
						""
				  )
				: text.substring(0, text.length - options.range);

		if (isTextContent) this.moveCursor = true;
	}

	async delete(): Promise<void> {
		this.emit("START", {
			target: this.target,
			options: this.options
		});
		this.deleteCharacter();
		return new Promise<void>((resolve) => {
			this.deleteResolver = resolve;
		});
	}

	pause() {
		this.paused = true;
	}

	continue() {
		this.paused = false;
	}

	cancel(setFinalText: boolean) {
		this.paused = false;
		this.enabled = false;
		this.setFinalText = setFinalText;
	}

	private async deleteCharacter() {
		if (this.paused) {
			setTimeout(() => this.deleteCharacter(), this.getInterval());
			return;
		}
		if (!this.enabled) {
			this.emit("FINISHED", {
				target: this.target,
				options: this.options,
				cancelled: !this.enabled
			});
			if (this.setFinalText) setElementText(this.target, this.finalText);
			if (this.deleterWrapper) await this.deleteDeleterWrapper(false);
			if (this.deleteResolver) this.deleteResolver();
			return;
		}

		if (this.currentIndex >= this.finalIndex) {
			this.emit("FINISHED", {
				target: this.target,
				options: this.options,
				cancelled: !this.enabled
			});

			if (this.deleterWrapper) await this.deleteDeleterWrapper();

			if (this.deleteResolver) this.deleteResolver();
			return;
		}

		if (this.moveCursor && !this.deleterWrapper) await this.addDeleterWrapper();

		const noOffset = Boolean(!this.options.offset || this.moveCursor),
			text = getElementText(this.target),
			removedChar = text.charAt(
				text.length - 1 - (noOffset ? 0 : this.options.offset!)
			),
			newText = noOffset
				? text.substring(0, text.length - 1)
				: text.slice(0, text.length - 1 - this.options.offset!) +
				  text.slice(text.length - this.options.offset!);

		setElementText(this.target, newText);
		this.currentIndex++;

		this.emit("PROGRESS", {
			target: this.target,
			options: this.options,
			progress: newText,
			character: removedChar
		});

		setTimeout(() => this.deleteCharacter(), this.getInterval());
	}

	private getInterval() {
		switch (this.options.interval) {
			case "humanized":
				return this.getRandomInteger(40, 80);
			default: {
				if (Array.isArray(this.options.interval))
					return this.getRandomInteger(
						this.options.interval[0],
						this.options.interval[1]
					);
				else return this.options.interval;
			}
		}
	}

	private getRandomInteger(min: number, max: number) {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}

	private async addDeleterWrapper() {
		const wrapper = document.createElement("span");

		wrapper.className = this.options.warpperClassName;

		this.deleterWrapper = this.target.parentElement?.appendChild(wrapper);

		for (let i = 0; i < this.options.offset!; i++) {
			const text = getElementText(this.target),
				deleterText = getElementText(this.deleterWrapper!);

			setElementText(this.target, text.substring(0, text.length - 1));
			setElementText(
				this.deleterWrapper!,
				text.charAt(text.length - 1) + deleterText
			);

			await new Promise<void>((resolve) =>
				setTimeout(resolve, this.getInterval())
			);
		}
	}

	private async deleteDeleterWrapper(moveCursor = true) {
		if (moveCursor) {
			const textLength = getElementText(this.deleterWrapper!).length;
			for (let i = 0; i < textLength; i++) {
				const text = getElementText(this.target),
					deleterText = getElementText(this.deleterWrapper!);

				setElementText(this.target, text + deleterText.charAt(0));
				setElementText(this.deleterWrapper!, deleterText.substring(1));

				await new Promise<void>((resolve) =>
					setTimeout(resolve, this.getInterval())
				);
			}
		}

		this.target.parentElement?.removeChild(this.deleterWrapper!);
	}
}
