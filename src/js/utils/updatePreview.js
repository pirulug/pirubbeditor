import convertToHTML from "./convertToHTML.js";
import spoilers from "./spoiler.js";

export default async function updatePreview(editor) {
  if (editor.previewType === "php") {
    try {
      const response = await fetch(editor.previewUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          text: editor.textarea.value,
        }),
      });
      const data = await response.text();
      editor.previewArea.innerHTML = data;
      spoilers(editor);
    } catch (error) {
      console.error("Error al obtener la vista previa:", error);
    }
  } else if (editor.previewType === "js") {
    editor.previewArea.innerHTML = convertToHTML(editor.textarea.value);
    spoilers(editor);
  }
}
