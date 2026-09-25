import wrapText from "./wrapText.js";
import spoilers from "./spoiler.js";

const INLINE_TAGS = {
  "[b]": "strong",
  "[i]": "em",
  "[u]": "u",
  "[s]": "s",
};

function findAncestorTag(node, tagName, container) {
  let curr = node.nodeType === Node.TEXT_NODE ? node.parentNode : node;
  const target = tagName.toLowerCase();
  while (curr && curr !== container) {
    if (curr.tagName && curr.tagName.toLowerCase() === target) {
      return curr;
    }
    curr = curr.parentNode;
  }
  return null;
}

function applyInlineFormat(editor, tagName) {
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

  const ancestor = findAncestorTag(
    range.commonAncestorContainer,
    tagName,
    editor.previewArea
  );

  if (ancestor) {
    if (!range.collapsed) {
      // Desactivar / desenvolver formato existente
      const parent = ancestor.parentNode;
      while (ancestor.firstChild) {
        parent.insertBefore(ancestor.firstChild, ancestor);
      }
      ancestor.remove();
    } else {
      // Si el cursor está colapsado dentro de la etiqueta, salir de ella
      const newRange = document.createRange();
      newRange.setStartAfter(ancestor);
      newRange.collapse(true);
      selection.removeAllRanges();
      selection.addRange(newRange);
    }
  } else {
    if (!range.collapsed) {
      const selectedContent = range.extractContents();
      const wrapper = document.createElement(tagName);
      wrapper.appendChild(selectedContent);
      range.insertNode(wrapper);

      const newRange = document.createRange();
      newRange.selectNodeContents(wrapper);
      selection.removeAllRanges();
      selection.addRange(newRange);
    } else {
      const wrapper = document.createElement(tagName);
      const textNode = document.createTextNode("\u200B");
      wrapper.appendChild(textNode);
      range.insertNode(wrapper);

      const newRange = document.createRange();
      newRange.setStart(textNode, 1);
      newRange.collapse(true);
      selection.removeAllRanges();
      selection.addRange(newRange);
    }
  }

  editor.savedSelection = {
    type: "range",
    range: selection.getRangeAt(0).cloneRange(),
  };
  editor.syncToTextarea();
}

export function applyFormat(editor, tagStart, tagEnd, htmlWrapper) {
  if (editor.isCodeMode) {
    wrapText(editor, tagStart, tagEnd);
    return;
  }

  // Formato de texto en línea con API DOM moderna (sin document.execCommand)
  const inlineTag = INLINE_TAGS[tagStart];
  if (inlineTag) {
    applyInlineFormat(editor, inlineTag);
    return;
  }

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

  if (typeof htmlWrapper === "function") {
    htmlWrapper(range, selection);
  } else if (typeof htmlWrapper === "string") {
    const selectedContent = range.extractContents();
    const tempContainer = document.createElement("div");
    tempContainer.innerHTML = htmlWrapper;
    const targetNode = tempContainer.firstElementChild || tempContainer;

    const isMediaOrSelfClosing =
      targetNode.tagName.toLowerCase() === "img" ||
      targetNode.tagName.toLowerCase() === "lite-youtube";

    const isBlockElement =
      targetNode.classList.contains("spoiler") ||
      /^(div|blockquote|pre|lite-youtube|table|h[1-6]|ul|ol)$/i.test(
        targetNode.tagName
      );

    if (selectedContent.textContent.trim()) {
      if (targetNode.classList.contains("spoiler")) {
        const contentArea = targetNode.querySelector(".spoiler-content");
        if (contentArea) {
          contentArea.innerHTML = "";
          contentArea.appendChild(selectedContent);
          contentArea.style.display = "block";
          const toggleBtn = targetNode.querySelector(".spoiler-toggle");
          if (toggleBtn) toggleBtn.textContent = "Ocultar Spoiler";
        }
      } else {
        targetNode.appendChild(selectedContent);
      }
    } else if (!targetNode.innerHTML.trim() && !isMediaOrSelfClosing) {
      targetNode.innerHTML = "<br>";
    }

    range.insertNode(targetNode);

    // Si el elemento insertado es un bloque y no hay un elemento posterior para escribir, crear un párrafo editable
    let nextCaretTarget = targetNode;
    if (isBlockElement) {
      let nextSibling = targetNode.nextSibling;
      if (!nextSibling || (nextSibling.nodeType === Node.TEXT_NODE && !nextSibling.textContent.trim())) {
        const nextParagraph = document.createElement("p");
        nextParagraph.innerHTML = "<br>";
        if (nextSibling) {
          targetNode.parentNode.insertBefore(nextParagraph, nextSibling);
        } else {
          targetNode.parentNode.appendChild(nextParagraph);
        }
        nextCaretTarget = nextParagraph;
      }
    }

    const newRange = document.createRange();
    if (targetNode.classList.contains("spoiler")) {
      const contentArea = targetNode.querySelector(".spoiler-content");
      if (contentArea) {
        if (!contentArea.innerHTML.trim()) {
          contentArea.innerHTML = "<br>";
        }
        newRange.setStart(contentArea, 0);
        newRange.collapse(true);
      } else {
        newRange.setStartAfter(targetNode);
        newRange.collapse(true);
      }
    } else if (
      nextCaretTarget !== targetNode &&
      nextCaretTarget.tagName?.toLowerCase() === "p"
    ) {
      newRange.setStart(nextCaretTarget, 0);
      newRange.collapse(true);
    } else {
      newRange.setStartAfter(targetNode);
      newRange.collapse(true);
    }

    selection.removeAllRanges();
    selection.addRange(newRange);

    editor.savedSelection = {
      type: "range",
      range: newRange.cloneRange(),
    };
  }

  editor.syncToTextarea();
  spoilers(editor);
}
