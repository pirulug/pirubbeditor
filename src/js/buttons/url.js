import { applyFormat } from "../utils/formatHelper.js";
import createModal from "../utils/modal.js";

export default function createURLButton(editor) {
  const button = document.createElement("button");
  button.type = "button";
  button.title = "Insertar Enlace";
  button.innerHTML = "<i class=\"fas fa-link\"></i>";

  button.addEventListener("click", () => {
    createModal(editor, {
      title: "Insertar Enlace",
      label: "Introduce la URL del enlace:",
      placeholder: "https://ejemplo.com",
      confirmText: "Guardar",
      cancelText: "Cancelar",
      onConfirm: (url) => {
        if (!url || !url.trim()) return;
        const cleanUrl = url.trim();

        if (editor.isCodeMode) {
          const { selectionStart: start, selectionEnd: end, value } = editor.textarea;
          const selectedText = value.substring(start, end);
          if (selectedText) {
            applyFormat(editor, `[url=${cleanUrl}]`, "[/url]");
          } else {
            applyFormat(editor, `[url]${cleanUrl}[/url]`, "");
          }
        } else {
          applyFormat(
            editor,
            `[url=${cleanUrl}]`,
            "[/url]",
            `<a href="${cleanUrl}" target="_blank" rel="noopener noreferrer"></a>`
          );
        }
      },
    });
  });

  return button;
}
