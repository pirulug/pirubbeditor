import { applyFormat } from "../utils/formatHelper.js";
import createModal from "../utils/modal.js";
import { colorToHex } from "../utils/colorHelper.js";

const COLOR_PALETTE = [
  "#000000",
  "#495057",
  "#6c757d",
  "#adb5bd",
  "#dc3545",
  "#e64980",
  "#fd7e14",
  "#ffc107",
  "#198754",
  "#20c997",
  "#0d6efd",
  "#6f42c1",
];

export default function createColorButton(editor) {
  const button = document.createElement("button");
  button.type = "button";
  button.title = "Color de Texto";
  button.innerHTML = "<i class=\"fas fa-palette\"></i>";

  button.addEventListener("click", () => {
    const customBody = document.createElement("div");

    const label = document.createElement("label");
    label.className = "pirubbeditor-modal__label";
    label.textContent = "Selecciona un color de la paleta:";
    customBody.appendChild(label);

    const palette = document.createElement("div");
    palette.className = "pirubbeditor-color-palette";

    COLOR_PALETTE.forEach((color) => {
      const swatch = document.createElement("button");
      swatch.type = "button";
      swatch.className = "pirubbeditor-color-swatch";
      swatch.style.backgroundColor = color;
      swatch.title = color;
      swatch.setAttribute("data-color", color);
      palette.appendChild(swatch);
    });
    customBody.appendChild(palette);

    const inputGroup = document.createElement("div");
    inputGroup.className = "pirubbeditor-color-input-group";

    const colorPicker = document.createElement("input");
    colorPicker.type = "color";
    colorPicker.className = "pirubbeditor-color-picker";
    colorPicker.value = "#0d6efd";

    const textInput = document.createElement("input");
    textInput.type = "text";
    textInput.className = "pirubbeditor-modal__input";
    textInput.placeholder = "#0d6efd";
    textInput.value = "#0d6efd";

    colorPicker.addEventListener("input", () => {
      textInput.value = colorPicker.value;
    });

    textInput.addEventListener("input", () => {
      const hex = colorToHex(textInput.value);
      if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
        colorPicker.value = hex;
      }
    });

    inputGroup.appendChild(colorPicker);
    inputGroup.appendChild(textInput);
    customBody.appendChild(inputGroup);

    createModal(editor, {
      title: "Color de Texto",
      customBody,
      confirmText: "Guardar",
      cancelText: "Cancelar",
      onConfirm: () => {
        const rawColor = textInput.value.trim();
        const selectedColor = colorToHex(rawColor);
        if (selectedColor) {
          applyFormat(
            editor,
            `[color=${selectedColor}]`,
            "[/color]",
            `<span style="color:${selectedColor}"></span>`
          );
        }
      },
    });

    palette.querySelectorAll(".pirubbeditor-color-swatch").forEach((swatch) => {
      swatch.addEventListener("click", () => {
        const color = swatch.getAttribute("data-color");
        textInput.value = color;
        colorPicker.value = color;
      });
    });
  });

  return button;
}
