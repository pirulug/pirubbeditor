import { applyFormat } from "../utils/formatHelper.js";
import createModal from "../utils/modal.js";

const YOUTUBE_REGEX =
  /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;

function extractYouTubeVideoId(url) {
  const match = url.match(YOUTUBE_REGEX);
  return match ? match[1] : null;
}

function openYouTubeModal(editor) {
  const customBody = document.createElement("div");

  const urlLabel = document.createElement("label");
  urlLabel.className = "pirubbeditor-modal__label";
  urlLabel.textContent = "URL del video de YouTube:";
  const urlInput = document.createElement("input");
  urlInput.type = "text";
  urlInput.className = "pirubbeditor-modal__input";
  urlInput.placeholder = "https://www.youtube.com/watch?v=...";

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
  widthInput.placeholder = "ej. 560 o 100%";
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
  heightInput.placeholder = "ej. 315";
  heightCol.appendChild(heightLabel);
  heightCol.appendChild(heightInput);

  dimensionsRow.appendChild(widthCol);
  dimensionsRow.appendChild(heightCol);

  customBody.appendChild(urlLabel);
  customBody.appendChild(urlInput);
  customBody.appendChild(dimensionsRow);

  createModal(editor, {
    title: "Insertar YouTube",
    customBody,
    confirmText: "Guardar",
    cancelText: "Cancelar",
    onConfirm: () => {
      const rawUrl = urlInput.value.trim();
      if (!rawUrl) return;

      const videoId = extractYouTubeVideoId(rawUrl);
      if (!videoId) {
        alert("URL de YouTube no válida");
        return;
      }

      const widthVal = widthInput.value.trim();
      const heightVal = heightInput.value.trim();

      let bbTag = "[youtube";
      let styleStr = "max-width:100%;";

      if (widthVal) {
        const wClean = widthVal.replace("px", "");
        bbTag += ` width=${wClean}`;
        styleStr += `width:${/^\d+$/.test(widthVal) ? widthVal + "px" : widthVal};`;
      }
      if (heightVal) {
        const hClean = heightVal.replace("px", "");
        bbTag += ` height=${hClean}`;
        styleStr += `height:${/^\d+$/.test(heightVal) ? heightVal + "px" : heightVal};`;
      }
      bbTag += `]${videoId}[/youtube]`;

      const htmlTag = `<lite-youtube contenteditable="false" videoid="${videoId}" style="${styleStr}"></lite-youtube>`;

      applyFormat(editor, bbTag, "", htmlTag);
    },
  });

  setTimeout(() => urlInput.focus(), 50);
}

export default function createYouTubeButton(editor) {
  const button = document.createElement("button");
  button.type = "button";
  button.title = "YouTube";
  button.innerHTML = "<i class=\"fab fa-youtube\"></i>";
  button.addEventListener("click", () => openYouTubeModal(editor));
  return button;
}
