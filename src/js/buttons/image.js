import wrapText from "../utils/wrapText";

export default function createImageButton(editor) {
  const button = document.createElement("button");
  button.innerHTML = '<i class="fas fa-image"></i>';
  button.title = "Insertar Imagen";
  button.type = "button";
  button.addEventListener("click", () => {
    const imageUrl = prompt("Introduce la URL de la imagen:");
    if (imageUrl) wrapText(editor, `[img]${imageUrl}[/img]`, "");
  });
  return button;
}
