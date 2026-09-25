// Función para inicializar los botones de spoiler
export default function spoilers(editor) {
  const scope = editor.previewArea || document;

  scope.querySelectorAll(".spoiler-toggle").forEach((button) => {
    button.addEventListener("click", () => {
      const content = button.nextElementSibling;
      if (!content) return;

      const isHidden = content.style.display === "none";
      content.style.display = isHidden ? "block" : "none";
      button.textContent = isHidden ? "Ocultar Spoiler" : "Mostrar Spoiler";
    });
  });
}
