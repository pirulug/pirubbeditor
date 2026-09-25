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

function handleBlockquoteEnter(editor, blockquote, range, sel, e) {
  e.preventDefault();

  const textAfterCaret = getRemainingTextInContainer(
    range.endContainer,
    range.endOffset,
    blockquote
  );

  const isAtEmptyLineAtEnd =
    !blockquote.textContent.trim() ||
    (isCaretAfterBr(range.startContainer, range.startOffset) &&
      !textAfterCaret.trim());

  if (isAtEmptyLineAtEnd) {
    // Salir de la cita: limpiar <br> finales e insertar <p><br></p> después de blockquote
    cleanTrailingBrs(blockquote);

    const p = document.createElement("p");
    p.innerHTML = "<br>";
    if (blockquote.nextSibling) {
      blockquote.parentNode.insertBefore(p, blockquote.nextSibling);
    } else {
      blockquote.parentNode.appendChild(p);
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

  // Insertar un salto de línea dentro de la cita sin duplicar el blockquote
  range.deleteContents();
  const br = document.createElement("br");
  range.insertNode(br);

  const next = br.nextSibling;
  if (!next || (next.nodeType === Node.TEXT_NODE && !next.textContent)) {
    const trailingBr = document.createElement("br");
    blockquote.appendChild(trailingBr);
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

function handleSpoilerEnter(editor, spoilerContent, range, sel, e) {
  e.preventDefault();

  const spoilerContainer =
    spoilerContent.closest(".spoiler") || spoilerContent;

  const textAfterCaret = getRemainingTextInContainer(
    range.endContainer,
    range.endOffset,
    spoilerContent
  );

  const isAtEmptyLineAtEnd =
    !spoilerContent.textContent.trim() ||
    (isCaretAfterBr(range.startContainer, range.startOffset) &&
      !textAfterCaret.trim());

  if (isAtEmptyLineAtEnd) {
    // Salir del spoiler: limpiar <br> finales e insertar <p><br></p> después de .spoiler
    cleanTrailingBrs(spoilerContent);

    const p = document.createElement("p");
    p.innerHTML = "<br>";
    if (spoilerContainer.nextSibling) {
      spoilerContainer.parentNode.insertBefore(p, spoilerContainer.nextSibling);
    } else {
      spoilerContainer.parentNode.appendChild(p);
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

  // Insertar un salto de línea dentro del spoiler sin duplicar el contenedor
  range.deleteContents();
  const br = document.createElement("br");
  range.insertNode(br);

  const next = br.nextSibling;
  if (!next || (next.nodeType === Node.TEXT_NODE && !next.textContent)) {
    const trailingBr = document.createElement("br");
    spoilerContent.appendChild(trailingBr);
  }

  const newRange = document.createRange();
  newRange.setStartAfter(br);
  newRange.collapse(true);
  sel.removeAllRanges();
  sel.addRange(newRange);

  editor.saveSelection();
  editor.syncToTextarea();
}

function handleVipEnter(editor, vipContent, range, sel, e) {
  e.preventDefault();

  const vipContainer = vipContent.closest(".vip-box") || vipContent;

  const textAfterCaret = getRemainingTextInContainer(
    range.endContainer,
    range.endOffset,
    vipContent
  );

  const isAtEmptyLineAtEnd =
    !vipContent.textContent.trim() ||
    (isCaretAfterBr(range.startContainer, range.startOffset) &&
      !textAfterCaret.trim());

  if (isAtEmptyLineAtEnd) {
    // Salir del bloque VIP: limpiar <br> finales e insertar <p><br></p> después de .vip-box
    cleanTrailingBrs(vipContent);

    const p = document.createElement("p");
    p.innerHTML = "<br>";
    if (vipContainer.nextSibling) {
      vipContainer.parentNode.insertBefore(p, vipContainer.nextSibling);
    } else {
      vipContainer.parentNode.appendChild(p);
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

  // Insertar un salto de línea dentro del contenido VIP sin duplicar el contenedor
  range.deleteContents();
  const br = document.createElement("br");
  range.insertNode(br);

  const next = br.nextSibling;
  if (!next || (next.nodeType === Node.TEXT_NODE && !next.textContent)) {
    const trailingBr = document.createElement("br");
    vipContent.appendChild(trailingBr);
  }

  const newRange = document.createRange();
  newRange.setStartAfter(br);
  newRange.collapse(true);
  sel.removeAllRanges();
  sel.addRange(newRange);

  editor.saveSelection();
  editor.syncToTextarea();
}

export function handlePreviewKeyDown(editor, e) {
  if (e.ctrlKey || e.metaKey) {
    if (e.key === "z") {
      e.preventDefault();
      editor.undo();
      return;
    }
    if (e.key === "y") {
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
      handleSpoilerEnter(editor, targetContent, range, sel, e);
      return;
    }

    // Manejo de VIP (.vip-content o .vip-box)
    const vipEl = elementNode.closest(".vip-content, .vip-box");
    if (vipEl && editor.previewArea.contains(vipEl)) {
      const targetContent = vipEl.classList.contains("vip-content")
        ? vipEl
        : vipEl.querySelector(".vip-content") || vipEl;
      handleVipEnter(editor, targetContent, range, sel, e);
      return;
    }

    // Manejo de Citas (blockquote)
    const blockquote = elementNode.closest("blockquote");
    if (blockquote && editor.previewArea.contains(blockquote)) {
      handleBlockquoteEnter(editor, blockquote, range, sel, e);
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

export function handlePreviewClick(editor, e) {
  if (e.target === editor.previewArea) {
    const last = editor.previewArea.lastElementChild;
    if (
      !last ||
      last.tagName.toLowerCase() !== "p" ||
      last.textContent.trim() !== ""
    ) {
      const p = document.createElement("p");
      p.innerHTML = "<br>";
      editor.previewArea.appendChild(p);

      const sel = window.getSelection();
      const range = document.createRange();
      range.setStart(p, 0);
      range.collapse(true);
      sel.removeAllRanges();
      sel.addRange(range);

      editor.saveSelection();
      editor.syncToTextarea();
    }
  }
}
