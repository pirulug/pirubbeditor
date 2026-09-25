export default function convertToHTML(bbcode) {
  if (!bbcode) return "";

  let html = bbcode;

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
    .replace(
      /\[url=(.*?)\](.*?)\[\/url\]/gis,
      "<a href=\"$1\" target=\"_blank\" rel=\"noopener noreferrer\">$2</a>"
    )
    .replace(
      /\[url\](.*?)\[\/url\]/gis,
      "<a href=\"$1\" target=\"_blank\" rel=\"noopener noreferrer\">$1</a>"
    );

  // Imágenes con dimensiones o simples
  html = html
    .replace(
      /\[img=(\d+)[xX](\d+)\](.*?)\[\/img\]/gis,
      (match, w, h, src) =>
        `<img src="${src.trim()}" style="width:${w}px;height:${h}px;" alt="Image">`
    )
    .replace(
      /\[img\s+([^\]]+)\](.*?)\[\/img\]/gis,
      (match, attrs, src) => {
        const widthMatch = attrs.match(/width=([^\s\]]+)/i);
        const heightMatch = attrs.match(/height=([^\s\]]+)/i);
        const alignMatch = attrs.match(/align=([^\s\]]+)/i);
        let style = "";
        if (widthMatch) {
          const w = widthMatch[1].replace(/["']/g, "").trim();
          style += `width:${/^\d+$/.test(w) ? w + "px" : w};`;
        }
        if (heightMatch) {
          const h = heightMatch[1].replace(/["']/g, "").trim();
          style += `height:${/^\d+$/.test(h) ? h + "px" : h};`;
        }
        if (alignMatch) {
          const a = alignMatch[1].replace(/["']/g, "").trim().toLowerCase();
          if (a === "left") style += "float:left;margin:0 1rem 0.5rem 0;display:inline-block;";
          else if (a === "right") style += "float:right;margin:0 0 0.5rem 1rem;display:inline-block;";
          else if (a === "center") style += "display:block;margin:0.5rem auto;";
        }
        const styleAttr = style ? ` style="${style}"` : "";
        return `<img src="${src.trim()}"${styleAttr} alt="Image">`;
      }
    )
    .replace(/\[img\](.*?)\[\/img\]/gis, "<img src=\"$1\" alt=\"Image\">");

  // Color y tamaño
  html = html
    .replace(
      /\[color=(.*?)\](.*?)\[\/color\]/gis,
      "<span style=\"color:$1\">$2</span>"
    )
    .replace(
      /\[size=(.*?)\](.*?)\[\/size\]/gis,
      (match, size, content) => {
        const cleanSize = size.trim();
        const fontSize = /^\d+$/.test(cleanSize) ? `${cleanSize}px` : cleanSize;
        return `<span style=\"font-size:${fontSize}\">${content}</span>`;
      }
    );

  // Spoilers, YouTube, JDownloader, VIP
  html = html
    .replace(
      /\[spoiler\](.*?)\[\/spoiler\]/gis,
      "<div class=\"spoiler\"><button type=\"button\" class=\"spoiler-toggle\" contenteditable=\"false\">Mostrar Spoiler</button><div class=\"spoiler-content\" style=\"display:none;\">$1</div></div>"
    )
    .replace(
      /\[youtube=(\d+)[xX](\d+)\](.*?)\[\/youtube\]/gis,
      (match, w, h, id) =>
        `<lite-youtube contenteditable="false" videoid="${id.trim()}" style="width:${w}px;height:${h}px;max-width:100%;"></lite-youtube>`
    )
    .replace(
      /\[youtube\s+([^\]]+)\](.*?)\[\/youtube\]/gis,
      (match, attrs, id) => {
        const widthMatch = attrs.match(/width=([^\s\]]+)/i);
        const heightMatch = attrs.match(/height=([^\s\]]+)/i);
        let style = "max-width:100%;";
        if (widthMatch) {
          const w = widthMatch[1].replace(/["']/g, "").trim();
          style += `width:${/^\d+$/.test(w) ? w + "px" : w};`;
        }
        if (heightMatch) {
          const h = heightMatch[1].replace(/["']/g, "").trim();
          style += `height:${/^\d+$/.test(h) ? h + "px" : h};`;
        }
        return `<lite-youtube contenteditable="false" videoid="${id.trim()}" style="${style}"></lite-youtube>`;
      }
    )
    .replace(
      /\[youtube\](.*?)\[\/youtube\]/gis,
      "<lite-youtube contenteditable=\"false\" videoid=\"$1\"></lite-youtube>"
    )
    .replace(
      /\[jdownloader=(.*?)\](.*?)\[\/jdownloader\]/gis,
      "<a href=\"$1\" class=\"jdownloader-link\" target=\"_blank\" rel=\"noopener noreferrer\">$2</a>"
    )
    .replace(
      /\[jdownloader\](.*?)\[\/jdownloader\]/gis,
      "<a href=\"$1\" class=\"jdownloader-link\" target=\"_blank\" rel=\"noopener noreferrer\">Descargar con JDownloader</a>"
    )
    .replace(
      /\[vip\]([\s\S]*?)\[\/vip\]/gis,
      "<div class=\"vip-box\"><div class=\"vip-header\" contenteditable=\"false\"><i class=\"fas fa-star\"></i> Contenido VIP</div><div class=\"vip-content\">$1</div></div>"
    );

  // Bloques de código y citas
  html = html
    .replace(/\[code\](.*?)\[\/code\]/gis, "<pre><code>$1</code></pre>")
    .replace(/\[quote\](.*?)\[\/quote\]/gis, "<blockquote>$1</blockquote>");

  // Alineaciones
  html = html
    .replace(
      /\[left\](.*?)\[\/left\]/gis,
      "<div style=\"text-align:left\">$1</div>"
    )
    .replace(
      /\[center\](.*?)\[\/center\]/gis,
      "<div style=\"text-align:center\">$1</div>"
    )
    .replace(
      /\[right\](.*?)\[\/right\]/gis,
      "<div style=\"text-align:right\">$1</div>"
    );

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

  return html;
}
