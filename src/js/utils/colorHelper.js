export function colorToHex(color) {
  if (!color) return "";
  const trimmed = color.trim();

  // Si ya es formato hexadecimal (#fff o #ffffff)
  if (/^#([0-9A-Fa-f]{3}){1,2}$/.test(trimmed)) {
    if (trimmed.length === 4) {
      return `#${trimmed[1]}${trimmed[1]}${trimmed[2]}${trimmed[2]}${trimmed[3]}${trimmed[3]}`.toLowerCase();
    }
    return trimmed.toLowerCase();
  }

  // Si es formato rgb(r, g, b) o rgba(r, g, b, a)
  const rgbMatch = trimmed.match(
    /^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})/i
  );
  if (rgbMatch) {
    const r = Math.min(255, parseInt(rgbMatch[1], 10))
      .toString(16)
      .padStart(2, "0");
    const g = Math.min(255, parseInt(rgbMatch[2], 10))
      .toString(16)
      .padStart(2, "0");
    const b = Math.min(255, parseInt(rgbMatch[3], 10))
      .toString(16)
      .padStart(2, "0");
    return `#${r}${g}${b}`.toLowerCase();
  }

  return trimmed;
}
