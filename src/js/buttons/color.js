import wrapText from "../utils/wrapText.js";

export default function createColorButton(editor) {
  const button = document.createElement("button");
  button.type = "button";
  button.title = "Color de Texto";
  button.innerHTML = "<i class=\"fas fa-palette\"></i>";
  button.addEventListener("click", () => {
    const color = prompt("Introduce el color (nombre o código hex):");
    if (color) {
      wrapText(editor, `[color=${color}]`, "[/color]");
    }
  });
  return button;
}
