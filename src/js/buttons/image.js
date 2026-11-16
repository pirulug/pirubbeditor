import { applyFormat } from "../utils/formatHelper.js";
import createModal from "../utils/modal.js";
import { sanitizeUrl, sanitizeCssDimension } from "../utils/sanitize.js";

export default function createImageButton(editor) {
  const button = document.createElement("button");
  button.type = "button";
  button.title = "Insertar Imagen";
  button.innerHTML = "<i class=\"fas fa-image\"></i>";

  button.addEventListener("click", () => {
    const customBody = document.createElement("div");

    const urlLabel = document.createElement("label");
    urlLabel.className = "pirubbeditor-modal__label";
    urlLabel.textContent = "URL de la imagen:";
    const urlInput = document.createElement("input");
    urlInput.type = "text";
    urlInput.className = "pirubbeditor-modal__input";
    urlInput.placeholder = "https://ejemplo.com/imagen.jpg";

    const dimensionsRow = document.createElement("div");
    dimensionsRow.style.display = "flex";
    dimensionsRow.style.gap = "0.75rem";
    dimensionsRow.style.marginTop = "0.75rem";

    const widthCol = document.createElement("div");
    widthCol.style.flex = "1";
    const widthLabel = document.createElement("label");
    widthLabel.className = "pirubbeditor-modal__label";
    widthLabel.textContent = "Ancho (opcional):";
    const widthInput = document.createElement("input");
    widthInput.type = "text";
    widthInput.className = "pirubbeditor-modal__input";
    widthInput.placeholder = "ej. 400 o 100%";
    widthCol.appendChild(widthLabel);
    widthCol.appendChild(widthInput);

    const heightCol = document.createElement("div");
    heightCol.style.flex = "1";
    const heightLabel = document.createElement("label");
    heightLabel.className = "pirubbeditor-modal__label";
    heightLabel.textContent = "Alto (opcional):";
    const heightInput = document.createElement("input");
    heightInput.type = "text";
    heightInput.className = "pirubbeditor-modal__input";
    heightInput.placeholder = "ej. 300 o auto";
    heightCol.appendChild(heightLabel);
    heightCol.appendChild(heightInput);

    dimensionsRow.appendChild(widthCol);
    dimensionsRow.appendChild(heightCol);

    customBody.appendChild(urlLabel);
    customBody.appendChild(urlInput);
    customBody.appendChild(dimensionsRow);

    createModal(editor, {
      title: "Insertar Imagen",
      customBody,
      confirmText: "Guardar",
      cancelText: "Cancelar",
      onConfirm: () => {
        const cleanUrl = urlInput.value.trim();
        if (!cleanUrl) return;

        const safeUrl = sanitizeUrl(cleanUrl);
        if (!safeUrl) {
          alert("URL de imagen no válida o protocolo no permitido");
          return;
        }

        const widthVal = sanitizeCssDimension(widthInput.value);
        const heightVal = sanitizeCssDimension(heightInput.value);

        let bbTag = "[img";
        let styleStr = "";

        if (widthVal) {
          const wClean = widthVal.replace("px", "");
          bbTag += ` width=${wClean}`;
          styleStr += `width:${widthVal};`;
        }
        if (heightVal) {
          const hClean = heightVal.replace("px", "");
          bbTag += ` height=${hClean}`;
          styleStr += `height:${heightVal};`;
        }
        bbTag += `]${cleanUrl}[/img]`;

        const styleAttr = styleStr ? ` style="${styleStr}"` : "";
        const htmlTag = `<img src="${safeUrl}"${styleAttr} alt="Image">`;

        applyFormat(editor, bbTag, "", htmlTag);
      },
    });

    setTimeout(() => urlInput.focus(), 50);
  });

  return button;
}
