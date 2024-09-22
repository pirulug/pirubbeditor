import updatePreview from "../utils/updatePreview";

export default function createPreviewButton(editor) {
  const button = document.createElement("button");
  button.innerHTML = '<i class="fas fa-eye"></i>';
  button.title = "Toggle Preview";
  button.type = "button";

  let previewVisible = false;
  button.addEventListener("click", () => {
    previewVisible = !previewVisible;
    if (previewVisible) {
      updatePreview(editor);
      editor.textarea.style.display = "none";
      editor.previewArea.style.display = "block";
      editor.disableOtherButtons(button);
    } else {
      editor.textarea.style.display = "block";
      editor.previewArea.style.display = "none";
      editor.enableOtherButtons();
    }
  });
  return button;
}
