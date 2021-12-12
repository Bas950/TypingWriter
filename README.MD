# TypingWriter [![Version](https://img.shields.io/npm/v/typingwriter.svg)](https://www.npmjs.com/package/typingwriter)

A package that let's you write text on the screen! (With support for the way
Korean is typed!)

## Instalation

```bash
# npm
npm install typingwriter

# yarn
yarn add typingwriter
```

## Usage

### Importing

#### TypeScript

```ts
// Here we're importing the default export "TypingWriter", which is the TypingWriter class that returns promises
// as well as the "AsyncTypingWriter" class which is the TypingWriter class but it doesn't return promises and it queues all events.
import TypingWriter, { AsyncTypingWriter } from "typingwriter";
```

#### JavaScript

```js
// Here we're importing the default export "TypingWriter", which is the TypingWriter class that returns promises
// as well as the "AsyncTypingWriter" class which is the TypingWriter class but it doesn't return promises and it queues all events.
const {
	AsyncTypingWriter,
	default: TypingWriter
} = require("language-flag-colors");
```

Or, if you only want the default TypingWriter

```js
const TypingWriter = require("language-flag-colors");
```

Or if you only want the AsyncTypingWriter

```js
const { AsyncTypingWriter } = require("language-flag-colors");
```

### Using the classes

```ts
import TypingWriter, { AsyncTypingWriter } from "typingwriter";

// initialize the TypingWriter on the element with the id "target".
const typer = new TypingWriter("#target");

// write the text that was inside of the target element
await typer.write();

// write the given text
await typer.write("TypingWriter");

// delete all the text in the target element
await typer.delete();

// delete 8 characters from the target element
await typer.delete(8);

// delete 8 characters from the target element but skip the first 5
await typer.delete(8, 5);

// pause any active deleter or writer
typer.pause();

// continue any paused deleter or writer
typer.continue();

// wait 5seconds
await typer.wait(5000);

// fully exit the class and remove any wrappers
typer.exit();

const asynctyper = new AsyncTypingWriter("#target");

// same as the TypingWriter but you can queue everything;
asynctyper.write().delete(8).wait(5000).delete(8, 5).exit();
```

### Available options

The options object can be passed the to classes as the second argument.

| Option           | Description                                                  | Available values                                                                                                                             |
| ---------------- | ------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------- |
| cursor           | the character the cursor should be                           | `string \| false` (false to disable cursor), default: `"\|"`                                                                                 |
| typingInterval   | the interval in which text should be typed                   | `"humanized" \| number \| [number, number]`, default: `"humanized"`, the array of numbers is to get a random interval between given numbers. |
| deleteInterval   | the interval in which text should be deleted                 | `"humanized" \| number \| [number, number]`, default: `"humanized"`, the array of numbers is to get a random interval between given numbers. |
| autoStart        | automatically start typing on class creation                 | `boolean`, default: `false`                                                                                                                  |
| append           | append text given in write to existing text of the element   | `boolean`, default: `false`                                                                                                                  |
| cursorStyles     | whether or not the cursor styling should be added to the DOM | `boolean`, default: `true`                                                                                                                   |
| cursorClassName  | the class name the cursor should get                         | `string`, default: `"typingwriter__cursor"`                                                                                                  |
| wrapperClassName | the class name the wrapper should get                        | `string`, default: `"typingwriter__wrapper"`                                                                                                 |
| loop             | (only for AsyncTypingWriter) loop the given queue            | `boolean`, default: `false`                                                                                                                  |

### Contributing

Due to the complex nature of this package, it is possible that some features may
not be perfect. If you believe so and found a solution, feel free to
[open a pull request](https://github.com/Bas950/TypingWriter/compare).

### Inspiration

There are a lot of typers that do this, but almost none of them have support for
Korean which I needed for my localized website. Nor were there a lot of typers
that support typing multiple elements at once. Hence why I decided to make one
that has it all!
