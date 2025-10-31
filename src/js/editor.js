// editor.js

// Components
import toolbar from "./components/toolbar";

export default class PirubbEditor {
  constructor(editorElement, options = {}) {
    this.editorElement = editorElement;
    this.textarea = editorElement.querySelector(".pirubbeditor__input");
    this.toolbar = editorElement.querySelector(".pirubbeditor__toolbar");
    this.previewArea = editorElement.querySelector(".pirubbeditor__preview");

    const defaultToolbar = [
      "bold",
      "italic",
      "underline",
      "strike",
      "ol",
      "ul",
      "li",
      "code",
      "left",
      "center",
      "right",
      "url",
      "image",
      "color",
      "size",
      "spoiler",
      "jdownloader",
      "vip",
      "youtube",
      "preview",
    ];

    // this.toolbarOptions = options.toolbar || defaultToolbar;
    this.toolbarOptions = options.toolbar.length
      ? options.toolbar
      : defaultToolbar;

    // Configuración de vista previa
    this.previewType = editorElement.getAttribute("data-preview-type") || "js";
    this.previewUrl =
      editorElement.getAttribute("data-preview-url") || "preview.php";

    // this.initializeToolbar();
    toolbar(this);
    this.previewArea.style.display = "none";

    // --- NUEVO: historial para undo/redo ---
    this.history = [];
    this.redoStack = [];
    this.saveHistory();

    this.textarea.addEventListener("input", () => {
      this.saveHistory();
    });

    this.textarea.addEventListener("keydown", (e) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === "z") {
          e.preventDefault();
          this.undo();
        } else if (e.key === "y") {
          e.preventDefault();
          this.redo();
        }
      }
    });
  }

  // Guardar el estado en el stack
  saveHistory() {
    const value = this.textarea.value;
    if (
      this.history.length === 0 ||
      this.history[this.history.length - 1] !== value
    ) {
      this.history.push(value);
      this.redoStack = []; // limpiar cuando se escribe algo nuevo
    }
  }

  undo() {
    if (this.history.length > 1) {
      const current = this.history.pop();
      this.redoStack.push(current);
      this.textarea.value = this.history[this.history.length - 1];
    }
  }

  redo() {
    if (this.redoStack.length > 0) {
      const next = this.redoStack.pop();
      this.history.push(next);
      this.textarea.value = next;
    }
  }

  disableOtherButtons(activeButton) {
    this.toolbar.querySelectorAll("button").forEach((btn) => {
      if (btn !== activeButton) btn.disabled = true;
    });
  }

  enableOtherButtons() {
    this.toolbar.querySelectorAll("button").forEach((btn) => {
      btn.disabled = false;
    });
  }
}
