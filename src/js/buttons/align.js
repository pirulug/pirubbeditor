export function applyAlignment(editor, alignment) {
  if (editor.isCodeMode) {
    applyCodeAlignment(editor, alignment);
    return;
  }

  applyPreviewAlignment(editor, alignment);
}

function applyCodeAlignment(editor, alignment) {
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

  if (start !== end) {
    // Texto seleccionado
    const selected = value.substring(start, end);
    const cleaned = selected.replace(
      /^\[(left|center|right)\]([\s\S]*?)\[\/\1\]$/i,
      "$2"
    );
    const replacement = `[${alignment}]${cleaned}[/${alignment}]`;
    const before = value.substring(0, start);
    const after = value.substring(end);

    editor.textarea.value = `${before}${replacement}${after}`;
    editor.textarea.focus();
    editor.textarea.selectionStart = start;
    editor.textarea.selectionEnd = start + replacement.length;
  } else {
    // Sin selección: alinear la línea actual
    const lineStart = value.lastIndexOf("\n", start - 1) + 1;
    let lineEnd = value.indexOf("\n", start);
    if (lineEnd === -1) lineEnd = value.length;

    const lineText = value.substring(lineStart, lineEnd);
    const cleaned = lineText.replace(
      /^\[(left|center|right)\]([\s\S]*?)\[\/\1\]$/i,
      "$2"
    );
    const replacement = cleaned.trim()
      ? `[${alignment}]${cleaned.trim()}[/${alignment}]`
      : `[${alignment}][/${alignment}]`;

    const before = value.substring(0, lineStart);
    const after = value.substring(lineEnd);

    editor.textarea.value = `${before}${replacement}${after}`;
    editor.textarea.focus();

    if (cleaned.trim()) {
      editor.textarea.selectionStart = lineStart;
      editor.textarea.selectionEnd = lineStart + replacement.length;
    } else {
      const caretPos = lineStart + `[${alignment}]`.length;
      editor.textarea.selectionStart = caretPos;
      editor.textarea.selectionEnd = caretPos;
    }
  }

  editor.saveSelection();
  editor.saveHistory();
}

function getClosestBlock(node, container) {
  let curr = node.nodeType === Node.TEXT_NODE ? node.parentNode : node;
  while (curr && curr !== container) {
    const tag = curr.tagName ? curr.tagName.toLowerCase() : "";
    if (/^(p|div|h[1-6]|blockquote|li|pre)$/.test(tag)) {
      return curr;
    }
    curr = curr.parentNode;
  }
  return null;
}

function applyPreviewAlignment(editor, alignment) {
  editor.restoreSelection();

  const selection = window.getSelection();
  let range = null;

  if (
    selection &&
    selection.rangeCount > 0 &&
    editor.previewArea.contains(selection.anchorNode)
  ) {
    range = selection.getRangeAt(0);
  } else if (
    editor.savedSelection?.type === "range" &&
    editor.previewArea.contains(
      editor.savedSelection.range.commonAncestorContainer
    )
  ) {
    range = editor.savedSelection.range;
    selection.removeAllRanges();
    selection.addRange(range);
  } else {
    range = document.createRange();
    range.selectNodeContents(editor.previewArea);
    range.collapse(false);
    selection.removeAllRanges();
    selection.addRange(range);
  }

  const startBlock = getClosestBlock(range.startContainer, editor.previewArea);
  const endBlock = getClosestBlock(range.endContainer, editor.previewArea);

  if (startBlock && endBlock && startBlock === endBlock) {
    // Ambos extremos de la selección están en el mismo bloque
    startBlock.style.textAlign = alignment;
  } else if (startBlock && !endBlock) {
    startBlock.style.textAlign = alignment;
  } else if (!startBlock && endBlock) {
    endBlock.style.textAlign = alignment;
  } else if (startBlock && endBlock && startBlock !== endBlock) {
    // La selección abarca múltiples bloques
    const children = Array.from(editor.previewArea.children);
    let inRange = false;
    children.forEach((child) => {
      if (child === startBlock || child.contains(startBlock)) inRange = true;
      if (inRange && child.nodeType === Node.ELEMENT_NODE) {
        child.style.textAlign = alignment;
      }
      if (child === endBlock || child.contains(endBlock)) inRange = false;
    });
  } else {
    // No hay bloque contenedor específico (nodos de texto sueltos directamente en previewArea)
    if (!range.collapsed) {
      const selectedContent = range.extractContents();
      const div = document.createElement("div");
      div.style.textAlign = alignment;
      div.appendChild(selectedContent);
      range.insertNode(div);

      const newRange = document.createRange();
      newRange.selectNodeContents(div);
      selection.removeAllRanges();
      selection.addRange(newRange);
    } else {
      const div = document.createElement("div");
      div.style.textAlign = alignment;
      div.innerHTML = "<br>";
      range.insertNode(div);

      const newRange = document.createRange();
      newRange.setStart(div, 0);
      newRange.collapse(true);
      selection.removeAllRanges();
      selection.addRange(newRange);
    }
  }

  editor.saveSelection();
  editor.syncToTextarea();
}

export default function createAlignButton(
  editor,
  alignment,
  name,
  iconClass
) {
  const button = document.createElement("button");
  button.type = "button";
  button.title = name;
  button.innerHTML = `<i class="${iconClass}"></i>`;

  button.addEventListener("click", () => {
    applyAlignment(editor, alignment);
  });

  return button;
}
