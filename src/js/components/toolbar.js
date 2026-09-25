// Buttons
import bbCodeButton from "../buttons/bbCode.js";
import createHeadingSelect from "../buttons/headingSelect.js";
import alignButton from "../buttons/align.js";
import colorButton from "../buttons/color.js";
import imageButton from "../buttons/image.js";
import sizeButton from "../buttons/size.js";
import urlButton from "../buttons/url.js";
import youTubeButton from "../buttons/youtube.js";
import createJDownloaderButton from "../buttons/jdownloader.js";
import codeButton from "./codeToggle.js";

// IMG
import shortIcon from "../../img/short.svg";

export default function toolbar(editor) {
  const toolbarButtons = {
    heading: () => createHeadingSelect(editor),
    headings: () => createHeadingSelect(editor),
    head: () => createHeadingSelect(editor),
    h1: () =>
      bbCodeButton(editor, "H1", "[h1]", "[/h1]", "fa-solid fa-heading fa-2xl"),
    h2: () =>
      bbCodeButton(editor, "H2", "[h2]", "[/h2]", "fa-solid fa-heading fa-xl"),
    h3: () =>
      bbCodeButton(editor, "H3", "[h3]", "[/h3]", "fa-solid fa-heading fa-lg"),
    h4: () =>
      bbCodeButton(editor, "H4", "[h4]", "[/h4]", "fa-solid fa-heading fa-sm"),
    h5: () =>
      bbCodeButton(editor, "H5", "[h5]", "[/h5]", "fa-solid fa-heading fa-xs"),
    h6: () =>
      bbCodeButton(editor, "H6", "[h6]", "[/h6]", "fa-solid fa-heading fa-2xs"),
    bold: () => bbCodeButton(editor, "Negrita", "[b]", "[/b]", "fas fa-bold"),
    italic: () =>
      bbCodeButton(editor, "Cursiva", "[i]", "[/i]", "fas fa-italic"),
    underline: () =>
      bbCodeButton(editor, "Subrayado", "[u]", "[/u]", "fas fa-underline"),
    strike: () =>
      bbCodeButton(editor, "Tachado", "[s]", "[/s]", "fas fa-strikethrough"),
    quote: () =>
      bbCodeButton(editor, "Cita", "[quote]", "[/quote]", "fa fa-quote-left"),
    ol: () =>
      bbCodeButton(editor, "Lista Ordenada", "[ol]", "[/ol]", "fas fa-list-ol"),
    ul: () =>
      bbCodeButton(
        editor,
        "Lista Desordenada",
        "[ul]",
        "[/ul]",
        "fas fa-list-ul"
      ),
    li: () =>
      bbCodeButton(editor, "Elemento de Lista", "[li]", "[/li]", "fas fa-list"),
    left: () =>
      alignButton(
        editor,
        "left",
        "Alinear a la Izquierda",
        "fas fa-align-left"
      ),
    center: () =>
      alignButton(
        editor,
        "center",
        "Centrar",
        "fas fa-align-center"
      ),
    right: () =>
      alignButton(
        editor,
        "right",
        "Alinear a la Derecha",
        "fas fa-align-right"
      ),
    url: () => urlButton(editor),
    short: () =>
      bbCodeButton(
        editor,
        "Acortado",
        "[short]",
        "[/short]",
        null,
        shortIcon
      ),
    image: () => imageButton(editor),
    color: () => colorButton(editor),
    size: () => sizeButton(editor),
    spoiler: () =>
      bbCodeButton(
        editor,
        "Spoiler",
        "[spoiler]",
        "[/spoiler]",
        "fas fa-eye-slash"
      ),
    jdownloader: () => createJDownloaderButton(editor),
    vip: () => bbCodeButton(editor, "Vip", "[vip]", "[/vip]", "fas fa-star"),
    youtube: () => youTubeButton(editor),
    code: () => codeButton(editor),
    preview: () => codeButton(editor),
  };

  editor.toolbarOptions.forEach((option) => {
    if (toolbarButtons[option]) {
      editor.toolbar.appendChild(toolbarButtons[option]());
    }
  });
}
