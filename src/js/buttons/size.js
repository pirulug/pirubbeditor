import wrapText from "../utils/wrapText.js";

export default function createSizeButton(editor) {
  const button = document.createElement("button");
  button.type = "button";
  button.title = "Tamaño de Texto";
  button.innerHTML = "<i class=\"fas fa-text-height\"></i>";
  button.addEventListener("click", () => {
    const size = prompt("Introduce el tamaño (ejemplo: 12, 16, 20):");
    if (size) {
      wrapText(editor, `[size=${size}]`, "[/size]");
    }
  });
  return button;
}
