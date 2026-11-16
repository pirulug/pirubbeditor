function cleanTrailingBrs(container) {
  while (container.lastChild) {
    const last = container.lastChild;
    if (last.nodeName === "BR") {
      container.removeChild(last);
    } else if (last.nodeType === Node.TEXT_NODE && !last.textContent.trim()) {
      container.removeChild(last);
    } else {
      break;
    }
  }
}

function isCaretAfterBr(containerNode, offset) {
  if (containerNode.nodeType === Node.ELEMENT_NODE) {
    if (offset > 0) {
      const prevNode = containerNode.childNodes[offset - 1];
      if (prevNode && prevNode.nodeName === "BR") return true;
    }
  } else if (containerNode.nodeType === Node.TEXT_NODE) {
    if (offset === 0) {
      const prev = containerNode.previousSibling;
      if (prev && prev.nodeName === "BR") return true;
    }
  }
  return false;
}

function getRemainingTextInContainer(containerNode, offset, rootContainer) {
  const range = document.createRange();
  try {
    range.setStart(containerNode, offset);
    range.setEndAfter(rootContainer.lastChild || rootContainer);
    return range.toString();
  } catch {
    return "";
  }
}

function handleContainerBlockEnter(editor, contentEl, wrapperEl, range, sel, e) {
  e.preventDefault();

  const textAfterCaret = getRemainingTextInContainer(
    range.endContainer,
    range.endOffset,
    contentEl
  );

  const isAtEmptyLineAtEnd =
    !contentEl.textContent.trim() ||
    (isCaretAfterBr(range.startContainer, range.startOffset) &&
      !textAfterCaret.trim());

  if (isAtEmptyLineAtEnd) {
    // Salir del bloque: limpiar <br> finales e insertar <p><br></p> después del contenedor
    cleanTrailingBrs(contentEl);

    const p = document.createElement("p");
    p.innerHTML = "<br>";
    if (wrapperEl.nextSibling) {
      wrapperEl.parentNode.insertBefore(p, wrapperEl.nextSibling);
    } else {
      wrapperEl.parentNode.appendChild(p);
    }

    const newRange = document.createRange();
    newRange.setStart(p, 0);
    newRange.collapse(true);
    sel.removeAllRanges();
    sel.addRange(newRange);

    editor.saveSelection();
    editor.syncToTextarea();
    return;
  }

  // Insertar un salto de línea dentro del bloque sin duplicar el contenedor
  range.deleteContents();
  const br = document.createElement("br");
  range.insertNode(br);

  const next = br.nextSibling;
  if (!next || (next.nodeType === Node.TEXT_NODE && !next.textContent)) {
    const trailingBr = document.createElement("br");
    contentEl.appendChild(trailingBr);
  }

  const newRange = document.createRange();
  newRange.setStartAfter(br);
  newRange.collapse(true);
  sel.removeAllRanges();
  sel.addRange(newRange);

  editor.saveSelection();
  editor.syncToTextarea();
}

function handleHeadingEnter(editor, heading, range, sel, e) {
  e.preventDefault();

  const textAfter = getRemainingTextInContainer(
    range.endContainer,
    range.endOffset,
    heading
  );

  if (!textAfter.trim()) {
    const p = document.createElement("p");
    p.innerHTML = "<br>";
    if (heading.nextSibling) {
      heading.parentNode.insertBefore(p, heading.nextSibling);
    } else {
      heading.parentNode.appendChild(p);
    }

    const newRange = document.createRange();
    newRange.setStart(p, 0);
    newRange.collapse(true);
    sel.removeAllRanges();
    sel.addRange(newRange);
  } else {
    const extracted = range.extractContents();
    const p = document.createElement("p");
    if (extracted.textContent.trim()) {
      p.appendChild(extracted);
    } else {
      p.innerHTML = "<br>";
    }

    if (heading.nextSibling) {
      heading.parentNode.insertBefore(p, heading.nextSibling);
    } else {
      heading.parentNode.appendChild(p);
    }

    const newRange = document.createRange();
    newRange.setStart(p, 0);
    newRange.collapse(true);
    sel.removeAllRanges();
    sel.addRange(newRange);
  }

  editor.saveSelection();
  editor.syncToTextarea();
}

function handleListEnter(editor, li, range, sel, e) {
  if (!li.textContent.trim()) {
    e.preventDefault();
    const list = li.closest("ul, ol");
    li.remove();

    const p = document.createElement("p");
    p.innerHTML = "<br>";

    if (list && list.parentNode) {
      if (list.children.length === 0) {
        list.parentNode.replaceChild(p, list);
      } else if (list.nextSibling) {
        list.parentNode.insertBefore(p, list.nextSibling);
      } else {
        list.parentNode.appendChild(p);
      }
    } else {
      editor.previewArea.appendChild(p);
    }

    const newRange = document.createRange();
    newRange.setStart(p, 0);
    newRange.collapse(true);
    sel.removeAllRanges();
    sel.addRange(newRange);

    editor.saveSelection();
    editor.syncToTextarea();
  }
}

