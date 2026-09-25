export default function wrapText(editor, tagStart, tagEnd) {
  const { selectionStart: start, selectionEnd: end, value } = editor.textarea;
  const selectedText = value.substring(start, end);
  const beforeText = value.substring(0, start);
  const afterText = value.substring(end);

  editor.textarea.value = `${beforeText}${tagStart}${selectedText}${tagEnd}${afterText}`;
  editor.textarea.focus();
  editor.textarea.selectionStart = start + tagStart.length;
  editor.textarea.selectionEnd = end + tagStart.length;
}
