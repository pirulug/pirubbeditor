import wrapText from "../utils/wrapText.js";

export default function createImageButton(editor) {
  const button = document.createElement("button");
  button.type = "button";
  button.title = "Insertar Imagen";
  button.innerHTML = "<i class=\"fas fa-image\"></i>";
  button.addEventListener("click", () => {
    const imageUrl = prompt("Introduce la URL de la imagen:");
    if (imageUrl) {
      wrapText(editor, `[img]${imageUrl}[/img]`, "");
    }
  });
  return button;
}
