import toolbar from "./components/toolbar.js";
import updatePreview from "./utils/updatePreview.js";
import convertToBBCode from "./utils/convertToBBCode.js";
import convertToHTML from "./utils/convertToHTML.js";
import {
  handlePreviewKeyDown,
  handlePreviewClick,
} from "./utils/editorEvents.js";
import initMediaResizer from "./utils/mediaResizer.js";

export default class PiruBbEditor {
  constructor(target, options = {}) {
    const element =
      typeof target === "string" ? document.querySelector(target) : target;

    if (!element) {
      console.error("PiruBbEditor: Elemento no encontrado:", target);
      return;
    }

    this.targetElement = element;
    this.options = options;
    this.savedSelection = null;

    const defaultToolbar = [
      "heading",
      "bold",
      "italic",
      "underline",
      "strike",
      "quote",
      "ol",
      "ul",
      "li",
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
      "code",
    ];

    // Opciones desde data-attributes o configuración JS
    let dataToolbar = [];
    const rawDataToolbar = element.getAttribute("data-toolbar");
    if (rawDataToolbar) {
      try {
        dataToolbar = JSON.parse(rawDataToolbar);
      } catch {
        dataToolbar = [];
      }
    }

    this.toolbarOptions = options.toolbar?.length
      ? options.toolbar
      : dataToolbar.length
      ? dataToolbar
      : defaultToolbar;

    this.previewType =
      options.previewType ||
      element.getAttribute("data-preview-type") ||
      "js";

    this.previewUrl =
      options.previewUrl ||
      element.getAttribute("data-preview-url") ||
      "preview.php";

    this.setupDOM(element, options);

    // Habilitar edición directa en la vista previa (WYSIWYG)
    this.previewArea.setAttribute("contenteditable", "true");
    this.previewArea.setAttribute("spellcheck", "true");

    // Inicializar barra de herramientas
    toolbar(this);

    // Evitar que el clic en los botones de la barra de herramientas robe el foco y pierda el cursor
    this.toolbar.addEventListener("mousedown", (e) => {
      this.saveSelection();
      if (!e.target.closest("select")) {
        e.preventDefault();
      }
    });

    // Iniciar por defecto en modo visual/preview como SCEditor
    this.isCodeMode = false;
    this.textarea.style.display = "none";
    this.previewArea.style.display = "block";
    updatePreview(this);

    // Historial para undo/redo
    this.history = [];
    this.redoStack = [];
    this.saveHistory();

    // Rastrear en tiempo real la posición del cursor
    const onSelectionChange = () => {
      if (!this.isCodeMode) {
        const sel = window.getSelection();
        if (
          sel &&
          sel.rangeCount > 0 &&
          this.previewArea.contains(sel.anchorNode)
        ) {
          this.savedSelection = {
            type: "range",
            range: sel.getRangeAt(0).cloneRange(),
          };
        }
      }
    };

    document.addEventListener("selectionchange", onSelectionChange);

    const onTextareaSelect = () => {
      if (this.isCodeMode) {
        this.savedSelection = {
          type: "textarea",
          start: this.textarea.selectionStart,
          end: this.textarea.selectionEnd,
        };
      }
    };

    this.textarea.addEventListener("input", onTextareaSelect);
    this.textarea.addEventListener("keyup", onTextareaSelect);
    this.textarea.addEventListener("mouseup", onTextareaSelect);
    this.textarea.addEventListener("select", onTextareaSelect);
    this.textarea.addEventListener("focus", onTextareaSelect);

    // Eventos de entrada en textarea
    this.textarea.addEventListener("input", () => {
      this.saveHistory();
    });

    // Eventos de edición directa en previewArea
    this.previewArea.addEventListener("input", () => {
      this.syncToTextarea();
    });

    this.previewArea.addEventListener("blur", () => {
      this.syncToTextarea();
    });

    // Atajos de teclado en textarea
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

    // Atajos de teclado y manejo de bloques/citas en previewArea
    this.previewArea.addEventListener("keydown", (e) => {
      handlePreviewKeyDown(this, e);
    });

    // Permitir hacer clic en el espacio inferior vacío para añadir líneas y texto después de bloques como spoilers y citas
    this.previewArea.addEventListener("click", (e) => {
      handlePreviewClick(this, e);
    });

    // Inicializar redimensionador y opciones flotantes para imágenes y videos
    this.mediaResizer = initMediaResizer(this);
  }

  saveSelection() {
    if (this.isCodeMode) {
      this.savedSelection = {
        type: "textarea",
        start: this.textarea.selectionStart,
        end: this.textarea.selectionEnd,
      };
    } else {
      const sel = window.getSelection();
      if (
        sel &&
        sel.rangeCount > 0 &&
        this.previewArea.contains(sel.anchorNode)
      ) {
        this.savedSelection = {
          type: "range",
          range: sel.getRangeAt(0).cloneRange(),
        };
      }
    }
  }

