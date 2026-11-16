import {
  escapeHTML,
  sanitizeUrl,
  sanitizeCssDimension,
  sanitizeColor,
  sanitizeFontSize,
  sanitizeYouTubeId,
} from "./sanitize.js";

function buildMediaStyle(attrs) {
  const widthMatch = attrs.match(/width=([^\s\]]+)/i);
  const heightMatch = attrs.match(/height=([^\s\]]+)/i);
  const alignMatch = attrs.match(/align=([^\s\]]+)/i);
  let style = "";

  if (widthMatch) {
    const w = sanitizeCssDimension(widthMatch[1]);
    if (w) style += `width:${w};`;
  }
  if (heightMatch) {
    const h = sanitizeCssDimension(heightMatch[1]);
    if (h) style += `height:${h};`;
  }
  if (alignMatch) {
    const a = alignMatch[1].replace(/["']/g, "").trim().toLowerCase();
    if (a === "left") style += "float:left;margin:0 1rem 0.5rem 0;display:inline-block;";
    else if (a === "right") style += "float:right;margin:0 0 0.5rem 1rem;display:inline-block;";
    else if (a === "center") style += "display:block;margin:0.5rem auto;";
  }

  return style;
}

export default function convertToHTML(bbcode) {
  if (!bbcode) return "";

  const codeBlocks = [];
  let html = String(bbcode);

  // 1. Extraer bloques [code] antes de escapar/procesar para preservar su contenido literal
  html = html.replace(
    /\[code(?:=([a-zA-Z0-9_-]+))?\]([\s\S]*?)\[\/code\]/gis,
    (match, lang, codeContent) => {
      const safeLang = lang ? lang.replace(/[^a-zA-Z0-9_-]/g, "") : "";
      const classAttr = safeLang && safeLang !== "markup" ? ` class="language-${safeLang}"` : "";
      const placeholder = `\u0000PIRUCODE_${codeBlocks.length}\u0000`;
      codeBlocks.push(`<pre><code${classAttr}>${escapeHTML(codeContent)}</code></pre>`);
      return placeholder;
    }
  );

  // 2. Escapar cualquier HTML crudo en el texto de entrada (prevención XSS)
  html = escapeHTML(html);

  // Encabezados
  html = html
    .replace(/\[h1\](.*?)\[\/h1\]/gis, "<h1>$1</h1>")
    .replace(/\[h2\](.*?)\[\/h2\]/gis, "<h2>$1</h2>")
    .replace(/\[h3\](.*?)\[\/h3\]/gis, "<h3>$1</h3>")
    .replace(/\[h4\](.*?)\[\/h4\]/gis, "<h4>$1</h4>")
    .replace(/\[h5\](.*?)\[\/h5\]/gis, "<h5>$1</h5>")
    .replace(/\[h6\](.*?)\[\/h6\]/gis, "<h6>$1</h6>");

  // Formato de texto básico
  html = html
    .replace(/\[b\](.*?)\[\/b\]/gis, "<strong>$1</strong>")
    .replace(/\[i\](.*?)\[\/i\]/gis, "<em>$1</em>")
    .replace(/\[u\](.*?)\[\/u\]/gis, "<u>$1</u>")
    .replace(/\[s\](.*?)\[\/s\]/gis, "<s>$1</s>");

  // Enlaces
  html = html
    .replace(/\[url=(.*?)\](.*?)\[\/url\]/gis, (match, rawUrl, label) => {
      const safeUrl = sanitizeUrl(rawUrl);
      if (!safeUrl) return label;
      return `<a href="${safeUrl}" target="_blank" rel="noopener noreferrer">${label}</a>`;
    })
    .replace(/\[url\](.*?)\[\/url\]/gis, (match, rawUrl) => {
      const safeUrl = sanitizeUrl(rawUrl);
      if (!safeUrl) return rawUrl;
      return `<a href="${safeUrl}" target="_blank" rel="noopener noreferrer">${safeUrl}</a>`;
    });

  // Imágenes con dimensiones o simples
  html = html
    .replace(
      /\[img=(\d+)[xX](\d+)\](.*?)\[\/img\]/gis,
      (match, w, h, src) => {
        const safeSrc = sanitizeUrl(src);
        if (!safeSrc) return "";
        return `<img src="${safeSrc}" style="width:${w}px;height:${h}px;" alt="Image">`;
      }
    )
    .replace(/\[img\s+([^\]]+)\](.*?)\[\/img\]/gis, (match, attrs, src) => {
      const safeSrc = sanitizeUrl(src);
      if (!safeSrc) return "";
      const style = buildMediaStyle(attrs);
      const styleAttr = style ? ` style="${style}"` : "";
      return `<img src="${safeSrc}"${styleAttr} alt="Image">`;
    })
    .replace(/\[img\](.*?)\[\/img\]/gis, (match, src) => {
      const safeSrc = sanitizeUrl(src);
      if (!safeSrc) return "";
      return `<img src="${safeSrc}" alt="Image">`;
    });

  // Color y tamaño
  html = html
    .replace(/\[color=(.*?)\](.*?)\[\/color\]/gis, (match, rawColor, content) => {
      const safeColor = sanitizeColor(rawColor);
      if (!safeColor) return content;
      return `<span style="color:${safeColor}">${content}</span>`;
    })
    .replace(/\[size=(.*?)\](.*?)\[\/size\]/gis, (match, size, content) => {
      const safeSize = sanitizeFontSize(size);
      if (!safeSize) return content;
      return `<span style="font-size:${safeSize}">${content}</span>`;
    });

  // Spoilers, YouTube, JDownloader, VIP
  html = html
    .replace(
      /\[spoiler\](.*?)\[\/spoiler\]/gis,
      '<div class="spoiler"><button type="button" class="spoiler-toggle" contenteditable="false">Mostrar Spoiler</button><div class="spoiler-content" style="display:none;">$1</div></div>'
    )
    .replace(
      /\[youtube=(\d+)[xX](\d+)\](.*?)\[\/youtube\]/gis,
      (match, w, h, id) => {
        const safeId = sanitizeYouTubeId(id);
        if (!safeId) return "";
        return `<lite-youtube contenteditable="false" videoid="${safeId}" style="width:${w}px;height:${h}px;max-width:100%;"></lite-youtube>`;
      }
    )
    .replace(/\[youtube\s+([^\]]+)\](.*?)\[\/youtube\]/gis, (match, attrs, id) => {
      const safeId = sanitizeYouTubeId(id);
      if (!safeId) return "";
      const widthMatch = attrs.match(/width=([^\s\]]+)/i);
      const heightMatch = attrs.match(/height=([^\s\]]+)/i);
      let style = "max-width:100%;";
      if (widthMatch) {
        const w = sanitizeCssDimension(widthMatch[1]);
        if (w) style += `width:${w};`;
      }
      if (heightMatch) {
        const h = sanitizeCssDimension(heightMatch[1]);
        if (h) style += `height:${h};`;
      }
      return `<lite-youtube contenteditable="false" videoid="${safeId}" style="${style}"></lite-youtube>`;
    })
    .replace(/\[youtube\](.*?)\[\/youtube\]/gis, (match, id) => {
      const safeId = sanitizeYouTubeId(id);
      if (!safeId) return "";
      return `<lite-youtube contenteditable="false" videoid="${safeId}"></lite-youtube>`;
    })
    .replace(
      /\[jdownloader=(.*?)\](.*?)\[\/jdownloader\]/gis,
      (match, rawUrl, label) => {
        const safeUrl = sanitizeUrl(rawUrl);
        if (!safeUrl) return label;
        return `<a href="${safeUrl}" class="jdownloader-link" target="_blank" rel="noopener noreferrer">${label}</a>`;
      }
    )
    .replace(/\[jdownloader\](.*?)\[\/jdownloader\]/gis, (match, rawUrl) => {
      const safeUrl = sanitizeUrl(rawUrl);
      if (!safeUrl) return rawUrl;
      return `<a href="${safeUrl}" class="jdownloader-link" target="_blank" rel="noopener noreferrer">Descargar con JDownloader</a>`;
    })
    .replace(
      /\[vip\]([\s\S]*?)\[\/vip\]/gis,
      '<div class="vip-box"><div class="vip-header" contenteditable="false"><i class="fas fa-star"></i> Contenido VIP</div><div class="vip-content">$1</div></div>'
    );

  // Citas
  html = html.replace(/\[quote\](.*?)\[\/quote\]/gis, "<blockquote>$1</blockquote>");

  // Alineaciones
  html = html
    .replace(/\[left\](.*?)\[\/left\]/gis, '<div style="text-align:left">$1</div>')
    .replace(/\[center\](.*?)\[\/center\]/gis, '<div style="text-align:center">$1</div>')
    .replace(/\[right\](.*?)\[\/right\]/gis, '<div style="text-align:right">$1</div>');

  // Listas limpias sin saltos de línea internos ni etiquetas br
  html = html
    .replace(/\[ul\]([\s\S]*?)\[\/ul\]/gis, (match, content) => {
      const items = content
        .replace(/\[li\]([\s\S]*?)\[\/li\]/gis, (m, liContent) => `<li>${liContent.trim()}</li>`)
        .replace(/[\r\n]+/g, "")
        .trim();
      return `<ul>${items}</ul>`;
    })
    .replace(/\[ol\]([\s\S]*?)\[\/ol\]/gis, (match, content) => {
      const items = content
        .replace(/\[li\]([\s\S]*?)\[\/li\]/gis, (m, liContent) => `<li>${liContent.trim()}</li>`)
        .replace(/[\r\n]+/g, "")
        .trim();
      return `<ol>${items}</ol>`;
    })
    .replace(/\[li\](.*?)\[\/li\]/gis, "<li>$1</li>");

  // Conversión de saltos de línea restantes a <br>
  html = html.replace(/\n/g, "<br>");

  // Limpieza de <br> innecesarios alrededor y dentro de listas y elementos de bloque
  html = html
    .replace(/<(ul|ol)>\s*<br\s*\/?>/gi, "<$1>")
    .replace(/<br\s*\/?>\s*<\/(ul|ol)>/gi, "</$1>")
    .replace(/<\/(li|ul|ol|h[1-6]|blockquote|pre|div)>\s*<br\s*\/?>/gi, "</$1>")
    .replace(/<br\s*\/?>\s*<(li|ul|ol|h[1-6]|blockquote|pre|div)/gi, "<$1");

  // 3. Restaurar bloques [code] (conservando saltos de línea naturales dentro de <pre><code>)
  if (codeBlocks.length > 0) {
    html = html.replace(/\u0000PIRUCODE_(\d+)\u0000/g, (match, idx) => {
      return codeBlocks[Number(idx)] ?? "";
    });
    html = html
      .replace(/<\/pre>\s*<br\s*\/?>/gi, "</pre>")
      .replace(/<br\s*\/?>\s*<pre>/gi, "<pre>");
  }

  return html;
}