export function handlePreviewKeyDown(editor, e) {
  if ((e.ctrlKey || e.metaKey) && !e.altKey) {
    const key = e.key.toLowerCase();
    if (key === "z" && !e.shiftKey) {
      e.preventDefault();
      editor.undo();
      return;
    }
    if ((key === "y" && !e.shiftKey) || (key === "z" && e.shiftKey)) {
      e.preventDefault();
      editor.redo();
      return;
    }
  }

  if (e.key === "Enter") {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);

    const anchorNode = range.startContainer;
    const elementNode =
      anchorNode.nodeType === Node.ELEMENT_NODE
        ? anchorNode
        : anchorNode.parentElement;

    if (!elementNode || !editor.previewArea.contains(elementNode)) return;

    // Manejo de Spoilers (.spoiler-content o .spoiler)
    const spoilerEl = elementNode.closest(".spoiler-content, .spoiler");
    if (spoilerEl && editor.previewArea.contains(spoilerEl)) {
      const targetContent = spoilerEl.classList.contains("spoiler-content")
        ? spoilerEl
        : spoilerEl.querySelector(".spoiler-content") || spoilerEl;
      const spoilerWrapper = targetContent.closest(".spoiler") || targetContent;
      handleContainerBlockEnter(editor, targetContent, spoilerWrapper, range, sel, e);
      return;
    }

    // Manejo de VIP (.vip-content o .vip-box)
    const vipEl = elementNode.closest(".vip-content, .vip-box");
    if (vipEl && editor.previewArea.contains(vipEl)) {
      const targetContent = vipEl.classList.contains("vip-content")
        ? vipEl
        : vipEl.querySelector(".vip-content") || vipEl;
      const vipWrapper = targetContent.closest(".vip-box") || targetContent;
      handleContainerBlockEnter(editor, targetContent, vipWrapper, range, sel, e);
      return;
    }

    // Manejo de Citas (blockquote)
    const blockquote = elementNode.closest("blockquote");
    if (blockquote && editor.previewArea.contains(blockquote)) {
      handleContainerBlockEnter(editor, blockquote, blockquote, range, sel, e);
      return;
    }

    // Manejo de Encabezados (h1 - h6)
    const heading = elementNode.closest("h1, h2, h3, h4, h5, h6");
    if (heading && editor.previewArea.contains(heading)) {
      handleHeadingEnter(editor, heading, range, sel, e);
      return;
    }

    // Manejo de Listas (li)
    const li = elementNode.closest("li");
    if (li && editor.previewArea.contains(li)) {
      handleListEnter(editor, li, range, sel, e);
      return;
    }
  }
}

function getContentBottom(previewArea) {
  let maxBottom = 0;
  for (const child of previewArea.childNodes) {
    if (child.nodeType === Node.ELEMENT_NODE) {
      const rect = child.getBoundingClientRect();
      if (rect.bottom > maxBottom) {
        maxBottom = rect.bottom;
      }
    } else if (child.nodeType === Node.TEXT_NODE && child.textContent.trim()) {
      const range = document.createRange();
      range.selectNodeContents(child);
      const rect = range.getBoundingClientRect();
      if (rect.bottom > maxBottom) {
        maxBottom = rect.bottom;
      }
    }
  }
  if (maxBottom === 0) {
    maxBottom = previewArea.getBoundingClientRect().top;
  }
  return maxBottom;
}

export function handlePreviewClick(editor, e) {
  if (e.target !== editor.previewArea) return;

  const contentBottom = getContentBottom(editor.previewArea);

  // Solo actuar si el clic ocurrió claramente por debajo de todo el contenido existente
  if (e.clientY <= contentBottom + 15) {
    return;
  }

  const last = editor.previewArea.lastElementChild;
  if (
    last &&
    last.tagName.toLowerCase() === "p" &&
    last.textContent.trim() === ""
  ) {
    // Si ya existe un párrafo vacío al final, enfocarlo
    const sel = window.getSelection();
    if (sel) {
      const range = document.createRange();
      range.setStart(last, 0);
      range.collapse(true);
      sel.removeAllRanges();
      sel.addRange(range);
      editor.saveSelection();
    }
    return;
  }

  // Insertar un nuevo párrafo al final para permitir escribir fuera de bloques o al fondo del editor
  const p = document.createElement("p");
  p.innerHTML = "<br>";
  editor.previewArea.appendChild(p);

  const sel = window.getSelection();
  if (sel) {
    const range = document.createRange();
    range.setStart(p, 0);
    range.collapse(true);
    sel.removeAllRanges();
    sel.addRange(range);
  }

  editor.saveSelection();
  editor.syncToTextarea();
}
