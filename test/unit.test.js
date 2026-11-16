import test from "node:test";
import assert from "node:assert/strict";
import convertToHTML from "../src/js/utils/convertToHTML.js";
import {
  sanitizeUrl,
  sanitizeColor,
  sanitizeCssDimension,
  sanitizeYouTubeId,
} from "../src/js/utils/sanitize.js";

test("escapes raw HTML to prevent XSS", () => {
  assert.equal(
    convertToHTML("<script>alert(1)</script>"),
    "&lt;script&gt;alert(1)&lt;/script&gt;"
  );
});

test("blocks dangerous URL protocols in [url] and [img]", () => {
  assert.equal(convertToHTML("[url=javascript:alert(1)]clic[/url]"), "clic");
  assert.equal(convertToHTML("[url=  java\nscript:alert(1)]clic[/url]"), "clic");
  assert.equal(convertToHTML("[img]javascript:alert(1)[/img]"), "");
  assert.equal(
    convertToHTML('[img]https://example.com/a.png" onerror="alert(1)[/img]'),
    '<img src="https://example.com/a.png&quot; onerror=&quot;alert(1)" alt="Image">'
  );
});

test("validates [color] and [size] values", () => {
  assert.equal(convertToHTML("[color=red;background:url(x)]hola[/color]"), "hola");
  assert.equal(
    convertToHTML("[color=#0d6efd]azul[/color]"),
    '<span style="color:#0d6efd">azul</span>'
  );
  assert.equal(convertToHTML("[size=18px;color:red]txt[/size]"), "txt");
  assert.equal(
    convertToHTML("[size=18]txt[/size]"),
    '<span style="font-size:18px">txt</span>'
  );
});

test("preserves [code] blocks literally without parsing BBCode or <br>", () => {
  assert.equal(
    convertToHTML("[code][b]hola[/b]\n<script>x</script>[/code]"),
    "<pre><code>[b]hola[/b]\n&lt;script&gt;x&lt;/script&gt;</code></pre>"
  );
});

test("converts valid BBCode tags accurately", () => {
  assert.equal(convertToHTML("[b]negrita[/b]"), "<strong>negrita</strong>");
  assert.equal(
    convertToHTML("[url=https://github.com/pirulug?a=1&b=2]GitHub[/url]"),
    '<a href="https://github.com/pirulug?a=1&amp;b=2" target="_blank" rel="noopener noreferrer">GitHub</a>'
  );
  assert.equal(
    convertToHTML("[img width=400 align=center]https://example.com/a.jpg[/img]"),
    '<img src="https://example.com/a.jpg" style="width:400px;display:block;margin:0.5rem auto;" alt="Image">'
  );
  assert.equal(
    convertToHTML("[youtube]dQw4w9WgXcQ[/youtube]"),
    '<lite-youtube contenteditable="false" videoid="dQw4w9WgXcQ"></lite-youtube>'
  );
});

test("sanitize helpers validate inputs", () => {
  assert.equal(sanitizeYouTubeId("invalid/id!"), "");
  assert.equal(sanitizeCssDimension("100%"), "100%");
  assert.equal(sanitizeCssDimension("10px;position:fixed"), "");
  assert.equal(sanitizeUrl("mailto:user@example.com"), "mailto:user@example.com");
  assert.equal(sanitizeColor("rgb(10, 20, 30)"), "rgb(10, 20, 30)");
});
