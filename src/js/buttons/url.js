import wrapText from "../utils/wrapText.js";

export default function createURLButton(editor) {
  const button = document.createElement("button");
  button.type = "button";
  button.title = "Insertar URL";
  button.innerHTML = "<i class=\"fas fa-link\"></i>";

  button.addEventListener("click", () => {
    const url = prompt("Introduce la URL:");
    if (url) {
      const { selectionStart: start, selectionEnd: end, value } = editor.textarea;
      const selectedText = value.substring(start, end);

      if (selectedText) {
        wrapText(editor, `[url=${url}]`, "[/url]");
      } else {
        wrapText(editor, `[url]${url}[/url]`, "");
      }
    }
  });

  return button;
}
