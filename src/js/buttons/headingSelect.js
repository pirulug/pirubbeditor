import { applyFormat } from "../utils/formatHelper.js";

export default function createHeadingSelect(editor) {
  const select = document.createElement("select");
  select.className = "pirubbeditor__select";
  select.title = "Encabezados";

  const options = [
    { value: "", label: "Encabezado" },
    { value: "h1", label: "Encabezado 1 (H1)" },
    { value: "h2", label: "Encabezado 2 (H2)" },
    { value: "h3", label: "Encabezado 3 (H3)" },
    { value: "h4", label: "Encabezado 4 (H4)" },
    { value: "h5", label: "Encabezado 5 (H5)" },
    { value: "h6", label: "Encabezado 6 (H6)" },
  ];

  options.forEach((opt) => {
    const option = document.createElement("option");
    option.value = opt.value;
    option.textContent = opt.label;
    select.appendChild(option);
  });

  select.addEventListener("focus", () => {
    editor.saveSelection();
  });

  select.addEventListener("mousedown", () => {
    editor.saveSelection();
  });

  select.addEventListener("change", () => {
    const tag = select.value;
    if (!tag) return;

    applyFormat(
      editor,
      `[${tag}]`,
      `[/${tag}]`,
      `<${tag}></${tag}>`
    );

    select.value = "";
  });

  return select;
}
