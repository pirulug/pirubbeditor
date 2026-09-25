import updatePreview from "./updatePreview.js";

export default function wrapText(editor, tagStart, tagEnd) {
  editor.restoreSelection();

  let start = editor.textarea.selectionStart;
  let end = editor.textarea.selectionEnd;

  if (
    editor.savedSelection?.type === "textarea" &&
    typeof editor.savedSelection.start === "number"
  ) {
    start = editor.savedSelection.start;
    end = editor.savedSelection.end;
  }

  const value = editor.textarea.value;
  const selectedText = value.substring(start, end);
  const beforeText = value.substring(0, start);
  const afterText = value.substring(end);

  editor.textarea.value = `${beforeText}${tagStart}${selectedText}${tagEnd}${afterText}`;
  editor.textarea.focus();
  editor.textarea.selectionStart = start + tagStart.length;
  editor.textarea.selectionEnd = end + tagStart.length;

  editor.saveSelection();
  editor.saveHistory();

  if (!editor.isCodeMode) {
    editor.syncToPreview();
  }
}
