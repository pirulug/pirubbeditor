import { colorToHex } from "./colorHelper.js";

function getMediaTagAttrs(node) {
  const attrs = [];
  const styleWidth = node.style?.width || node.getAttribute("width") || "";
  const styleHeight = node.style?.height || node.getAttribute("height") || "";
  const cleanWidth = styleWidth.replace("px", "").trim();
  const cleanHeight = styleHeight.replace("px", "").trim();

  if (cleanWidth && cleanWidth !== "auto") {
    attrs.push(`width=${cleanWidth}`);
  }
  if (cleanHeight && cleanHeight !== "auto") {
    attrs.push(`height=${cleanHeight}`);
  }

  const floatVal = node.style?.float || "";
  const displayVal = node.style?.display || "";
  const marginVal = node.style?.margin || "";
  const marginLeft = node.style?.marginLeft || "";
  const marginRight = node.style?.marginRight || "";

  if (floatVal === "left") {
    attrs.push("align=left");
  } else if (floatVal === "right") {
    attrs.push("align=right");
  } else if (
    (displayVal === "block" &&
      (marginVal.includes("auto") ||
        (marginLeft === "auto" && marginRight === "auto"))) ||
    node.getAttribute("align") === "center"
  ) {
    attrs.push("align=center");
  }

  return attrs.length ? ` ${attrs.join(" ")}` : "";
}

export default function convertToBBCode(html) {
  if (!html) return "";

  const container = document.createElement("div");
  container.innerHTML = html;

  function parseNode(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      return node.nodeValue;
    }

    if (node.nodeType !== Node.ELEMENT_NODE) {
      return "";
    }

    const tagName = node.tagName.toLowerCase();

    // Ignorar encabezados no editables (toggle de spoiler y header VIP)
    if (
      node.classList.contains("spoiler-toggle") ||
      node.classList.contains("vip-header")
    ) {
      return "";
    }

    // Contenedor principal de spoiler: procesar todos sus nodos internos
    if (node.classList.contains("spoiler")) {
      let spoilerInner = "";
      node.childNodes.forEach((child) => {
        if (
          child.nodeType === Node.ELEMENT_NODE &&
          child.classList.contains("spoiler-toggle")
        ) {
          return;
        }
        spoilerInner += parseNode(child);
      });
      return `\n[spoiler]${spoilerInner.trim()}[/spoiler]\n`;
    }

    // Contenedor principal de VIP: procesar todos sus nodos internos
    if (node.classList.contains("vip-box")) {
      let vipInner = "";
      node.childNodes.forEach((child) => {
        if (
          child.nodeType === Node.ELEMENT_NODE &&
          child.classList.contains("vip-header")
        ) {
          return;
        }
        vipInner += parseNode(child);
      });
      return `\n[vip]${vipInner.trim()}[/vip]\n`;
    }

    // Bloques de contenido interno (spoiler o vip)
    if (
      node.classList.contains("spoiler-content") ||
      node.classList.contains("vip-content")
    ) {
      return `${parseChildren(node)}\n`;
    }

    // Lite YouTube
    if (tagName === "lite-youtube") {
      const videoId = node.getAttribute("videoid") || "";
      if (!videoId) return "";
      const attrStr = getMediaTagAttrs(node);
      return `\n[youtube${attrStr}]${videoId}[/youtube]\n`;
    }

    // Insignia VIP
    if (node.classList.contains("vip")) {
      return `[vip]${parseChildren(node)}[/vip]`;
    }

    const inner = parseChildren(node);

    // Color y tamaño en span
    if (tagName === "span") {
      let result = inner;
      if (node.style.color) {
        const hexColor = colorToHex(node.style.color);
        result = `[color=${hexColor}]${result}[/color]`;
      }
      if (node.style.fontSize) {
        const size = node.style.fontSize.replace("px", "").trim();
        result = `[size=${size}]${result}[/size]`;
      }
      return result;
    }

    let result = "";

    switch (tagName) {
      case "h1":
      case "h2":
      case "h3":
      case "h4":
      case "h5":
      case "h6":
        result = `\n[${tagName}]${inner.trim()}[/${tagName}]\n`;
        break;
      case "strong":
      case "b":
        return `[b]${inner}[/b]`;
      case "em":
      case "i":
        return `[i]${inner}[/i]`;
      case "u":
        return `[u]${inner}[/u]`;
      case "s":
      case "strike":
      case "del":
        return `[s]${inner}[/s]`;
      case "a": {
        const href = node.getAttribute("href") || "";
        if (node.classList.contains("jdownloader-link")) {
          const trimmedInner = inner.trim();
          if (
            !trimmedInner ||
            trimmedInner === "Descargar con JDownloader" ||
            trimmedInner === href.trim()
          ) {
            return `[jdownloader]${href}[/jdownloader]`;
          }
          return `[jdownloader=${href}]${inner}[/jdownloader]`;
        }
        if (inner.trim() === href.trim()) {
          return `[url]${href}[/url]`;
        }
        return `[url=${href}]${inner}[/url]`;
      }
      case "img": {
        const src = node.getAttribute("src") || "";
        if (!src) return "";
        const attrStr = getMediaTagAttrs(node);
        return `[img${attrStr}]${src}[/img]`;
      }
      case "blockquote":
        result = `\n[quote]${inner.trim()}[/quote]\n`;
        break;
      case "pre": {
        const codeNode = node.querySelector("code");
        const codeText = codeNode ? codeNode.textContent : inner;
        return `\n[code]${codeText.trim()}[/code]\n`;
      }
      case "code":
        return `[code]${inner}[/code]`;
      case "ol":
        return `\n[ol]\n${inner.trim()}\n[/ol]\n`;
      case "ul":
        return `\n[ul]\n${inner.trim()}\n[/ul]\n`;
      case "li":
        return `[li]${inner.trim()}[/li]\n`;
      case "p":
      case "div":
        result = inner ? `\n${inner.trim()}\n` : "\n";
        break;
      case "br":
        return "\n";
      default:
        result = inner;
        break;
    }

    // Color en elementos distintos de span si tienen estilo directo
    if (tagName !== "span" && node.style && node.style.color) {
      const hexColor = colorToHex(node.style.color);
      result = `[color=${hexColor}]${result}[/color]`;
    }

    // Alineaciones de texto
    const textAlign = node.style ? node.style.textAlign : "";
    if (textAlign === "center") {
      return `\n[center]${result.trim()}[/center]\n`;
    }
    if (textAlign === "right") {
      return `\n[right]${result.trim()}[/right]\n`;
    }
    if (
      textAlign === "left" &&
      (tagName === "div" || tagName === "p" || tagName.startsWith("h"))
    ) {
      return `\n[left]${result.trim()}[/left]\n`;
    }

    return result;
  }

  function parseChildren(parentNode) {
    let result = "";
    parentNode.childNodes.forEach((child) => {
      result += parseNode(child);
    });
    return result;
  }

  return parseChildren(container)
    .replace(/\u200B/g, "")
    .replace(/\[(b|i|u|s)\]\s*\[\/\1\]/gi, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
