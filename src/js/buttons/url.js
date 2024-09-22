import wrapText from "../utils/wrapText";

export default function createURLButton(editor) {
  const button = document.createElement("button");
  button.innerHTML = '<i class="fas fa-link"></i>';
  button.title = "Insertar URL";
  button.type = "button";

  button.addEventListener("click", () => {
    const url = prompt("Introduce la URL:");
    if (url) {
      const start = editor.textarea.selectionStart;
      const end = editor.textarea.selectionEnd;
      const selectedText = editor.textarea.value.substring(start, end);

      if (selectedText) {
        // Si hay texto seleccionado, usa [url=URL]texto[/url]
        wrapText(editor, `[url=${url}]`, "[/url]");
      } else {
        // Si no hay texto seleccionado, solo usa [url]URL[/url]
        wrapText(editor, `[url]${url}[/url]`, "");
      }
    }
  });

  return button;
}
