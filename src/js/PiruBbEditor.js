// PirubbEditor.js

import "../scss/pirubbeditor.scss";

import PiruBbEditor from "./editor.js";

// Inicializar todos los editores en la página
document.querySelectorAll(".pirubbeditor").forEach((editorElement) => {
  const toolbarOptions = JSON.parse(
    editorElement.getAttribute("data-toolbar") || "[]"
  );
  new PiruBbEditor(editorElement, { toolbar: toolbarOptions });
});
