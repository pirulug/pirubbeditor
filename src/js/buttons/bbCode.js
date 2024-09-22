import wrapText from "../utils/wrapText";

export default function createBBCodeButton(
  editor,
  name,
  tagStart,
  tagEnd,
  iconClass = null,
  svgPath = null
) {
  const button = document.createElement("button");
  if (svgPath) {
    button.innerHTML = svgPath;
  } else {
    button.innerHTML = `<i class="${iconClass}"></i>`;
  }
  button.title = name;
  button.type = "button";
  button.addEventListener("click", () => wrapText(editor, tagStart, tagEnd));
  return button;
}
