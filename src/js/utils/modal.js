export default function createModal(editor, {
  title = "Ventana",
  label = "Introduce el valor:",
  placeholder = "",
  defaultValue = "",
  customBody = null,
  confirmText = "Guardar",
  cancelText = "Cancelar",
  onConfirm = () => {},
}) {
  // Guardar la posición actual del cursor antes de que el modal tome el foco
  if (typeof editor.saveSelection === "function") {
    editor.saveSelection();
  }

  // Eliminar modal existente si lo hubiera
  const existingModal = editor.editorElement.querySelector(".pirubbeditor-modal-overlay");
  if (existingModal) {
    existingModal.remove();
  }

  const overlay = document.createElement("div");
  overlay.className = "pirubbeditor-modal-overlay";

  const modal = document.createElement("div");
  modal.className = "pirubbeditor-modal";

  const header = document.createElement("div");
  header.className = "pirubbeditor-modal__header";
  header.innerHTML = `
    <h3 class="pirubbeditor-modal__title">${title}</h3>
    <button type="button" class="pirubbeditor-modal__close" aria-label="Cerrar">&times;</button>
  `;

  const body = document.createElement("div");
  body.className = "pirubbeditor-modal__body";

  if (customBody) {
    if (typeof customBody === "string") {
      body.innerHTML = customBody;
    } else {
      body.appendChild(customBody);
    }
  } else {
    body.innerHTML = `
      <label class="pirubbeditor-modal__label">${label}</label>
      <input type="text" class="pirubbeditor-modal__input" value="${defaultValue}" placeholder="${placeholder}" />
    `;
  }

  const footer = document.createElement("div");
  footer.className = "pirubbeditor-modal__footer";
  footer.innerHTML = `
    <button type="button" class="pirubbeditor-modal__btn pirubbeditor-modal__btn--primary">${confirmText}</button>
    <button type="button" class="pirubbeditor-modal__btn pirubbeditor-modal__btn--secondary">${cancelText}</button>
  `;

  modal.appendChild(header);
  modal.appendChild(body);
  modal.appendChild(footer);
  overlay.appendChild(modal);
  editor.editorElement.appendChild(overlay);

  const input = modal.querySelector(".pirubbeditor-modal__input");
  const closeBtn = modal.querySelector(".pirubbeditor-modal__close");
  const cancelBtn = modal.querySelector(".pirubbeditor-modal__btn--secondary");
  const confirmBtn = modal.querySelector(".pirubbeditor-modal__btn--primary");

  const closeModal = () => {
    overlay.remove();
  };

  const handleConfirm = () => {
    const val = input ? input.value : "";
    closeModal();
    onConfirm(val, modal);
  };

  closeBtn.addEventListener("click", closeModal);
  cancelBtn.addEventListener("click", closeModal);
  confirmBtn.addEventListener("click", handleConfirm);

  modal.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && e.target.tagName.toLowerCase() === "input") {
      e.preventDefault();
      handleConfirm();
    } else if (e.key === "Escape") {
      e.preventDefault();
      closeModal();
    }
  });

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) {
      closeModal();
    }
  });

  if (input) {
    setTimeout(() => input.focus(), 50);
  }

  return { modal, overlay, closeModal, input };
}
