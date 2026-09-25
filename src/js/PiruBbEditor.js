import "../scss/pirubbeditor.scss";
import PiruBbEditor from "./editor.js";

// Inicializar todos los editores en la página
document.querySelectorAll(".pirubbeditor").forEach((editorElement) => {
  const toolbarRaw = editorElement.getAttribute("data-toolbar");
  let toolbarOptions = [];

  if (toolbarRaw) {
    try {
      toolbarOptions = JSON.parse(toolbarRaw);
    } catch {
      toolbarOptions = [];
    }
  }

  new PiruBbEditor(editorElement, { toolbar: toolbarOptions });
});

export default PiruBbEditor;
