import { applyFormat } from "../utils/formatHelper.js";
import createModal from "../utils/modal.js";
import jdownloaderIcon from "../../img/jdownloader.svg";

export default function createJDownloaderButton(editor) {
  const button = document.createElement("button");
  button.type = "button";
  button.title = "JDownloader";
  button.innerHTML = jdownloaderIcon;

  button.addEventListener("click", () => {
    createModal(editor, {
      title: "Insertar enlace JDownloader",
      label: "Introduce la URL o enlace de descarga:",
      placeholder: "https://ejemplo.com/archivo.rar",
      confirmText: "Guardar",
      cancelText: "Cancelar",
      onConfirm: (url) => {
        if (!url || !url.trim()) return;

        const cleanUrl = url.trim();

        if (editor.isCodeMode) {
          const { selectionStart: start, selectionEnd: end, value } =
            editor.textarea;
          const selectedText = value.substring(start, end);
          if (selectedText) {
            applyFormat(editor, `[jdownloader=${cleanUrl}]`, "[/jdownloader]");
          } else {
            applyFormat(editor, `[jdownloader]${cleanUrl}[/jdownloader]`, "");
          }
        } else {
          applyFormat(
            editor,
            `[jdownloader]${cleanUrl}[/jdownloader]`,
            "",
            `<a href="${cleanUrl}" class="jdownloader-link" target="_blank" rel="noopener noreferrer">Descargar con JDownloader</a>`
          );
        }
      },
    });
  });

  return button;
}
