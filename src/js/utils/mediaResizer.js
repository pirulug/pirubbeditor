export default function initMediaResizer(editor) {
  let activeImage = null;
  let isDragging = false;
  let dragData = null;

  // Crear contenedor de redimensión y controles flotantes exclusivo para imágenes
  const resizerContainer = document.createElement("div");
  resizerContainer.className = "pirubbeditor-resizer";
  resizerContainer.style.display = "none";

  // Esquinas visuales decorativas (estilo marco)
  const cornerNW = document.createElement("div");
  cornerNW.className = "pirubbeditor-resizer__corner pirubbeditor-resizer__corner--nw";
  const cornerNE = document.createElement("div");
  cornerNE.className = "pirubbeditor-resizer__corner pirubbeditor-resizer__corner--ne";
  const cornerSW = document.createElement("div");
  cornerSW.className = "pirubbeditor-resizer__corner pirubbeditor-resizer__corner--sw";
  const cornerSE = document.createElement("div");
  cornerSE.className = "pirubbeditor-resizer__corner pirubbeditor-resizer__corner--se";

  // Puntos de arrastre para redimensionar
  const handleNW = document.createElement("div");
  handleNW.className = "pirubbeditor-resizer__handle pirubbeditor-resizer__handle--nw";
  handleNW.dataset.handle = "nw";

  const handleNE = document.createElement("div");
  handleNE.className = "pirubbeditor-resizer__handle pirubbeditor-resizer__handle--ne";
  handleNE.dataset.handle = "ne";

  const handleSW = document.createElement("div");
  handleSW.className = "pirubbeditor-resizer__handle pirubbeditor-resizer__handle--sw";
  handleSW.dataset.handle = "sw";

  const handleSE = document.createElement("div");
  handleSE.className = "pirubbeditor-resizer__handle pirubbeditor-resizer__handle--se";
  handleSE.dataset.handle = "se";

  // Etiqueta informativa de dimensiones
  const infoBadge = document.createElement("div");
  infoBadge.className = "pirubbeditor-resizer__info";

  // Barra de herramientas flotante con opciones
  const toolbar = document.createElement("div");
  toolbar.className = "pirubbeditor-resizer__toolbar";
  toolbar.innerHTML = `
    <div class="pirubbeditor-resizer__arrow"></div>
    <div class="pirubbeditor-resizer__btn-group">
      <button type="button" class="pirubbeditor-resizer__btn" data-action="100%" title="Tamaño 100%">100%</button>
      <button type="button" class="pirubbeditor-resizer__btn" data-action="50%" title="Tamaño 50%">50%</button>
      <button type="button" class="pirubbeditor-resizer__btn" data-action="25%" title="Tamaño 25%">25%</button>
      <button type="button" class="pirubbeditor-resizer__btn" data-action="reset" title="Restablecer tamaño original">
        <i class="fas fa-sync-alt"></i>
      </button>
    </div>
    <div class="pirubbeditor-resizer__btn-group">
      <button type="button" class="pirubbeditor-resizer__btn" data-action="float-left" title="Alinear a la izquierda">
        <i class="fas fa-align-left"></i>
      </button>
      <button type="button" class="pirubbeditor-resizer__btn" data-action="align-center" title="Centrar">
        <i class="fas fa-align-center"></i>
      </button>
      <button type="button" class="pirubbeditor-resizer__btn" data-action="float-right" title="Alinear a la derecha">
        <i class="fas fa-align-right"></i>
      </button>
      <button type="button" class="pirubbeditor-resizer__btn" data-action="remove-float" title="Quitar flotación">
        <i class="fas fa-undo-alt"></i>
      </button>
    </div>
    <button type="button" class="pirubbeditor-resizer__btn pirubbeditor-resizer__btn--delete" data-action="delete" title="Eliminar">
      <i class="fas fa-trash-alt"></i>
    </button>
  `;

  resizerContainer.appendChild(cornerNW);
  resizerContainer.appendChild(cornerNE);
  resizerContainer.appendChild(cornerSW);
  resizerContainer.appendChild(cornerSE);
  resizerContainer.appendChild(handleNW);
  resizerContainer.appendChild(handleNE);
  resizerContainer.appendChild(handleSW);
  resizerContainer.appendChild(handleSE);
  resizerContainer.appendChild(infoBadge);
  resizerContainer.appendChild(toolbar);

  editor.editorElement.appendChild(resizerContainer);

  function updateInfoBadge() {
    if (!activeImage) return;
    const currentW = Math.round(activeImage.getBoundingClientRect().width);
    const currentH = Math.round(activeImage.getBoundingClientRect().height);

    let origText = "";
    const natW = activeImage.naturalWidth;
    const natH = activeImage.naturalHeight;
    if (natW && natH) {
      origText = `<div class="pirubbeditor-resizer__info-orig">(Original: ${natW}x${natH})</div>`;
    }

    infoBadge.innerHTML = `
      <div class="pirubbeditor-resizer__info-current">${currentW}x${currentH}</div>
      ${origText}
    `;
  }

  function updatePosition() {
    if (!activeImage || !editor.previewArea.contains(activeImage)) {
      hide();
      return;
    }

    const editorRect = editor.editorElement.getBoundingClientRect();
    const mediaRect = activeImage.getBoundingClientRect();

    const top = mediaRect.top - editorRect.top;
    const left = mediaRect.left - editorRect.left;
    const width = mediaRect.width;
    const height = mediaRect.height;

    resizerContainer.style.top = `${top}px`;
    resizerContainer.style.left = `${left}px`;
    resizerContainer.style.width = `${width}px`;
    resizerContainer.style.height = `${height}px`;
    resizerContainer.style.display = "block";

    updateInfoBadge();
    updateToolbarPosition(top, left, width, height, editorRect);
  }

  function updateToolbarPosition(top, left, width, height, editorRect) {
    const toolbarHeight = 44;
    const spaceBelow = editorRect.height - (top + height);

    if (spaceBelow < toolbarHeight + 16 && top > toolbarHeight + 16) {
      toolbar.style.top = `${-toolbarHeight - 8}px`;
      toolbar.classList.add("pirubbeditor-resizer__toolbar--top");
      toolbar.classList.remove("pirubbeditor-resizer__toolbar--bottom");
    } else {
      toolbar.style.top = `${height + 8}px`;
      toolbar.classList.add("pirubbeditor-resizer__toolbar--bottom");
      toolbar.classList.remove("pirubbeditor-resizer__toolbar--top");
    }
  }

  function show(imageElement) {
    activeImage = imageElement;
    updatePosition();
  }

  function hide() {
    activeImage = null;
    resizerContainer.style.display = "none";
  }

  // Eventos de clic en el área de vista previa: solo para imágenes (<img>)
  editor.previewArea.addEventListener("click", (e) => {
    const image = e.target.closest("img");
    if (image && editor.previewArea.contains(image)) {
      e.stopPropagation();
      show(image);
    } else if (!resizerContainer.contains(e.target)) {
      hide();
    }
  });

  // Evitar perder selección al interactuar con el resizer o la barra flotante
  resizerContainer.addEventListener("mousedown", (e) => {
    e.stopPropagation();
  });

  // Acciones de los botones de la barra flotante
  toolbar.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn || !activeImage) return;

    e.preventDefault();
    e.stopPropagation();

    const action = btn.dataset.action;

    switch (action) {
      case "100%":
        activeImage.style.width = "100%";
        activeImage.style.height = "auto";
        break;
      case "50%":
        activeImage.style.width = "50%";
        activeImage.style.height = "auto";
        break;
      case "25%":
        activeImage.style.width = "25%";
        activeImage.style.height = "auto";
        break;
      case "reset":
        if (activeImage.naturalWidth) {
          activeImage.style.width = `${activeImage.naturalWidth}px`;
          activeImage.style.height = `${activeImage.naturalHeight}px`;
        } else {
          activeImage.style.width = "";
          activeImage.style.height = "";
        }
        break;
      case "float-left":
        activeImage.style.float = "left";
        activeImage.style.display = "inline-block";
        activeImage.style.margin = "0 1rem 0.5rem 0";
        break;
      case "align-center":
        activeImage.style.float = "none";
        activeImage.style.display = "block";
        activeImage.style.margin = "0.5rem auto";
        break;
      case "float-right":
        activeImage.style.float = "right";
        activeImage.style.display = "inline-block";
        activeImage.style.margin = "0 0 0.5rem 1rem";
        break;
      case "remove-float":
        activeImage.style.float = "none";
        activeImage.style.display = "inline-block";
        activeImage.style.margin = "0.5rem 0";
        break;
      case "delete": {
        const target = activeImage;
        hide();
        target.remove();
        editor.syncToTextarea();
        return;
      }
    }

    updatePosition();
    editor.syncToTextarea();
  });

  // Lógica de arrastre para redimensionar imágenes preservando aspecto natural
  function onMouseDownHandle(e) {
    if (!activeImage) return;
    e.preventDefault();
    e.stopPropagation();

    isDragging = true;
    const handleType = e.target.dataset.handle;
    const mediaRect = activeImage.getBoundingClientRect();

    let startW = mediaRect.width || activeImage.naturalWidth || 240;
    let startH = mediaRect.height || activeImage.naturalHeight || 240;

    const ratio = startH > 0 ? startW / startH : 1;

    dragData = {
      handle: handleType,
      startX: e.clientX,
      startY: e.clientY,
      startWidth: startW,
      startHeight: startH,
      aspectRatio: ratio,
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  }

  function onMouseMove(e) {
    if (!isDragging || !activeImage || !dragData) return;

    const deltaX = e.clientX - dragData.startX;
    const deltaY = e.clientY - dragData.startY;

    let dirX = 1;
    let dirY = 1;

    if (dragData.handle === "se") {
      dirX = 1;
      dirY = 1;
    } else if (dragData.handle === "sw") {
      dirX = -1;
      dirY = 1;
    } else if (dragData.handle === "ne") {
      dirX = 1;
      dirY = -1;
    } else if (dragData.handle === "nw") {
      dirX = -1;
      dirY = -1;
    }

    const relX = (deltaX * dirX) / dragData.startWidth;
    const relY = (deltaY * dirY) / dragData.startHeight;

    let scale;
    if (Math.abs(relY) > Math.abs(relX)) {
      scale = (dragData.startHeight + deltaY * dirY) / dragData.startHeight;
    } else {
      scale = (dragData.startWidth + deltaX * dirX) / dragData.startWidth;
    }

    scale = Math.max(0.05, scale);

    let newWidth = Math.round(dragData.startWidth * scale);
    const containerWidth = editor.previewArea.clientWidth - 20;
    if (newWidth > containerWidth) {
      newWidth = containerWidth;
    }

    newWidth = Math.max(40, newWidth);
    let newHeight = Math.round(newWidth / dragData.aspectRatio);
    newHeight = Math.max(25, newHeight);

    activeImage.style.width = `${newWidth}px`;
    activeImage.style.height = `${newHeight}px`;

    updatePosition();
  }

  function onMouseUp() {
    if (!isDragging) return;
    isDragging = false;
    dragData = null;

    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mouseup", onMouseUp);

    if (activeImage) {
      updatePosition();
      editor.syncToTextarea();
    }
  }

  handleNW.addEventListener("mousedown", onMouseDownHandle);
  handleNE.addEventListener("mousedown", onMouseDownHandle);
  handleSW.addEventListener("mousedown", onMouseDownHandle);
  handleSE.addEventListener("mousedown", onMouseDownHandle);

  // Ocultar al hacer scroll o resize de ventana
  window.addEventListener("resize", () => {
    if (activeImage) updatePosition();
  });

  window.addEventListener("scroll", () => {
    if (activeImage) updatePosition();
  }, true);

  document.addEventListener("click", (e) => {
    if (!editor.editorElement.contains(e.target)) {
      hide();
    }
  });

  return {
    show,
    hide,
    updatePosition,
  };
}
