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
