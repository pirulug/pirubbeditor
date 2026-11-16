import toolbar from "./components/toolbar.js";
import updatePreview from "./utils/updatePreview.js";
import convertToBBCode from "./utils/convertToBBCode.js";
import convertToHTML from "./utils/convertToHTML.js";
import {
  handlePreviewKeyDown,
  handlePreviewClick,
} from "./utils/editorEvents.js";
import initMediaResizer from "./utils/mediaResizer.js";

const MAX_HISTORY = 100;
const HISTORY_DEBOUNCE_MS = 300;

export default class PiruBbEditor {
  static defaultToolbar = [
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

  #history = [];
  #redoStack = [];
  #historyTimer = null;
  #abortController = new AbortController();

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
      : PiruBbEditor.defaultToolbar;

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

    const { signal } = this.#abortController;

    // Evitar que el clic en los botones de la barra de herramientas robe el foco y pierda el cursor
    this.toolbar.addEventListener(
      "mousedown",
      (e) => {
        this.saveSelection();
        if (!e.target.closest("select")) {
          e.preventDefault();
        }
      },
      { signal }
    );

    // Iniciar por defecto en modo visual/preview como SCEditor
    this.isCodeMode = false;
    this.textarea.style.display = "none";
    this.previewArea.style.display = "block";
    updatePreview(this);

    // Historial inicial para undo/redo
    this.saveHistory();

    // Rastrear en tiempo real la posición del cursor
    document.addEventListener(
      "selectionchange",
      () => {
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
      },
      { signal }
    );

    const onTextareaSelect = () => {
      if (this.isCodeMode) {
        this.savedSelection = {
          type: "textarea",
          start: this.textarea.selectionStart,
          end: this.textarea.selectionEnd,
        };
      }
    };

    for (const evt of ["input", "keyup", "mouseup", "select", "focus"]) {
      this.textarea.addEventListener(evt, onTextareaSelect, { signal });
    }

    // Eventos de entrada en textarea
    this.textarea.addEventListener(
      "input",
      () => {
        this.scheduleHistorySave();
      },
      { signal }
    );

    this.textarea.addEventListener(
      "blur",
      () => {
        this.saveHistory();
      },
      { signal }
    );

    // Eventos de edición directa en previewArea
    this.previewArea.addEventListener(
      "input",
      () => {
        this.syncToTextarea({ debounceHistory: true });
      },
      { signal }
    );

    this.previewArea.addEventListener(
      "blur",
      () => {
        this.syncToTextarea();
      },
      { signal }
    );

    // Atajos de teclado en textarea
    this.textarea.addEventListener(
      "keydown",
      (e) => {
        if ((e.ctrlKey || e.metaKey) && !e.altKey) {
          const key = e.key.toLowerCase();
          if (key === "z" && !e.shiftKey) {
            e.preventDefault();
            this.undo();
          } else if ((key === "y" && !e.shiftKey) || (key === "z" && e.shiftKey)) {
            e.preventDefault();
            this.redo();
          }
        }
      },
      { signal }
    );

    // Atajos de teclado y manejo de bloques/citas en previewArea
    this.previewArea.addEventListener(
      "keydown",
      (e) => {
        handlePreviewKeyDown(this, e);
      },
      { signal }
    );

    // Permitir hacer clic en el espacio inferior vacío para añadir líneas y texto después de bloques como spoilers y citas
    this.previewArea.addEventListener(
      "click",
      (e) => {
        handlePreviewClick(this, e);
      },
      { signal }
    );

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

  syncToTextarea({ debounceHistory = false } = {}) {
    this.textarea.value = convertToBBCode(this.previewArea.innerHTML);
    if (debounceHistory) {
      this.scheduleHistorySave();
    } else {
      this.saveHistory();
    }
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

  scheduleHistorySave() {
    if (this.#historyTimer) {
      clearTimeout(this.#historyTimer);
    }
    this.#historyTimer = setTimeout(() => {
      this.#historyTimer = null;
      this.saveHistory();
    }, HISTORY_DEBOUNCE_MS);
  }

  // Guardar el estado en el stack
  saveHistory() {
    if (this.#historyTimer) {
      clearTimeout(this.#historyTimer);
      this.#historyTimer = null;
    }
    const value = this.textarea.value;
    if (this.#history.length === 0 || this.#history.at(-1) !== value) {
      this.#history.push(value);
      if (this.#history.length > MAX_HISTORY) {
        this.#history.shift();
      }
      this.#redoStack = [];
    }
  }

  undo() {
    if (this.#historyTimer) {
      clearTimeout(this.#historyTimer);
      this.#historyTimer = null;
      this.saveHistory();
    }
    if (this.#history.length > 1) {
      const current = this.#history.pop();
      this.#redoStack.push(current);
      this.textarea.value = this.#history.at(-1);
      if (!this.isCodeMode) {
        updatePreview(this);
        this.previewArea.focus();
      } else {
        this.textarea.focus();
      }
    }
  }

  redo() {
    if (this.#historyTimer) {
      clearTimeout(this.#historyTimer);
      this.#historyTimer = null;
    }
    if (this.#redoStack.length > 0) {
      const next = this.#redoStack.pop();
      this.#history.push(next);
      if (this.#history.length > MAX_HISTORY) {
        this.#history.shift();
      }
      this.textarea.value = next;
      if (!this.isCodeMode) {
        updatePreview(this);
        this.previewArea.focus();
      } else {
        this.textarea.focus();
      }
    }
  }

  destroy() {
    if (this.#historyTimer) {
      clearTimeout(this.#historyTimer);
      this.#historyTimer = null;
    }
    this.#abortController.abort();
    if (this.mediaResizer && typeof this.mediaResizer.hide === "function") {
      this.mediaResizer.hide();
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
