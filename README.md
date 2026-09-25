# PiruBbEditor

Language: [Español](README.es.md) | **English**

PiruBbEditor is a modern, lightweight, modular WYSIWYG BBCode rich text editor built with vanilla JavaScript and Sass (SCSS). It provides seamless switching between an interactive visual editing mode and a real-time BBCode source view.

## Features

* **Dual Editing Modes**: Interactive visual mode (WYSIWYG) with direct DOM editing and a traditional BBCode source mode.
* **Clean Bidirectional Conversion**: Built-in converter between BBCode and clean HTML for both client-side (JavaScript) and server-side (PHP) processing.
* **Interactive Image Control**: Selection box with 4-corner drag handles, live pixel dimension badge, and a floating toolbar with quick size presets (100%, 50%, 25%, original), alignment/floating options, and instant removal.
* **Smart Keyboard Navigation**: Seamless exit from blockquotes, spoilers, VIP boxes, headings, and lists by pressing Enter on empty lines.
* **History Management**: Keyboard shortcuts for Undo (`Ctrl+Z`) and Redo (`Ctrl+Y`) in both visual and source modes.
* **Strict Hexadecimal Colors**: Consistent color conversion and persistence using the `#rrggbb` format.
* **No Deprecated Dependencies**: Modern native DOM Range and Selection API without `document.execCommand`.
* **Dark Theme Support**: Built-in modular styles adaptable to dark theme classes.

## Installation

### Via Compiled Assets (dist)

Include the generated CSS stylesheet and JavaScript bundle from the `dist` directory:

```html
<link rel="stylesheet" href="dist/css/pirubbeditor.css" />
<script src="dist/js/pirubbeditor.js"></script>
```

### Basic Initialization

You can initialize the editor from a `<textarea>` element or a `<div>` container:

```html
<!-- From a textarea -->
<textarea id="my-editor">[b]Initial content[/b]</textarea>

<!-- Or from a div -->
<div id="my-editor-div">[h1]Title[/h1]</div>

<script>
  const editor = new PiruBbEditor("#my-editor", {
    previewType: "js"
  });
</script>
```

## Configuration Options

The `PiruBbEditor(target, options)` constructor accepts the following options:

| Option | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `toolbar` | `Array<string>` | *(All tools)* | List of buttons to include in the toolbar. |
| `previewType` | `string` | `"js"` | Processing engine for the visual preview: `"js"` (client) or `"php"` (server). |
| `previewUrl` | `string` | `"preview.php"` | Backend endpoint URL when using `previewType: "php"`. |
| `value` | `string` | `""` | Initial BBCode content. |

### Toolbar Customization

Available tools:

* `heading`: Dropdown selector for normal paragraph and H1 to H6 headings.
* `bold`: Bold text (`[b]...[/b]`).
* `italic`: Italic text (`[i]...[/i]`).
* `underline`: Underlined text (`[u]...[/u]`).
* `strike`: Strikethrough text (`[s]...[/s]`).
* `quote`: Blockquote container (`[quote]...[/quote]`).
* `ol`: Ordered list (`[ol][li]...[/li][/ol]`).
* `ul`: Unordered list (`[ul][li]...[/li][/ul]`).
* `li`: List item (`[li]...[/li]`).
* `left`: Align text to the left (`[left]...[/left]`).
* `center`: Center text (`[center]...[/center]`).
* `right`: Align text to the right (`[right]...[/right]`).
* `url`: Link modal with URL and optional display text fields (`[url=...]...[/url]`).
* `image`: Image modal with URL and optional dimension fields (`[img width=... height=...]...[/img]`).
* `color`: Color picker with hexadecimal palette and native picker (`[color=#rrggbb]...[/color]`).
* `size`: Font size selector (`[size=18]...[/size]`).
* `spoiler`: Collapsible spoiler box (`[spoiler]...[/spoiler]`).
* `jdownloader`: Specialized JDownloader download link (`[jdownloader]...[/jdownloader]`).
* `vip`: Exclusive VIP content box (`[vip]...[/vip]`).
* `youtube`: YouTube video container with optional dimensions (`[youtube width=... height=...]...[/youtube]`).
* `code`: Preformatted code block (`[code]...[/code]`).

Custom toolbar example:

```javascript
const editor = new PiruBbEditor("#my-editor", {
  toolbar: [
    "heading",
    "bold",
    "italic",
    "underline",
    "url",
    "image",
    "color",
    "quote",
    "spoiler",
    "vip"
  ]
});
```

## JavaScript API

The editor instance provides the following public methods:

### `getValue()`
Returns the current content formatted as BBCode.

```javascript
const bbcode = editor.getValue();
```

### `setValue(bbcode)`
Sets the editor content in BBCode format and refreshes the visual preview.

```javascript
editor.setValue("[b]New content[/b]");
```

### `getHTML()`
Returns the converted HTML markup.

```javascript
const html = editor.getHTML();
```

### `toggleCodeView()`
Toggles between the WYSIWYG visual mode and the BBCode source mode.

```javascript
editor.toggleCodeView();
```

### `undo()` / `redo()`
Reverts or re-applies the last action in the history stack.

```javascript
editor.undo();
editor.redo();
```

## Project Structure

```text
pirubbeditor/
├── dist/
│   ├── css/
│   │   └── pirubbeditor.css
│   └── js/
│       └── pirubbeditor.js
├── src/
│   ├── js/
│   │   ├── buttons/       # Individual button handlers
│   │   ├── components/    # Toolbar and structural UI components
│   │   ├── utils/         # Converters, event handlers, image resizer, modals
│   │   ├── editor.js      # Main editor class
│   │   └── PiruBbEditor.js# Library entry point
│   └── scss/              # Modular stylesheets
├── test/
│   ├── index.html         # Test and demonstration page
│   └── preview.php        # Backend PHP test endpoint
├── CHANGELOG.md
├── package.json
├── README.es.md
└── README.md
```

## License

This project is licensed under the MIT License. See the license file for details.