  restoreSelection() {
    if (!this.savedSelection) return;

    if (this.savedSelection.type === "textarea" && this.isCodeMode) {
      this.textarea.focus();
      this.textarea.selectionStart = this.savedSelection.start;
      this.textarea.selectionEnd = this.savedSelection.end;
    } else if (this.savedSelection.type === "range" && !this.isCodeMode) {
      this.previewArea.focus();
      const sel = window.getSelection();
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(this.savedSelection.range);
      }
    }
  }

  setupDOM(element, options) {
    // Caso 1: Estructura previa ya presente en el DOM
    const existingInput = element.querySelector(".pirubbeditor__input");
    const existingToolbar = element.querySelector(".pirubbeditor__toolbar");
    const existingPreview = element.querySelector(".pirubbeditor__preview");

    if (existingInput && existingToolbar && existingPreview) {
      this.editorElement = element;
      this.textarea = existingInput;
      this.toolbar = existingToolbar;
      this.previewArea = existingPreview;
      return;
    }

    // Caso 2: El elemento objetivo es un <textarea>
    if (element.tagName.toLowerCase() === "textarea") {
      const initialValue = options.value ?? element.value;

      const wrapper = document.createElement("div");
      wrapper.className = "pirubbeditor";

      const toolbarDiv = document.createElement("div");
      toolbarDiv.className = "pirubbeditor__toolbar";

      const containerDiv = document.createElement("div");
      containerDiv.className = "pirubbeditor__container";

      const previewDiv = document.createElement("div");
      previewDiv.className = "pirubbeditor__preview";

      element.classList.add("pirubbeditor__input");
      element.value = initialValue;

      element.parentNode.insertBefore(wrapper, element);
      wrapper.appendChild(toolbarDiv);
      wrapper.appendChild(containerDiv);
      containerDiv.appendChild(element);
      containerDiv.appendChild(previewDiv);

      this.editorElement = wrapper;
      this.textarea = element;
      this.toolbar = toolbarDiv;
      this.previewArea = previewDiv;
      return;
    }

    // Caso 3: El elemento objetivo es un <div> simple
    const initialValue = options.value ?? element.textContent.trim();

    element.classList.add("pirubbeditor");
    element.innerHTML = "";

    const toolbarDiv = document.createElement("div");
    toolbarDiv.className = "pirubbeditor__toolbar";

    const containerDiv = document.createElement("div");
    containerDiv.className = "pirubbeditor__container";

    const textareaEl = document.createElement("textarea");
    textareaEl.className = "pirubbeditor__input";
    textareaEl.value = initialValue;

    const previewDiv = document.createElement("div");
    previewDiv.className = "pirubbeditor__preview";

    containerDiv.appendChild(textareaEl);
    containerDiv.appendChild(previewDiv);

    element.appendChild(toolbarDiv);
    element.appendChild(containerDiv);

    this.editorElement = element;
    this.textarea = textareaEl;
    this.toolbar = toolbarDiv;
    this.previewArea = previewDiv;
  }

  getValue() {
    return this.textarea.value;
  }

  setValue(bbcode) {
    this.textarea.value = bbcode;
    updatePreview(this);
    this.saveHistory();
  }

  getHTML() {
    return convertToHTML(this.textarea.value);
  }

  syncToTextarea() {
    this.textarea.value = convertToBBCode(this.previewArea.innerHTML);
    this.saveHistory();
  }

  syncToPreview() {
    updatePreview(this);
  }

  toggleCodeView(button = null) {
    this.isCodeMode = !this.isCodeMode;
    if (this.mediaResizer) {
      this.mediaResizer.hide();
    }

    if (this.isCodeMode) {
      this.syncToTextarea();
      this.previewArea.style.display = "none";
      this.textarea.style.display = "block";
      this.textarea.focus();
      if (button) button.classList.add("active");
    } else {
      this.syncToPreview();
      this.textarea.style.display = "none";
      this.previewArea.style.display = "block";
      this.previewArea.focus();
      if (button) button.classList.remove("active");
    }
  }

  // Guardar el estado en el stack
  saveHistory() {
    const value = this.textarea.value;
    if (
      this.history.length === 0 ||
      this.history[this.history.length - 1] !== value
    ) {
      this.history.push(value);
      this.redoStack = [];
    }
  }

  undo() {
    if (this.history.length > 1) {
      const current = this.history.pop();
      this.redoStack.push(current);
      this.textarea.value = this.history[this.history.length - 1];
      if (!this.isCodeMode) {
        updatePreview(this);
      }
    }
  }

  redo() {
    if (this.redoStack.length > 0) {
      const next = this.redoStack.pop();
      this.history.push(next);
      this.textarea.value = next;
      if (!this.isCodeMode) {
        updatePreview(this);
      }
    }
  }

  disableOtherButtons(activeButton) {
    this.toolbar.querySelectorAll("button, select").forEach((btn) => {
      if (btn !== activeButton) btn.disabled = true;
    });
  }

  enableOtherButtons() {
    this.toolbar.querySelectorAll("button, select").forEach((btn) => {
      btn.disabled = false;
    });
  }
}
