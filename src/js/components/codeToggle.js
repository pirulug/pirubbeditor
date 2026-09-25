export default function createCodeButton(editor) {
  const button = document.createElement("button");
  button.type = "button";
  button.title = "Ver Código Fuente";
  button.innerHTML = "<i class=\"fas fa-code\"></i>";

  button.addEventListener("click", () => {
    editor.toggleCodeView(button);
  });

  return button;
}
