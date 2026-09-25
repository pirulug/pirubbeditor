import { applyFormat } from "../utils/formatHelper.js";
import createModal from "../utils/modal.js";

function getSelectedText(editor) {
  if (editor.isCodeMode) {
    const { selectionStart: start, selectionEnd: end, value } = editor.textarea;
    if (start !== undefined && end !== undefined && start !== end) {
      return value.substring(start, end).trim();
    }
    return "";
  }

  const sel = window.getSelection();
  if (
    sel &&
    sel.rangeCount > 0 &&
    editor.previewArea.contains(sel.anchorNode)
  ) {
    return sel.toString().trim();
  }

  if (
    editor.savedSelection?.type === "range" &&
    editor.previewArea.contains(
      editor.savedSelection.range.commonAncestorContainer
    )
  ) {
    return editor.savedSelection.range.toString().trim();
  }

  return "";
}

function openURLModal(editor) {
  const selectedText = getSelectedText(editor);

  const customBody = document.createElement("div");

  // Campo URL
  const urlLabel = document.createElement("label");
  urlLabel.className = "pirubbeditor-modal__label";
  urlLabel.textContent = "URL del enlace:";
  const urlInput = document.createElement("input");
  urlInput.type = "text";
  urlInput.className = "pirubbeditor-modal__input";
  urlInput.placeholder = "https://ejemplo.com";

  // Campo Texto del enlace
  const textLabel = document.createElement("label");
  textLabel.className = "pirubbeditor-modal__label";
  textLabel.style.marginTop = "0.75rem";
  textLabel.textContent = "Texto a mostrar (opcional):";
  const textInput = document.createElement("input");
  textInput.type = "text";
  textInput.className = "pirubbeditor-modal__input";
  textInput.placeholder = "Texto del enlace";
  if (selectedText) {
    textInput.value = selectedText;
  }

  customBody.appendChild(urlLabel);
  customBody.appendChild(urlInput);
  customBody.appendChild(textLabel);
  customBody.appendChild(textInput);

  createModal(editor, {
    title: "Insertar Enlace",
    customBody,
    confirmText: "Guardar",
    cancelText: "Cancelar",
    onConfirm: () => {
      const rawUrl = urlInput.value.trim();
      if (!rawUrl) return;

      const linkText = textInput.value.trim();

      if (editor.isCodeMode) {
        if (linkText && linkText !== rawUrl) {
          if (selectedText && linkText === selectedText) {
            applyFormat(editor, `[url=${rawUrl}]`, "[/url]");
          } else {
            applyFormat(editor, `[url=${rawUrl}]${linkText}[/url]`, "");
          }
        } else {
          applyFormat(editor, `[url]${rawUrl}[/url]`, "");
        }
      } else {
        const displayText = linkText || rawUrl;
        if (selectedText && linkText === selectedText) {
          applyFormat(
            editor,
            `[url=${rawUrl}]`,
            "[/url]",
            `<a href="${rawUrl}" target="_blank" rel="noopener noreferrer"></a>`
          );
        } else if (linkText && linkText !== rawUrl) {
          applyFormat(
            editor,
            `[url=${rawUrl}]${displayText}[/url]`,
            "",
            `<a href="${rawUrl}" target="_blank" rel="noopener noreferrer">${displayText}</a>`
          );
        } else {
          applyFormat(
            editor,
            `[url]${rawUrl}[/url]`,
            "",
            `<a href="${rawUrl}" target="_blank" rel="noopener noreferrer">${rawUrl}</a>`
          );
        }
      }
    },
  });

  setTimeout(() => urlInput.focus(), 50);
}

export default function createURLButton(editor) {
  const button = document.createElement("button");
  button.type = "button";
  button.title = "Insertar Enlace";
  button.innerHTML = "<i class=\"fas fa-link\"></i>";

  button.addEventListener("click", () => openURLModal(editor));

  return button;
}
