import { applyFormat } from "../utils/formatHelper.js";
import createModal from "../utils/modal.js";

export default function createSizeButton(editor) {
  const button = document.createElement("button");
  button.type = "button";
  button.title = "Tamaño de Texto";
  button.innerHTML = "<i class=\"fas fa-text-height\"></i>";

  button.addEventListener("click", () => {
    createModal(editor, {
      title: "Tamaño de Texto",
      label: "Introduce el tamaño en píxeles (ejemplo: 14, 18, 24):",
      placeholder: "18",
      defaultValue: "18",
      confirmText: "Guardar",
      cancelText: "Cancelar",
      onConfirm: (size) => {
        if (!size || !size.trim()) return;

        const cleanSize = size.replace("px", "").trim();
        applyFormat(
          editor,
          `[size=${cleanSize}]`,
          "[/size]",
          `<span style="font-size:${cleanSize}px"></span>`
        );
      },
    });
  });

  return button;
}
