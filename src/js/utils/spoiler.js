// Función para inicializar los botones de spoiler
export default function spoilers(editor) {
  document.querySelectorAll(".spoiler-toggle").forEach(function (button) {
    button.addEventListener("click", function () {
      var content = button.nextElementSibling;
      if (content.style.display === "none") {
        content.style.display = "block";
        editor.textContent = "Ocultar Spoiler";
      } else {
        content.style.display = "none";
        editor.textContent = "Mostar Spoiler";
      }
    });
  });
}
