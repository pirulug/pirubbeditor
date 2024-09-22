export default function wrapText(editor, tagStart, tagEnd) {
  const start = editor.textarea.selectionStart;
  const end = editor.textarea.selectionEnd;
  const selectedText = editor.textarea.value.substring(start, end);
  const beforeText = editor.textarea.value.substring(0, start);
  const afterText = editor.textarea.value.substring(end);

  editor.textarea.value =
    beforeText + tagStart + selectedText + tagEnd + afterText;
  editor.textarea.focus();
  editor.textarea.selectionStart = start + tagStart.length;
  editor.textarea.selectionEnd = end + tagStart.length;
}
