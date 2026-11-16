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
  const titleEl = document.createElement("h3");
  titleEl.className = "pirubbeditor-modal__title";
  titleEl.textContent = title;
  const closeBtn = document.createElement("button");
  closeBtn.type = "button";
  closeBtn.className = "pirubbeditor-modal__close";
  closeBtn.setAttribute("aria-label", "Cerrar");
  closeBtn.innerHTML = "&times;";
  header.appendChild(titleEl);
  header.appendChild(closeBtn);

  const body = document.createElement("div");
  body.className = "pirubbeditor-modal__body";

  if (customBody) {
    if (typeof customBody === "string") {
      body.innerHTML = customBody;
    } else {
      body.appendChild(customBody);
    }
  } else {
    const labelEl = document.createElement("label");
    labelEl.className = "pirubbeditor-modal__label";
    labelEl.textContent = label;
    const defaultInput = document.createElement("input");
    defaultInput.type = "text";
    defaultInput.className = "pirubbeditor-modal__input";
    defaultInput.value = defaultValue;
    defaultInput.placeholder = placeholder;
    body.appendChild(labelEl);
    body.appendChild(defaultInput);
  }

  const footer = document.createElement("div");
  footer.className = "pirubbeditor-modal__footer";
  const confirmBtn = document.createElement("button");
  confirmBtn.type = "button";
  confirmBtn.className = "pirubbeditor-modal__btn pirubbeditor-modal__btn--primary";
  confirmBtn.textContent = confirmText;
  const cancelBtn = document.createElement("button");
  cancelBtn.type = "button";
  cancelBtn.className = "pirubbeditor-modal__btn pirubbeditor-modal__btn--secondary";
  cancelBtn.textContent = cancelText;
  footer.appendChild(confirmBtn);
  footer.appendChild(cancelBtn);

  modal.appendChild(header);
  modal.appendChild(body);
  modal.appendChild(footer);
  overlay.appendChild(modal);
  editor.editorElement.appendChild(overlay);

  const input = modal.querySelector(".pirubbeditor-modal__input");

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
