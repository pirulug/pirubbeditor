const HTML_ESCAPE_MAP = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

export function escapeHTML(str) {
  if (typeof str !== "string") return "";
  return str.replace(/[&<>"']/g, (ch) => HTML_ESCAPE_MAP[ch]);
}

export function decodeBasicEntities(str) {
  if (typeof str !== "string") return "";
  return str
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">");
}

export function sanitizeUrl(rawUrl) {
  if (typeof rawUrl !== "string") return "";
  const decoded = decodeBasicEntities(rawUrl).trim();
  if (!decoded) return "";

  // Bloquear caracteres de control o espacios ocultos antes del protocolo
  const normalized = decoded.replace(/[\u0000-\u001F\u007F\s]+/g, "");

  // Permitir rutas relativas seguras (#, /, ./, ../)
  if (
    normalized.startsWith("#") ||
    normalized.startsWith("/") ||
    normalized.startsWith("./") ||
    normalized.startsWith("../")
  ) {
    // Evitar //protocol-relative si no es deseado? // es válido en web, pero sin javascript:
    return escapeHTML(decoded);
  }

  // Si tiene esquema explícito, permitir solo http, https y mailto
  const schemeMatch = normalized.match(/^([a-zA-Z][a-zA-Z0-9+.-]*):/);
  if (schemeMatch) {
    const scheme = schemeMatch[1].toLowerCase();
    if (scheme === "http" || scheme === "https" || scheme === "mailto") {
      return escapeHTML(decoded);
    }
    return "";
  }

  // Sin esquema (ej. "ejemplo.com/ruta"): seguro
  return escapeHTML(decoded);
}

export function sanitizeCssDimension(rawVal) {
  if (typeof rawVal !== "string") return "";
  const clean = decodeBasicEntities(rawVal).replace(/["']/g, "").trim();
  if (!clean) return "";
  if (clean.toLowerCase() === "auto") return "auto";
  if (/^\d+$/.test(clean)) return `${clean}px`;
  if (/^\d+(?:\.\d+)?(?:px|%|em|rem|pt)$/i.test(clean)) return clean;
  return "";
}

export function sanitizeColor(rawColor) {
  if (typeof rawColor !== "string") return "";
  const clean = decodeBasicEntities(rawColor).replace(/["']/g, "").trim();
  if (!clean) return "";

  if (/^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(clean)) {
    return clean;
  }
  if (/^[a-zA-Z]{1,30}$/.test(clean)) {
    return clean;
  }
  if (/^rgba?\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}(?:\s*,\s*(?:0|1|0?\.\d+))?\s*\)$/.test(clean)) {
    return clean;
  }
  return "";
}

export function sanitizeFontSize(rawSize) {
  if (typeof rawSize !== "string") return "";
  const clean = decodeBasicEntities(rawSize).replace(/["']/g, "").trim();
  if (!clean) return "";
  if (/^\d+$/.test(clean)) return `${clean}px`;
  if (/^\d+(?:\.\d+)?(?:px|em|rem|%|pt)$/i.test(clean)) return clean;
  return "";
}

export function sanitizeYouTubeId(rawId) {
  if (typeof rawId !== "string") return "";
  const clean = decodeBasicEntities(rawId).trim();
  return /^[a-zA-Z0-9_-]{6,20}$/.test(clean) ? clean : "";
}
