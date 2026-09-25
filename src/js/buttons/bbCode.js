import wrapText from "../utils/wrapText.js";

export default function createBBCodeButton(
  editor,
  name,
  tagStart,
  tagEnd,
  iconClass = null,
  svgPath = null
) {
  const button = document.createElement("button");
  button.type = "button";
  button.title = name;
  button.innerHTML = svgPath || `<i class="${iconClass}"></i>`;
  button.addEventListener("click", () => wrapText(editor, tagStart, tagEnd));
  return button;
}
