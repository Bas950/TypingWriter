import EventEmitter from "events";
import { a, d } from "hangul-js";

import getElementText from "../functions/getElementText";
import setText from "../functions/setElementText";
import { Awaitable, WriterEvent, WriterFinished, WriterProgress, WriterStart } from "../types/events";
import { ExpectedWriterOptions, WriterOptions } from "../types/options";

export default interface Writer {
	on(event: "START", callback: (event: WriterStart) => Awaitable<void>): this;
	on(
		event: "PROGRESS",
		callback: (event: WriterProgress) => Awaitable<void>
	): this;
	on(
		event: "FINISHED",
		callback: (event: WriterFinished) => Awaitable<void>
	): this;
	on(
		event: WriterEvent,
		callback: (
			event: WriterStart | WriterProgress | WriterFinished
		) => Awaitable<void>
	): this;
	once(event: "START", callback: (event: WriterStart) => Awaitable<void>): this;
	once(
		event: "PROGRESS",
		callback: (event: WriterProgress) => Awaitable<void>
	): this;
	once(
		event: "FINISHED",
		callback: (event: WriterFinished) => Awaitable<void>
	): this;
	once(
		event: WriterEvent,
		callback: (
			event: WriterStart | WriterProgress | WriterFinished
		) => Awaitable<void>
	): this;
	emit(event: "START", ...args: WriterStart[]): boolean;
	emit(event: "PROGRESS", ...args: WriterProgress[]): boolean;
	emit(event: "FINISHED", ...args: WriterFinished[]): boolean;
	emit(
		event: WriterEvent,
		...args: (WriterStart | WriterProgress | WriterFinished)[]
	): boolean;
}
export default class Writer extends EventEmitter {
	target: Element;
	options: ExpectedWriterOptions;
	textProcess: string[][];
	lastText: string;
	progress: string;
	finalText: string;
	indexRun = 0;
	indexType = 0;
	enabled = true;
	setFinalText = false;
	writeResolver: (() => void) | null = null;
	paused = false;

	constructor(target: Element, options: WriterOptions) {
		super();
		this.target = target;

		if (!options.text) options.text = getElementText(this.target);
		this.options = options as ExpectedWriterOptions;
		this.textProcess = this.processText(this.options.text);
		this.lastText = this.options.append ? getElementText(this.target) : "";
		this.progress = this.lastText;
		this.finalText = this.lastText + this.options.text;
	}

	async write(): Promise<void> {
		this.emit("START", {
			target: this.target,
			options: this.options
		});
		this.typeCharacter();
		return new Promise<void>((resolve) => {
			this.writeResolver = resolve;
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

	private async typeCharacter() {
		if (this.paused) {
			setTimeout(() => this.typeCharacter(), this.getInterval());
			return;
		}
		if (!this.enabled) {
			this.emit("FINISHED", {
				target: this.target,
				options: this.options,
				cancelled: !this.enabled
			});
			if (this.setFinalText) setText(this.target, this.finalText);
			if (this.writeResolver) this.writeResolver();
			return;
		}

		// run: The section of characters that needs to be typed continuously
		const run = this.textProcess[this.indexRun];

		// Whether this run is done or not
		if (this.indexType >= run.length) {
			this.indexRun++;
			this.indexType = 0;
			this.lastText = getElementText(this.target);

			// Whether the whole text is done or not
			if (this.indexRun >= this.textProcess.length) {
				this.emit("FINISHED", {
					target: this.target,
					options: this.options,
					cancelled: !this.enabled
				});
				if (this.writeResolver) this.writeResolver();
				return;
			}

			if (run.length === 1) {
				this.typeCharacter();
				return;
			}

			setTimeout(() => this.typeCharacter(), this.getInterval());
			return;
		}

		// Assemble to the current typing progress
		const typing = a(run.slice(0, this.indexType + 1)),
			typedChar = run[this.indexType];

		this.progress = this.lastText + typing;
		setText(this.target, this.progress);
		this.indexType++;

		this.emit("PROGRESS", {
			target: this.target,
			options: this.options,
			progress: this.progress,
			character: typedChar
		});

		setTimeout(() => this.typeCharacter(), this.getInterval());
	}

	private processText(text: string) {
		// Disassemble korean characters
		const disassembled = d(text, true);

		// textProcess: collection of all runs
		// run: The section of characters that needs to be typed continuously
		let textProcess: string[][] = [],
			run: string[] = [];

		for (const charProcess of disassembled) {
			if (charProcess.length > 1) run = run.concat(charProcess);
			else {
				if (run.length > 0) {
					textProcess.push(run);
					run = [];
				}
				textProcess.push(charProcess);
			}
		}

		if (run.length > 0) textProcess.push(run);

		return textProcess;
	}

	private getInterval() {
		switch (this.options.interval) {
			case "humanized":
				return this.getRandomInteger(120, 160);
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
}
