import wrapText from "../utils/wrapText";

export default function createColorButton(editor) {
  const button = document.createElement("button");
  button.innerHTML = '<i class="fas fa-palette"></i>';
  button.title = "Color de Texto";
  button.type = "button";
  button.addEventListener("click", () => {
    const color = prompt("Introduce el color (nombre o código hex):");
    if (color) wrapText(editor, `[color=${color}]`, "[/color]");
  });
  return button;
}
