import "../scss/pirubbeditor.scss";
import PiruBbEditor from "./editor.js";

// Exponer en el objeto global del navegador si existe
if (typeof globalThis.window !== "undefined") {
  globalThis.window.PiruBbEditor = PiruBbEditor;
}

export default PiruBbEditor;
