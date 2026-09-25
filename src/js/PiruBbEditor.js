import "../scss/pirubbeditor.scss";
import PiruBbEditor from "./editor.js";

// Exponer en el objeto global del navegador
if (typeof window !== "undefined") {
  window.PiruBbEditor = PiruBbEditor;
}

export default PiruBbEditor;
