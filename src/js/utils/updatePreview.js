import convertToHTML from "./convertToHTML";

import spoilers from "./spoiler";

export default function updatePreview(editor) {
  if (editor.previewType === "php") {
    fetch(editor.previewUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        text: editor.textarea.value,
      }),
    })
      .then((response) => response.text())
      .then((data) => {
        editor.previewArea.innerHTML = data;
        spoilers(editor);
      })
      .catch((error) => {
        console.error("Error al obtener la vista previa:", error);
      });
  } else if (editor.previewType === "js") {
    editor.previewArea.innerHTML = convertToHTML(editor.textarea.value);
    spoilers(editor);
  }
}
